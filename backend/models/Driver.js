const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    licenseExpiry: {
      type: Date,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },

    employmentStatus: {
      type: String,
      enum: [
        "active",
        "inactive",
        "suspended",
        "terminated",
      ],
      default: "active",
    },

    availability: {
      type: String,
      enum: [
        "available",
        "unavailable",
        "on_delivery",
        "on_leave",
      ],
      default: "available",
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    hireDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

driverSchema.index({ employmentStatus: 1 });
driverSchema.index({ availability: 1 });

module.exports = mongoose.model("Driver", driverSchema);