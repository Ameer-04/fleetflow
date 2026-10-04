const Delivery = require("../models/Delivery");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateTrackingNumber = () => {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `FF-${date}-${random}`;
};

/*
  Allowed delivery status transitions.

  The key idea:
  The API should not allow arbitrary status changes.
*/
const allowedTransitions = {
  pending: ["confirmed", "cancelled"],

  confirmed: ["ready_for_dispatch", "cancelled"],

  ready_for_dispatch: ["dispatched", "cancelled"],

  dispatched: ["picked_up", "cancelled"],

  picked_up: ["in_transit"],

  in_transit: ["out_for_delivery"],

  out_for_delivery: ["delivered"],

  delivered: [],

  cancelled: [],
};

const validateStatusTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowed = allowedTransitions[currentStatus] || [];

  return allowed.includes(nextStatus);
};

const createDelivery = async (data) => {
  const {
    customer,
    pickup,
    destination,
    package: packageInfo,
    priority,
    scheduledDate,
    notes,
  } = data;

  const trackingNumber = generateTrackingNumber();

  const delivery = await Delivery.create({
    trackingNumber,
    customer,
    pickup,
    destination,
    package: packageInfo,
    priority,
    scheduledDate,
    notes,
  });

  return delivery;
};

const getDeliveries = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || 20, 1),
    100
  );

  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.search) {
    const search = escapeRegex(query.search.trim());

    filter.$or = [
      {
        trackingNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customer.name": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "customer.phone": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "pickup.address": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "destination.address": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const sortField = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const allowedSortFields = [
    "createdAt",
    "scheduledDate",
    "priority",
    "status",
    "trackingNumber",
  ];

  const safeSortField = allowedSortFields.includes(sortField)
    ? sortField
    : "createdAt";

  const sort = {
    [safeSortField]: sortOrder,
  };

  const [deliveries, total] = await Promise.all([
    Delivery.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit),

    Delivery.countDocuments(filter),
  ]);

  return {
    deliveries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getDeliveryById = async (id) => {
  const delivery = await Delivery.findById(id);

  if (!delivery) {
    const error = new Error("Delivery not found");
    error.statusCode = 404;
    throw error;
  }

  return delivery;
};

const updateDelivery = async (id, data) => {
  const delivery = await Delivery.findById(id);

  if (!delivery) {
    const error = new Error("Delivery not found");
    error.statusCode = 404;
    throw error;
  }

  /*
    We deliberately do NOT allow status through this generic
    update method.

    Status changes belong to changeDeliveryStatus().
  */
  const allowedFields = [
    "customer",
    "pickup",
    "destination",
    "package",
    "priority",
    "scheduledDate",
    "notes",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      delivery[field] = data[field];
    }
  }

  await delivery.save();

  return delivery;
};

const changeDeliveryStatus = async (id, nextStatus) => {
  const delivery = await Delivery.findById(id);

  if (!delivery) {
    const error = new Error("Delivery not found");
    error.statusCode = 404;
    throw error;
  }

  if (!allowedTransitions[nextStatus]) {
    const error = new Error("Invalid delivery status");
    error.statusCode = 400;
    throw error;
  }

  if (
    !validateStatusTransition(
      delivery.status,
      nextStatus
    )
  ) {
    const error = new Error(
      `Cannot change delivery status from "${delivery.status}" to "${nextStatus}"`
    );

    error.statusCode = 400;

    throw error;
  }

  delivery.status = nextStatus;

  if (nextStatus === "delivered") {
    delivery.deliveredAt = new Date();
  }

  if (nextStatus === "cancelled") {
    delivery.cancelledAt = new Date();
  }

  await delivery.save();

  return delivery;
};

const cancelDelivery = async (id, reason) => {
  const delivery = await Delivery.findById(id);

  if (!delivery) {
    const error = new Error("Delivery not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["pending", "confirmed", "ready_for_dispatch"].includes(delivery.status)) {
    const error = new Error(
      "This delivery can no longer be cancelled"
    );

    error.statusCode = 400;

    throw error;
  }

  delivery.status = "cancelled";
  delivery.cancelledAt = new Date();
  delivery.cancellationReason = reason || "Cancelled by administrator";

  await delivery.save();

  return delivery;
};

const deleteDelivery = async (id) => {
  const delivery = await Delivery.findById(id);

  if (!delivery) {
    const error = new Error("Delivery not found");
    error.statusCode = 404;
    throw error;
  }

  /*
    Once an order enters the operational workflow,
    deleting it would destroy historical data.
  */
  if (
    !["pending", "cancelled"].includes(
      delivery.status
    )
  ) {
    const error = new Error(
      "Only pending or cancelled deliveries can be deleted"
    );

    error.statusCode = 400;

    throw error;
  }

  await delivery.deleteOne();

  return delivery;
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  changeDeliveryStatus,
  cancelDelivery,
  deleteDelivery,
};