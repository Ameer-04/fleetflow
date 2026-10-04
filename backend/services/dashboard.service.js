const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Dispatch = require("../models/Dispatch");

const getDashboardOverview = async () => {
  const [
    deliveryStats,
    deliveryPriorityStats,
    vehicleStats,
    driverStats,
    dispatchStats,
    recentDispatches,
  ] = await Promise.all([
    getDeliveryStats(),
    getDeliveryPriorityStats(),
    getVehicleStats(),
    getDriverStats(),
    getDispatchStats(),
    getRecentDispatches(),
  ]);

  return {
    deliveries: deliveryStats,
    priorities: deliveryPriorityStats,
    vehicles: vehicleStats,
    drivers: driverStats,
    dispatches: dispatchStats,
    recentDispatches,
  };
};

const getDeliveryStats = async () => {
  const stats = await Delivery.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    ready_for_dispatch: 0,
    dispatched: 0,
    picked_up: 0,
    in_transit: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };

  stats.forEach((item) => {
    result[item._id] = item.count;
    result.total += item.count;
  });

  return result;
};

const getDeliveryPriorityStats = async () => {
  const stats = await Delivery.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    low: 0,
    normal: 0,
    high: 0,
    urgent: 0,
  };

  stats.forEach((item) => {
    result[item._id] = item.count;
  });

  return result;
};

const getVehicleStats = async () => {
  const stats = await Vehicle.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    available: 0,
    assigned: 0,
    in_transit: 0,
    maintenance: 0,
    inactive: 0,
  };

  stats.forEach((item) => {
    result[item._id] = item.count;
    result.total += item.count;
  });

  return result;
};


const getDriverStats = async () => {
  const [employmentStats, availabilityStats] =
    await Promise.all([
      Driver.aggregate([
        {
          $group: {
            _id: "$employmentStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      Driver.aggregate([
        {
          $group: {
            _id: "$availability",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  const employment = {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    terminated: 0,
  };

  employmentStats.forEach((item) => {
    employment[item._id] = item.count;
    employment.total += item.count;
  });

  const availability = {
    available: 0,
    unavailable: 0,
    on_delivery: 0,
    on_leave: 0,
  };

  availabilityStats.forEach((item) => {
    availability[item._id] = item.count;
  });

  return {
    employment,
    availability,
  };
};

const getDispatchStats = async () => {
  const stats = await Dispatch.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    assigned: 0,
    started: 0,
    completed: 0,
    cancelled: 0,
  };

  stats.forEach((item) => {
    result[item._id] = item.count;
    result.total += item.count;
  });

  return result;
};

const getRecentDispatches = async () =>
  Dispatch.find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("delivery")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("vehicle")
    .lean();

module.exports = {
  getDashboardOverview,
};