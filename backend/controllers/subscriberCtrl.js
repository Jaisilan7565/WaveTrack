const Subscriber = require("../models/Subscriber");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");

const subscriberController = {
  //Create a new subscriber
  // createSubscriber: asyncHandler(async (req, res, next) => {
  //   const {
  //     siteCode,
  //     siteName,
  //     siteAddress,
  //     localContact,
  //     ispInfo,
  //     activationDate,
  //     credentials,
  //   } = req.body;

  //   // Validate required fields
  //   if (
  //     !siteCode ||
  //     !siteName ||
  //     !siteAddress ||
  //     !localContact ||
  //     !ispInfo ||
  //     !activationDate ||
  //     !credentials
  //   ) {
  //     return next(new ErrorResponse("Missing required fields", 400));
  //   }

  //   // Parse dates from string to Date objects
  //   const parsedSubscriberData = {
  //     ...req.body,
  //     ispInfo: {
  //       ...req.body.ispInfo,
  //       currentActivationDate: new Date(req.body.ispInfo.currentActivationDate),
  //       renewalDate: new Date(req.body.ispInfo.renewalDate),
  //     },
  //     activationDate: new Date(req.body.activationDate),
  //   };

  //   // Generate unique subscriber_id (format: SUB-XXXXX)
  //   const generateSubscriberId = async () => {
  //     const prefix = "SUB-";
  //     const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  //     const subscriber_id = prefix + randomSuffix;

  //     // Check if ID already exists
  //     const exists = await Subscriber.findOne({ subscriber_id });
  //     return exists ? await generateSubscriberId() : subscriber_id;
  //   };

  //   // Check if email already exists
  //   const existingSiteCode = await Subscriber.findOne({ siteCode });
  //   if (existingSiteCode) {
  //     return next(new ErrorResponse("SiteCode already exists", 400));
  //   }

  //   // Check if contact already exists
  //   const existingSiteAddress = await Subscriber.findOne({ siteAddress });
  //   if (existingSiteAddress) {
  //     return next(new ErrorResponse("Contact number already exists", 400));
  //   }

  //   // Create new subscriber with unique ID
  //   const subscriber = await Subscriber.create({
  //     subscriber_id: await generateSubscriberId(),
  //     ...parsedSubscriberData,
  //     created_by: req.user.id,
  //     status: "Added",
  //     request_status: "pending",
  //   });

  //   res.status(201).json({
  //     success: true,
  //     data: {
  //       ...subscriber,
  //     },
  //   });
  // }),

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

      const currentActivationDate = parseDate(ispInfo.currentActivationDate);
      const renewalDate = parseDate(ispInfo.renewalDate);
      const parsedActivationDate = parseDate(activationDate);

      if (!currentActivationDate) {
        return next(
          new ErrorResponse("Invalid ISP activation date format", 400)
        );
      }

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
          currentActivationDate,
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
};

module.exports = subscriberController;
