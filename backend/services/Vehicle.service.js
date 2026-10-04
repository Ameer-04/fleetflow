const Vehicle = require("../models/Vehicle");

const sortableFields = new Set([
  "registrationNumber",
  "make",
  "model",
  "year",
  "type",
  "capacity",
  "status",
  "createdAt",
]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createVehicle = async (vehicleData) => {
  const vehicle = await Vehicle.create(vehicleData);

  return vehicle;
};

const getVehicles = async ({
  page = 1,
  limit = 20,
  status,
  type,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (type) {
    filter.type = type;
  }

  if (search) {
    const escapedSearch = escapeRegex(String(search));

    filter.$or = [
      { registrationNumber: { $regex: escapedSearch, $options: "i" } },
      { make: { $regex: escapedSearch, $options: "i" } },
      { model: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (normalizedPage - 1) * normalizedLimit;

  const sort = {
    [sortableFields.has(sortBy) ? sortBy : "createdAt"]:
      sortOrder === "asc" ? 1 : -1,
  };

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .populate("assignedDriver", "name email")
      .sort(sort)
      .skip(skip)
      .limit(normalizedLimit)
      .lean(),

    Vehicle.countDocuments(filter),
  ]);

  return {
    vehicles,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      pages: Math.ceil(total / normalizedLimit),
    },
  };
};

const getVehicleById = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId)
    .populate("assignedDriver", "name email")
    .lean();

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};

const updateVehicle = async (vehicleId, updateData) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "registrationNumber",
    "make",
    "model",
    "year",
    "type",
    "capacity",
    "capacityUnit",
    "status",
  ];

  const fieldsToUpdate = allowedFields.filter(
    (field) => updateData[field] !== undefined
  );

  if (fieldsToUpdate.length === 0) {
    const error = new Error("At least one vehicle field is required");
    error.statusCode = 400;
    throw error;
  }

  const previousStatus = vehicle.status;

  fieldsToUpdate.forEach((field) => {
    vehicle[field] = updateData[field];
  });

  if (
    previousStatus === "in_transit" &&
    vehicle.status === "maintenance"
  ) {
    const error = new Error(
      "Vehicle in transit cannot be moved directly to maintenance"
    );

    error.statusCode = 409;
    throw error;
  }

  await vehicle.save();

  return vehicle;
};

const deleteVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  if (vehicle.assignedDriver) {
    const error = new Error(
      "Cannot delete a vehicle assigned to a driver"
    );

    error.statusCode = 409;
    throw error;
  }

  if (vehicle.status === "in_transit") {
    const error = new Error(
      "Cannot delete a vehicle currently in transit"
    );

    error.statusCode = 409;
    throw error;
  }

  await vehicle.deleteOne();
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};