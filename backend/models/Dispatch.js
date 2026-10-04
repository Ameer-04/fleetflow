const mongoose = require("mongoose");

const dispatchSchema = new mongoose.Schema(
  {
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "assigned",
        "started",
        "completed",
        "cancelled",
      ],
      default: "assigned",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

dispatchSchema.index({ delivery: 1 }, {
  unique: true,
  partialFilterExpression: {
    status: { $in: ["assigned", "started"] },
  },
});
dispatchSchema.index({ driver: 1 });
dispatchSchema.index({ vehicle: 1 });
dispatchSchema.index({ status: 1 });

module.exports = mongoose.model(
  "Dispatch",
  dispatchSchema
);