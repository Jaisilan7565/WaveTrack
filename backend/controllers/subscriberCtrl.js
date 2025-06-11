const Subscriber = require("../models/Subscriber");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");

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

  // Get all subscribers
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
};

module.exports = subscriberController;
