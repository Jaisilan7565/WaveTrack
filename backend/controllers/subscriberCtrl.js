const Subscriber = require("../models/Subscriber");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const subscriberController = {
  //Create a new subscriber
  createSubscriber: asyncHandler(async (req, res, next) => {
    const {
      siteCode,
      siteName,
      siteAddress,
      localContact,
      ispInfo,
      activationDate,
      credentials,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      siteCode,
      siteName,
      siteAddress,
      localContact,
      ispInfo,
      activationDate,
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

    // Generate unique subscriber_id (format: SUB-XXXXX)
    const generateSubscriberId = async () => {
      const prefix = "SUB-";
      const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
      const subscriber_id = prefix + randomSuffix;

      // Check if ID already exists
      const exists = await Subscriber.findOne({ subscriber_id });
      return exists ? await generateSubscriberId() : subscriber_id;
    };

    // Check for duplicate siteCode or siteAddress
    const duplicateChecks = await Promise.all([
      Subscriber.findOne({ siteCode }),
      Subscriber.findOne({ siteAddress }),
    ]);

    const [existingSiteCode, existingSiteAddress] = duplicateChecks;

    if (existingSiteCode) {
      return next(new ErrorResponse("Site code already exists", 400));
    }

    if (existingSiteAddress) {
      return next(new ErrorResponse("Site address already exists", 400));
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

      const renewalDate = parseDate(ispInfo.renewalDate);
      const parsedActivationDate = parseDate(activationDate);

      if (!renewalDate) {
        return next(new ErrorResponse("Invalid ISP renewal date format", 400));
      }

      if (!parsedActivationDate) {
        return next(new ErrorResponse("Invalid activation date format", 400));
      }

      // Create subscriber data object
      const subscriberData = {
        subscriber_id: await generateSubscriberId(),
        siteCode,
        siteName,
        siteAddress,
        localContact,
        ispInfo: {
          ...ispInfo,
          currentActivationDate: parsedActivationDate,
          renewalDate,
        },
        credentials: credentials || {},
        activationDate: parsedActivationDate,
        status: "Added",
        request_status: "pending",
        created_by: req.user.id,
      };

      // Create new subscriber
      const subscriber = await Subscriber.create(subscriberData);

      res.status(201).json({
        success: true,
        data: subscriber,
      });
    } catch (error) {
      console.error("Error creating subscriber:", error);
      return next(
        new ErrorResponse(
          error.message || "Failed to create subscriber",
          error.statusCode || 500
        )
      );
    }
  }),

  createBulkSubscribers: asyncHandler(async (req, res, next) => {
    const { subscribers } = req.body;

    // Validate bulk payload structure
    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return next(
        new ErrorResponse(
          "Invalid bulk data format - expected array of subscribers",
          400
        )
      );
    }

    // Limit batch size to prevent overload
    if (subscribers.length > 100) {
      return next(
        new ErrorResponse("Maximum batch size exceeded (100 subscribers)", 400)
      );
    }

    // Validate basic structure of all subscribers first
    const structureErrors = subscribers
      .map((sub, index) => {
        if (!sub.siteName || !sub.siteCode || !sub.activationDate) {
          return {
            index,
            error:
              "Missing required fields (siteName, siteCode, activationDate)",
            data: sub,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (structureErrors.length > 0) {
      return next(
        new ErrorResponse(
          `${structureErrors.length} records failed structure validation`,
          400,
          { validationErrors: structureErrors }
        )
      );
    }

    // Check for duplicates within the current batch
    const batchDuplicates = findDuplicatesInBatch(subscribers);
    if (batchDuplicates.length > 0) {
      return next(
        new ErrorResponse(
          "Duplicate site codes or addresses within this batch",
          400,
          { duplicates: batchDuplicates }
        )
      );
    }

    // Process in transaction for atomic operations
    const session = await Subscriber.startSession();
    session.startTransaction();

    try {
      // Check for existing subscribers in database
      const existingSubscribers = await Subscriber.find({
        $or: [
          { siteCode: { $in: subscribers.map((s) => s.siteCode) } },
          { siteAddress: { $in: subscribers.map((s) => s.siteAddress) } },
        ],
      }).session(session);

      // Map existing records for quick lookup
      const existingSiteCodes = new Set(
        existingSubscribers.map((s) => s.siteCode)
      );
      const existingSiteAddresses = new Set(
        existingSubscribers.map((s) => s.siteAddress)
      );

      // Process all subscribers
      const processingResults = await Promise.all(
        subscribers.map(async (subscriber, index) => {
          const errors = [];

          // Check against existing database records
          if (existingSiteCodes.has(subscriber.siteCode)) {
            errors.push("siteCode already exists");
          }
          if (existingSiteAddresses.has(subscriber.siteAddress)) {
            errors.push("siteAddress already exists");
          }

          // Validate activation date
          const activationDate = new Date(subscriber.activationDate);
          if (isNaN(activationDate.getTime())) {
            errors.push("Invalid activation date");
          }

          // Validate contact numbers
          if (!/^\d{10,15}$/.test(subscriber.localContact?.contact || "")) {
            errors.push("Invalid contact number format");
          }

          if (errors.length > 0) {
            return {
              success: false,
              index,
              error: errors.join(", "),
              data: subscriber,
            };
          }

          // Calculate renewal date
          const renewalDate = new Date(activationDate);
          renewalDate.setMonth(
            renewalDate.getMonth() + (subscriber.ispInfo?.numberOfMonths || 1)
          );

          // Generate unique subscriber ID
          const subscriber_id = await generateUniqueSubscriberId(session);

          // Create subscriber document
          const newSubscriber = new Subscriber({
            subscriber_id,
            ...subscriber,
            ispInfo: {
              ...subscriber.ispInfo,
              currentActivationDate: activationDate,
              renewalDate,
            },
            activationDate,
            status: "Added",
            request_status: "pending",
            created_by: req.user.id,
          });

          await newSubscriber.save({ session });
          return {
            success: true,
            index,
            data: newSubscriber,
          };
        })
      );

      await session.commitTransaction();
      session.endSession();

      // Separate successful and failed records
      const successfulRecords = processingResults.filter((r) => r.success);
      const failedRecords = processingResults.filter((r) => !r.success);

      res.status(201).json({
        success: true,
        data: {
          totalCount: subscribers.length,
          createdCount: successfulRecords.length,
          failedCount: failedRecords.length,
          createdSubscribers: successfulRecords.map((r) => r.data),
          validationErrors: failedRecords,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error("Bulk creation error:", error);
      return next(
        new ErrorResponse("Bulk creation failed due to server error", 500, {
          serverError: error.message,
        })
      );
    }
  }),

  getSubscribers: asyncHandler(async (req, res, next) => {
    try {
      const { status } = req.query;
      let query = { isDeleted: false };

      if (status) query.status = status;

      const subscribers = await Subscriber.find(query)
        .populate({
          path: "modifiedData.modified_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        })
        .populate({
          path: "created_by",
          select: "employee_id name email contact roles",
          model: "Employee",
        });

      res.status(200).json({
        success: true,
        count: subscribers.length,
        data: subscribers,
      });
    } catch (err) {
      next(err);
    }
  }),

  //Approve Employee
  approveSubscriber: asyncHandler(async (req, res, next) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);

      if (!subscriber) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      if (subscriber.request_status !== "pending") {
        return res.status(400).json({ message: "Request already processed" });
      }

      const updatedSubscriber = await Subscriber.findByIdAndUpdate(
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
        data: updatedSubscriber,
        message: "Subscriber Approved Successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  //Reject Employee
  rejectSubscriber: asyncHandler(async (req, res, next) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);

      if (!subscriber) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      if (subscriber.request_status !== "pending") {
        return res.status(400).json({ message: "Request already processed" });
      }

      const updatedSubscriber = await Subscriber.findByIdAndUpdate(
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
        data: updatedSubscriber,
        message: "Subscriber Rejected Successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  // Approve multiple subscribers in bulk
  bulkApproveSubscribers: asyncHandler(async (req, res, next) => {
    const subscribersToApprove = req.body;

    // Validate input
    if (
      !Array.isArray(subscribersToApprove) ||
      subscribersToApprove.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    // Validate all IDs
    const invalidIds = subscribersToApprove.filter(
      (u) => !mongoose.Types.ObjectId.isValid(u.id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber IDs found",
        invalidIds: invalidIds.map((u) => u.id),
      });
    }

    try {
      // console.log("Bulk approve updates:", updates);

      // Prepare bulk operations
      const bulkOps = subscribersToApprove.map((update) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.id) },
          update: {
            $set: {
              status: update.status,
              request_status: update.request_status,
              decision_by: req.user.id,
              updatedAt: Date.now(),
            },
          },
        },
      }));

      // Execute bulk write
      const result = await Subscriber.bulkWrite(bulkOps, { ordered: false });

      res.json({
        success: true,
        message: "Batch status update successful",
        stats: {
          totalRequested: subscribersToApprove.length,
          matched: result.matchedCount,
          modified: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Batch update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process batch update",
        error: error.message,
      });
    }
  }),

  // Reject multiple subscribers in bulk
  bulkRejectSubscribers: asyncHandler(async (req, res, next) => {
    const subscribersToReject = req.body;

    // Validate input
    if (
      !Array.isArray(subscribersToReject) ||
      subscribersToReject.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    // Validate all IDs
    const invalidIds = subscribersToReject.filter(
      (u) => !mongoose.Types.ObjectId.isValid(u.id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber IDs found",
        invalidIds: invalidIds.map((u) => u.id),
      });
    }

    try {
      // console.log("Bulk approve updates:", updates);

      // Prepare bulk operations
      const bulkOps = subscribersToReject.map((update) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.id) },
          update: {
            $set: {
              status: update.status,
              request_status: update.request_status,
              decision_by: req.user.id,
              updatedAt: Date.now(),
            },
          },
        },
      }));

      // Execute bulk write
      const result = await Subscriber.bulkWrite(bulkOps, { ordered: false });

      res.json({
        success: true,
        message: "Batch status update successful",
        stats: {
          totalRequested: subscribersToReject.length,
          matched: result.matchedCount,
          modified: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Batch update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process batch update",
        error: error.message,
      });
    }
  }),

  // Delete multiple subscribers in bulk
  bulkDeleteSubscribers: asyncHandler(async (req, res, next) => {
    const subscribersToDelete = req.body;

    // Validate input
    if (
      !Array.isArray(subscribersToDelete) ||
      subscribersToDelete.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Array of subscriber IDs is required",
      });
    }

    // Validate all IDs
    const invalidIds = subscribersToDelete.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber IDs found",
        invalidIds,
      });
    }

    try {
      // Prepare bulk operations for soft delete
      const bulkOps = subscribersToDelete.map((id) => ({
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(id),
            isDeleted: { $ne: true }, // Only update if not already deleted
          },
          update: {
            $set: {
              status: "Deleted",
              isDeleted: true,
              decision_by: req.user.id,
              updatedAt: Date.now(),
            },
          },
        },
      }));

      // Execute bulk operation
      const result = await Subscriber.bulkWrite(bulkOps, { ordered: false });

      res.json({
        success: true,
        message: "Bulk soft delete successful",
        stats: {
          totalRequested: subscribersToDelete.length,
          matched: result.matchedCount,
          modified: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process bulk delete",
        error: error.message,
      });
    }
  }),

  getSubscriberById: asyncHandler(async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const subscriber = await Subscriber.findById(req.params.id)
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

      if (!subscriber) {
        return res
          .status(404)
          .json({ success: false, message: "Subscriber not found" });
      }

      res.status(200).json({
        success: true,
        data: subscriber,
      });
    } catch (err) {
      next(err);
    }
  }),

  //Update Subscriber
  updateSubscriber: asyncHandler(async (req, res, next) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);

      if (!subscriber) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      // // Extract the fields you want to track changes for
      // const trackedFields = [
      //   "siteName",
      //   "siteCode",
      //   "siteAddress",
      //   "localContact.name",
      //   "localContact.contact",
      //   "ispInfo.name",
      //   "ispInfo.contact",
      //   "ispInfo.broadbandPlan",
      //   "ispInfo.numberOfMonths",
      //   "ispInfo.otc",
      //   "ispInfo.mrc",
      //   "credentials.username",
      //   "credentials.password",
      //   "remark",
      // ];

      // // Prepare previous and current data objects
      // const previousData = {};
      // const currentData = {};

      // trackedFields.forEach((field) => {
      //   previousData[field] = subscriber[field]; // Get old value from DB
      //   currentData[field] = req.body[field] || subscriber[field]; // New value from request or keep old
      // });
      const trackedFields = [
        "siteName",
        "siteCode",
        "siteAddress",
        "localContact.name",
        "localContact.contact",
        "ispInfo.name",
        "ispInfo.contact",
        "ispInfo.broadbandPlan",
        "ispInfo.numberOfMonths",
        "ispInfo.otc",
        "ispInfo.mrc",
        "credentials.username",
        "credentials.password",
        "remark",
      ];

      // Helper function to get nested properties
      function getNestedValue(obj, path) {
        return path.split(".").reduce((o, p) => (o || {})[p], obj);
      }

      // Helper function to check if a value exists (not undefined or empty string)
      function hasValue(val) {
        return val !== undefined && val !== "";
      }

      const previousData = {};
      const currentData = {};

      trackedFields.forEach((field) => {
        // Get previous value
        previousData[field] = getNestedValue(subscriber, field);

        // Get current value - use req.body if it exists and has value, otherwise use previous value
        const newValue = getNestedValue(req.body, field);
        currentData[field] = hasValue(newValue)
          ? newValue
          : previousData[field];
      });

      const updatedSubscriber = await Subscriber.findByIdAndUpdate(
        req.params.id,
        {
          // ...req.body,
          remark: req.body.remark,
          modifiedData: {
            previous: previousData,
            current: currentData,
            modified_by: req.user.id,
            modified_at: Date.now(),
          },
          updatedAt: Date.now(),
          request_status: "pending",
          status: "Modified",
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: updatedSubscriber,
        message: "Subscriber Updated Successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
};

module.exports = subscriberController;

// Helper functions
async function generateUniqueSubscriberId(session) {
  const prefix = "SUB-";
  let attempts = 0;

  while (attempts < 5) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const subscriber_id = prefix + randomSuffix;

    const exists = await Subscriber.findOne({ subscriber_id }).session(session);
    if (!exists) return subscriber_id;

    attempts++;
  }

  throw new Error("Failed to generate unique subscriber ID");
}

function findDuplicatesInBatch(subscribers) {
  const seenSiteCodes = new Set();
  const seenSiteAddresses = new Set();
  const duplicates = [];

  subscribers.forEach((sub, index) => {
    const dupErrors = [];

    if (seenSiteCodes.has(sub.siteCode)) {
      dupErrors.push("duplicate siteCode in batch");
    } else {
      seenSiteCodes.add(sub.siteCode);
    }

    if (seenSiteAddresses.has(sub.siteAddress)) {
      dupErrors.push("duplicate siteAddress in batch");
    } else {
      seenSiteAddresses.add(sub.siteAddress);
    }

    if (dupErrors.length > 0) {
      duplicates.push({
        index,
        error: dupErrors.join(", "),
        data: sub,
      });
    }
  });

  return duplicates;
}
