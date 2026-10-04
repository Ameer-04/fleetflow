const Driver = require("../models/Driver");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createDriver = async (driverData) => {
  const {
    user,
    licenseNumber,
    licenseExpiry,
    phone,
    address,
    emergencyContact,
    hireDate,
  } = driverData;

  const existingDriver = await Driver.findOne({
    user,
  });

  if (existingDriver) {
    const error = new Error(
      "This user already has a driver profile"
    );

    error.statusCode = 409;
    throw error;
  }

  const userAccount = await User.findById(user);

  if (!userAccount) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (userAccount.role !== "driver") {
    const error = new Error(
      "Selected user does not have the driver role"
    );

    error.statusCode = 400;
    throw error;
  }

  const driver = await Driver.create({
    user,
    licenseNumber,
    licenseExpiry,
    phone,
    address,
    emergencyContact,
    hireDate,
  });

  return driver.populate(
    "user",
    "name email role"
  );
};

const getDrivers = async ({
  page = 1,
  limit = 20,
  availability,
  employmentStatus,
  search,
}) => {
  const filter = {};

  if (availability) {
    filter.availability = availability;
  }

  if (employmentStatus) {
    filter.employmentStatus = employmentStatus;
  }

  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (safePage - 1) * safeLimit;

  let query = Driver.find(filter)
    .populate("user", "name email role")
    .populate(
      "assignedVehicle",
      "registrationNumber make model type"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);

  /*
   * Searching populated user fields cannot be done
   * directly through the Driver query.
   *
   * For the first implementation we'll resolve matching
   * users and add their IDs to the driver filter.
   */
  if (search) {
    const safeSearch = escapeRegex(search.trim());
    const users = await User.find({
      role: "driver",
      $or: [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ],
    }).select("_id");

    filter.$or = [
      {
        user: {
          $in: users.map((user) => user._id),
        },
      },
      {
        licenseNumber: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];

    query = Driver.find(filter)
      .populate("user", "name email role")
      .populate(
        "assignedVehicle",
        "registrationNumber make model type"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);
  }

  const [drivers, total] = await Promise.all([
    query.lean(),
    Driver.countDocuments(filter),
  ]);

  return {
    drivers,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

const getDriverById = async (driverId) => {
  const driver = await Driver.findById(driverId)
    .populate("user", "name email role")
    .populate(
      "assignedVehicle",
      "registrationNumber make model type status"
    )
    .lean();

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  return driver;
};

const updateDriver = async (
  driverId,
  updateData
) => {
  const driver = await Driver.findById(driverId);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "licenseNumber",
    "licenseExpiry",
    "phone",
    "address",
    "emergencyContact",
    "employmentStatus",
    "availability",
    "hireDate",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      driver[field] = updateData[field];
    }
  });

  await driver.save();

  return driver.populate(
    "user",
    "name email role"
  );
};

const deleteDriver = async (driverId) => {
  const driver = await Driver.findById(driverId);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  if (driver.assignedVehicle) {
    const error = new Error(
      "Cannot delete a driver assigned to a vehicle"
    );

    error.statusCode = 409;
    throw error;
  }

  if (driver.availability === "on_delivery") {
    const error = new Error(
      "Cannot delete a driver currently on delivery"
    );

    error.statusCode = 409;
    throw error;
  }

  await driver.deleteOne();
};

const assignVehicle = async (
  driverId,
  vehicleId
) => {
  const driver = await Driver.findById(driverId);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  if (driver.employmentStatus !== "active") {
    const error = new Error(
      "Only active drivers can be assigned vehicles"
    );

    error.statusCode = 409;
    throw error;
  }

  if (driver.availability !== "available") {
    const error = new Error(
      "Driver is currently unavailable"
    );

    error.statusCode = 409;
    throw error;
  }

  if (driver.assignedVehicle) {
    const error = new Error(
      "Driver already has a vehicle assigned"
    );

    error.statusCode = 409;
    throw error;
  }

  if (vehicle.status !== "available") {
    const error = new Error(
      "Vehicle is not available"
    );

    error.statusCode = 409;
    throw error;
  }

  driver.assignedVehicle = vehicle._id;
  driver.availability = "unavailable";

  vehicle.assignedDriver = driver._id;
  vehicle.status = "assigned";

  await driver.save();
  await vehicle.save();

  return driver.populate(
    "assignedVehicle",
    "registrationNumber make model type status"
  );
};

const unassignVehicle = async (driverId) => {
  const driver = await Driver.findById(driverId);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  if (!driver.assignedVehicle) {
    const error = new Error(
      "Driver does not have a vehicle assigned"
    );

    error.statusCode = 409;
    throw error;
  }

  const vehicle = await Vehicle.findById(
    driver.assignedVehicle
  );

  if (vehicle) {
    vehicle.assignedDriver = null;
    vehicle.status = "available";

    await vehicle.save();
  }

  driver.assignedVehicle = null;
  driver.availability = "available";

  await driver.save();

  return driver;
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  assignVehicle,
  unassignVehicle,
};