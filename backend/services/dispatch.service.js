const Dispatch = require("../models/Dispatch");
const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");

const ensureActorCanOperate = async (dispatch, actor) => {
  if (!actor || ["admin", "dispatcher"].includes(actor.role)) {
    return;
  }

  const driver = await Driver.findOne({ user: actor._id }).select("_id");

  const dispatchDriverId = dispatch.driver?._id || dispatch.driver;

  if (!driver || driver._id.toString() !== dispatchDriverId.toString()) {
    const error = new Error("You do not have access to this dispatch");
    error.statusCode = 403;
    throw error;
  }
};

const createDispatch = async ({
  deliveryId,
  driverId,
  vehicleId,
  notes,
}) => {
  const delivery =
    await Delivery.findById(deliveryId);

  if (!delivery) {
    const error = new Error(
      "Delivery not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (delivery.status !== "ready_for_dispatch") {
    const error = new Error(
      "Delivery is not ready for dispatch"
    );

    error.statusCode = 400;

    throw error;
  }

  const driver =
    await Driver.findById(driverId);

  if (!driver) {
    const error = new Error(
      "Driver not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (driver.employmentStatus !== "active") {
    const error = new Error(
      "Driver is not active"
    );

    error.statusCode = 400;

    throw error;
  }

  if (driver.availability !== "available") {
    const error = new Error(
      "Driver is not available"
    );

    error.statusCode = 400;

    throw error;
  }

  const vehicle =
    await Vehicle.findById(vehicleId);

  if (!vehicle) {
    const error = new Error(
      "Vehicle not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (vehicle.status !== "assigned") {
    const error = new Error(
      "Vehicle is not assigned for dispatch"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !driver.assignedVehicle ||
    driver.assignedVehicle.toString() !==
      vehicle._id.toString()
  ) {
    const error = new Error(
      "Selected vehicle is not assigned to this driver"
    );

    error.statusCode = 400;

    throw error;
  }

  if (!vehicle.assignedDriver || vehicle.assignedDriver.toString() !== driver._id.toString()) {
    const error = new Error("Selected vehicle is not assigned to this driver");
    error.statusCode = 400;
    throw error;
  }

  const existingDispatch =
    await Dispatch.findOne({
      delivery: delivery._id,
      status: {
        $in: ["assigned", "started"],
      },
    });

  if (existingDispatch) {
    const error = new Error(
      "This delivery already has an active dispatch"
    );

    error.statusCode = 409;

    throw error;
  }

  const dispatch = await Dispatch.create({
    delivery: delivery._id,
    driver: driver._id,
    vehicle: vehicle._id,
    notes,
  });

  /*
    Lock the driver and vehicle into operational state.
  */

  driver.availability = "on_delivery";
  vehicle.status = "assigned";

  await driver.save();
  await vehicle.save();

  /*
    Move delivery into dispatched state.
  */

  delivery.status = "dispatched";

  await delivery.save();

  return Dispatch.findById(dispatch._id)
    .populate({
      path: "delivery",
    })
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate({
      path: "vehicle",
    });
};

const getDispatches = async (query, actor) => {
  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(query.limit) || 20, 1),
    100
  );

  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.driver) {
    filter.driver = query.driver;
  }

  if (query.vehicle) {
    filter.vehicle = query.vehicle;
  }

  if (actor?.role === "driver") {
    const driver = await Driver.findOne({ user: actor._id }).select("_id");
    filter.driver = driver?._id || null;
  }

  const [dispatches, total] =
    await Promise.all([
      Dispatch.find(filter)
        .populate("delivery")
        .populate({
          path: "driver",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate("vehicle")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Dispatch.countDocuments(filter),
    ]);

  return {
    dispatches,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getDispatchById = async (id, actor) => {
  const dispatch = await Dispatch.findById(id)
    .populate("delivery")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("vehicle");

  if (!dispatch) {
    const error = new Error(
      "Dispatch not found"
    );

    error.statusCode = 404;

    throw error;
  }

  await ensureActorCanOperate(dispatch, actor);

  return dispatch;
};

const startDispatch = async (dispatchId, actor) => {
  const dispatch = await Dispatch.findById(dispatchId).populate(
    "delivery"
  );

  if (!dispatch) {
    const error = new Error("Dispatch not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureActorCanOperate(dispatch, actor);

  if (dispatch.status !== "assigned") {
    const error = new Error(
      `Dispatch cannot be started from status "${dispatch.status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  if (!dispatch.delivery || dispatch.delivery.status !== "dispatched") {
    const error = new Error(
      `Delivery cannot be picked up from status "${dispatch.delivery.status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  dispatch.status = "started";
  dispatch.startedAt = new Date();

  await dispatch.save();

  dispatch.delivery.status = "picked_up";
  await dispatch.delivery.save();

  return Dispatch.findById(dispatch._id)
    .populate({
      path: "delivery",
    })
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email role",
      },
    })
    .populate("vehicle");
};

const completeDispatch = async (dispatchId, actor) => {
  const dispatch = await Dispatch.findById(dispatchId).populate(
    "delivery"
  );

  if (!dispatch) {
    const error = new Error("Dispatch not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureActorCanOperate(dispatch, actor);

  if (dispatch.status !== "started") {
    const error = new Error(
      `Dispatch cannot be completed from status "${dispatch.status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  if (!dispatch.delivery || dispatch.delivery.status !== "delivered") {
    const error = new Error(
      "Dispatch cannot be completed until the delivery is delivered"
    );
    error.statusCode = 400;
    throw error;
  }

  dispatch.status = "completed";
  dispatch.completedAt = new Date();

  await dispatch.save();

  // Release operational resources
  const driver = await Driver.findById(dispatch.driver);

  if (driver) {
    driver.availability = "available";
    await driver.save();
  }

  const vehicle = await Vehicle.findById(dispatch.vehicle);

  if (vehicle) {
    vehicle.status = "available";
    await vehicle.save();
  }

  return Dispatch.findById(dispatch._id)
    .populate("delivery")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email role",
      },
    })
    .populate("vehicle");
};

const cancelDispatch = async (id) => {
  const dispatch =
    await Dispatch.findById(id);

  if (!dispatch) {
    const error = new Error(
      "Dispatch not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (dispatch.status !== "assigned") {
    const error = new Error(
      "Only assigned dispatches can be cancelled"
    );

    error.statusCode = 400;

    throw error;
  }

  dispatch.status = "cancelled";
  dispatch.cancelledAt = new Date();

  await dispatch.save();

  const driver =
    await Driver.findById(dispatch.driver);

  if (driver) {
    driver.availability = "available";

    await driver.save();
  }

  const vehicle =
    await Vehicle.findById(dispatch.vehicle);

  if (vehicle) {
    vehicle.status = "available";

    await vehicle.save();
  }

  const delivery =
    await Delivery.findById(dispatch.delivery);

  if (delivery) {
    delivery.status = "ready_for_dispatch";

    await delivery.save();
  }

  return dispatch;
};

const updateDeliveryProgress = async (dispatchId, nextStatus, actor) => {
  const dispatch = await Dispatch.findById(dispatchId).populate("delivery");

  if (!dispatch) {
    const error = new Error("Dispatch not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureActorCanOperate(dispatch, actor);

  if (dispatch.status !== "started") {
    const error = new Error(
      "Delivery progress can only be updated for an active dispatch"
    );
    error.statusCode = 400;
    throw error;
  }

  const allowedTransitions = {
    picked_up: ["in_transit"],
    in_transit: ["out_for_delivery"],
    out_for_delivery: ["delivered"],
  };

  const currentStatus = dispatch.delivery.status;

  if (
    !Object.prototype.hasOwnProperty.call(
      allowedTransitions,
      currentStatus
    )
  ) {
    const error = new Error(
      `Delivery cannot progress from status "${currentStatus}"`
    );
    error.statusCode = 400;
    throw error;
  }

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    const error = new Error(
      `Delivery cannot move from "${currentStatus}" to "${nextStatus}"`
    );
    error.statusCode = 400;
    throw error;
  }

  dispatch.delivery.status = nextStatus;

  if (nextStatus === "delivered") {
    dispatch.delivery.deliveredAt = new Date();
  }

  await dispatch.delivery.save();

  return Dispatch.findById(dispatch._id)
    .populate("delivery")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email role",
      },
    })
    .populate("vehicle");
};

module.exports = {
  createDispatch,
  getDispatches,
  getDispatchById,
  startDispatch,
  completeDispatch,
  cancelDispatch,
  updateDeliveryProgress,
};