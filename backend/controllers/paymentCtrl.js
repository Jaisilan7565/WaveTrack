const Payment = require("../models/Payment");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const paymentController = {
  //Create a new payment
  createPayment: asyncHandler(async (req, res, next) => {
    const {
      subscriberId,
      transactionType,
      transactionMode,
      transactionDate,
      activationDate,
      expiryDate,
      amount,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      subscriberId,
      transactionType,
      transactionMode,
      transactionDate,
      activationDate,
      expiryDate,
      amount,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(
        new ErrorResponse(
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        )
      );
    }

    // Generate unique transactionId (format: TR-XXXXX)
    const generateTransactionId = async () => {
      const prefix = "TR-";
      const randomSuffix = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      const transactionId = prefix + randomSuffix;

      // Check if ID already exists
      const exists = await Payment.findOne({ transactionId });
      return exists ? await generateTransactionId() : transactionId;
    };

    let newStatus;
    if (transactionType === "Income") {
      newStatus = "Received";
    } else if (transactionType === "Expense") {
      newStatus = "Paid";
    }

    try {
      // Parse dates - handle both ISO strings and existing Date objects
      const parseDate = (dateString) => {
        if (!dateString) return null;
        // If it's already a Date object (from testing), return as is
        if (dateString instanceof Date) return dateString;
        // Try ISO format first
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;
        // Try other formats if needed
        return null;
      };

      const parsedActivationDate = parseDate(activationDate);
      const parsedExpiryDate = parseDate(expiryDate);
      const parsedTransactionDate = parseDate(transactionDate);

      if (!parsedActivationDate) {
        return next(
          new ErrorResponse("Invalid ISP activation date format", 400)
        );
      }

      if (!parsedExpiryDate) {
        return next(new ErrorResponse("Invalid expiry date format", 400));
      }

      if (!parsedTransactionDate) {
        return next(new ErrorResponse("Invalid transaction date format", 400));
      }

      // Create payment data object
      const paymentData = {
        transactionId: await generateTransactionId(),
        subscriberId,
        transactionType,
        transactionMode,
        transactionDate,
        activationDate,
        expiryDate,
        amount,
        status: newStatus,
        request_status: "pending",
        created_by: req.user.id,
      };

      // Create new payment
      const payment = await Payment.create(paymentData);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      return next(
        new ErrorResponse(
          error.message || "Failed to create payment",
          error.statusCode || 500
        )
      );
    }
  }),

  getPayments: asyncHandler(async (req, res, next) => {
    try {
      const { status, transactionType } = req.query;
      let query = { isDeleted: false };

      if (status) query.status = status;
      if (transactionType) query.transactionType = transactionType;

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate({
          path: "subscriberId",
          select: "siteName siteCode siteAddress",
          model: "Subscriber",
        })
        .populate({
          path: "modifiedData.modified_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        })
        .populate({
          path: "created_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        })
        .populate({
          path: "decision_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        });

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  }),

  getPaymentsBySubscriberId: asyncHandler(async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.subId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      let query = { isDeleted: false, subscriberId: req.params.subId };

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate({
          path: "subscriberId",
          select: "siteName siteCode siteAddress",
          model: "Subscriber",
        })
        .populate({
          path: "created_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        })
        .populate({
          path: "decision_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        })
        .populate({
          path: "modifiedData.modified_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        });

      if (!payments) {
        return res
          .status(404)
          .json({ success: false, message: "Payments not found" });
      }

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  }),

  //Approve Payment
  approvePayment: asyncHandler(async (req, res, next) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      if (payment.request_status !== "pending") {
        return res.status(400).json({ message: "Payment already processed" });
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          decision_by: req.user.id,
          updatedAt: Date.now(),
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: updatedPayment,
        message: "Payment Approved Successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  //Reject Payment
  rejectPayment: asyncHandler(async (req, res, next) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      if (payment.request_status !== "pending") {
        return res.status(400).json({ message: "Request already processed" });
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          decision_by: req.user.id,
          updatedAt: Date.now(),
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: updatedPayment,
        message: "Payment Rejected Successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
};

module.exports = paymentController;
