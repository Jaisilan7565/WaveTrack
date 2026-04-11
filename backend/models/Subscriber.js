const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    subscriber_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    siteName: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    siteCode: {
      type: String,
      trim: true,
    },
    siteAddress: {
      type: String,
      required: true,
      trim: true,
    },
    localContact: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      contact: {
        type: String,
        required: true,
        trim: true,
      },
    },
    ispInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      contact: {
        type: String,
        required: true,
        trim: true,
      },
      broadbandPlan: {
        type: String,
        required: true,
        trim: true,
      },
      numberOfMonths: {
        type: Number,
        required: true,
        min: 1,
      },
      otc: {
        type: Number,
        default: 0,
        min: 0,
      },
      mrc: {
        type: Number,
        required: true,
        min: 0,
      },
      currentActivationDate: {
        type: Date,
        required: true,
      },
      renewalDate: {
        type: Date,
        required: true,
      },
    },
    activationDate: {
      type: Date,
      required: true,
    },
    credentials: {
      username: {
        type: String,
        trim: true,
      },
      password: {
        type: String,
        trim: true,
      },
      circuitId: {
        type: String,
        trim: true,
      },
      accountId: {
        type: String,
        trim: true,
      },
      staticIP: {
        type: String,
        trim: true,
      },
    },
    remark: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Added",
        "Active",
        "InActive",
        "Rejected",
        "Modified",
        "Suspended",
      ],
      default: "Added",
    },
    request_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    modifiedData: {
      type: mongoose.Schema.Types.Mixed,
    },
    decision_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Subscriber", subscriberSchema);
