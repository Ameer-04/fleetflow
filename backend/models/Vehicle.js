const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    make: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "van",
        "truck",
        "pickup",
        "motorcycle",
        "refrigerated_truck",
      ],
    },

    capacity: {
      type: Number,
      required: true,
      min: 0,
    },

    capacityUnit: {
      type: String,
      enum: ["kg", "ton"],
      default: "kg",
    },

    status: {
      type: String,
      enum: [
        "available",
        "assigned",
        "in_transit",
        "maintenance",
        "inactive",
      ],
      default: "available",
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Vehicle", vehicleSchema);