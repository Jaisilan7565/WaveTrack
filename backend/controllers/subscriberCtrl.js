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

  // createBulkSubscribers: asyncHandler(async (req, res, next) => {
  //   const { subscribers } = req.body;

  //   // Validate bulk payload structure
  //   if (!Array.isArray(subscribers) || subscribers.length === 0) {
  //     return next(
  //       new ErrorResponse(
  //         "Invalid bulk data format - expected array of subscribers",
  //         400
  //       )
  //     );
  //   }

  //   // Validate each subscriber in parallel
  //   const validationResults = await Promise.all(
  //     subscribers.map(async (subscriber, index) => {
  //       const {
  //         siteCode,
  //         siteName,
  //         siteAddress,
  //         localContact,
  //         ispInfo,
  //         activationDate,
  //       } = subscriber;

  //       // Check required fields
  //       const missingFields = [];
  //       if (!siteName) missingFields.push("siteName");
  //       if (!siteAddress) missingFields.push("siteAddress");
  //       if (!localContact?.name) missingFields.push("localContact.name");
  //       if (!localContact?.contact) missingFields.push("localContact.contact");
  //       if (!ispInfo?.name) missingFields.push("ispInfo.name");
  //       if (!ispInfo?.contact) missingFields.push("ispInfo.contact");
  //       if (!ispInfo?.broadbandPlan)
  //         missingFields.push("ispInfo.broadbandPlan");
  //       if (!activationDate) missingFields.push("activationDate");

  //       if (missingFields.length > 0) {
  //         return {
  //           index,
  //           error: `Missing required fields: ${missingFields.join(", ")}`,
  //           valid: false,
  //         };
  //       }

  //       // Check for duplicates in the database
  //       const [existingSiteCode, existingSiteAddress] = await Promise.all([
  //         Subscriber.findOne({ siteCode }),
  //         Subscriber.findOne({ siteAddress }),
  //       ]);

  //       const duplicates = [];
  //       if (existingSiteCode) duplicates.push("siteCode");
  //       if (existingSiteAddress) duplicates.push("siteAddress");

  //       if (duplicates.length > 0) {
  //         return {
  //           index,
  //           error: `Duplicate values found: ${duplicates.join(", ")}`,
  //           valid: false,
  //         };
  //       }

  //       return { index, valid: true };
  //     })
  //   );

  //   // Separate valid and invalid subscribers
  //   const invalidSubscribers = validationResults.filter((r) => !r.valid);
  //   const validIndices = validationResults
  //     .filter((r) => r.valid)
  //     .map((r) => r.index);

  //   if (invalidSubscribers.length === subscribers.length) {
  //     return next(
  //       new ErrorResponse("All subscriber records failed validation", 400, {
  //         validationErrors: invalidSubscribers,
  //       })
  //     );
  //   }

  //   try {
  //     // Process valid subscribers
  //     const createdSubscribers = await Promise.all(
  //       validIndices.map(async (index) => {
  //         const subscriber = subscribers[index];

  //         // Generate unique subscriber_id
  //         const generateSubscriberId = async () => {
  //           const prefix = "SUB-";
  //           const randomSuffix = Math.floor(
  //             10000 + Math.random() * 90000
  //           ).toString();
  //           const subscriber_id = prefix + randomSuffix;
  //           const exists = await Subscriber.findOne({ subscriber_id });
  //           return exists ? await generateSubscriberId() : subscriber_id;
  //         };

  //         // Parse dates
  //         const parseDate = (dateString) => {
  //           if (!dateString) return null;
  //           if (dateString instanceof Date) return dateString;
  //           const date = new Date(dateString);
  //           return isNaN(date.getTime()) ? null : date;
  //         };

  //         const parsedActivationDate = parseDate(subscriber.activationDate);
  //         if (!parsedActivationDate) {
  //           throw new Error(
  //             `Invalid activation date format for record ${index}`
  //           );
  //         }

  //         // Calculate renewal date
  //         const renewalDate = new Date(parsedActivationDate);
  //         renewalDate.setMonth(
  //           renewalDate.getMonth() + (subscriber.ispInfo.numberOfMonths || 1)
  //         );

  //         // Create subscriber data
  //         const subscriberData = {
  //           subscriber_id: await generateSubscriberId(),
  //           siteCode: subscriber.siteCode,
  //           siteName: subscriber.siteName,
  //           siteAddress: subscriber.siteAddress,
  //           localContact: subscriber.localContact,
  //           ispInfo: {
  //             ...subscriber.ispInfo,
  //             currentActivationDate: parsedActivationDate,
  //             renewalDate,
  //           },
  //           credentials: subscriber.credentials || {},
  //           activationDate: parsedActivationDate,
  //           status: "Added",
  //           request_status: "pending",
  //           created_by: req.user.id,
  //         };

  //         return await Subscriber.create(subscriberData);
  //       })
  //     );

  //     res.status(201).json({
  //       success: true,
  //       data: {
  //         createdCount: createdSubscribers.length,
  //         failedCount: invalidSubscribers.length,
  //         createdSubscribers,
  //         validationErrors: invalidSubscribers,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Bulk subscriber creation error:", error);
  //     return next(
  //       new ErrorResponse(
  //         `Bulk creation partially failed: ${error.message}`,
  //         500,
  //         { validationErrors: invalidSubscribers }
  //       )
  //     );
  //   }
  // }),

  // Get all subscribers

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
