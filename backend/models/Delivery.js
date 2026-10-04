const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },

    pickup: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      contactName: {
        type: String,
        trim: true,
      },

      contactPhone: {
        type: String,
        trim: true,
      },
    },

    destination: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      contactName: {
        type: String,
        trim: true,
      },

      contactPhone: {
        type: String,
        trim: true,
      },
    },

    package: {
      description: {
        type: String,
        required: true,
        trim: true,
      },

      weight: {
        type: Number,
        required: true,
        min: 0,
      },

      weightUnit: {
        type: String,
        enum: ["kg", "ton"],
        default: "kg",
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },

      fragile: {
        type: Boolean,
        default: false,
      },
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    scheduledDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ready_for_dispatch",
        "dispatched",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

deliverySchema.index({ status: 1 });
deliverySchema.index({ priority: 1 });
deliverySchema.index({ scheduledDate: 1 });
deliverySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Delivery", deliverySchema);