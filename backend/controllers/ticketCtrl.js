const Ticket = require("../models/Ticket");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const ticketController = {
  //Create a new ticket
  createTicket: asyncHandler(async (req, res, next) => {
    const {
      subscriberId,
      issueTitle,
      issueDescription,
      priority,
      assignedTo,
      issueRaisedDate,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      subscriberId,
      issueTitle,
      issueDescription,
      priority,
      assignedTo,
      issueRaisedDate,
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

    // Generate unique ticketId (format: TKT-XXXXX)
    const generateTicketId = async () => {
      const prefix = "TKT-";
      const randomSuffix = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      const ticketId = prefix + randomSuffix;

      // Check if ID already exists
      const exists = await Ticket.findOne({ ticketId });
      return exists ? await generateTicketId() : ticketId;
    };

    try {
      // Create ticket data object
      const ticketData = {
        ticketId: await generateTicketId(),
        subscriberId,
        issueTitle,
        issueDescription,
        priority,
        assignedTo,
        issueRaisedDate,
        status: "Open",
        request_status: "pending",
        created_by: req.user.id,
      };

      // Create new ticket
      const ticket = await Ticket.create(ticketData);

      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      return next(
        new ErrorResponse(
          error.message || "Failed to create ticket",
          error.statusCode || 500
        )
      );
    }
  }),

  //Get all tickets
  getTickets: asyncHandler(async (req, res, next) => {
    const tickets = await Ticket.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  }),
};

module.exports = ticketController;
