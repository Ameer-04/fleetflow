const driverService = require("../services/driver.service");

const createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(
      req.body
    );

    res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const getDrivers = async (req, res, next) => {
  try {
    const result = await driverService.getDrivers({
      page: req.query.page,
      limit: req.query.limit,
      availability: req.query.availability,
      employmentStatus:
        req.query.employmentStatus,
      search: req.query.search,
    });

    res.json({
      success: true,
      data: result.drivers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(
      req.params.id
    );

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDriver = async (req, res, next) => {
  try {
    await driverService.deleteDriver(
      req.params.id
    );

    res.json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const assignVehicle = async (req, res, next) => {
  try {
    const driver =
      await driverService.assignVehicle(
        req.params.id,
        req.body.vehicleId
      );

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const unassignVehicle = async (req, res, next) => {
  try {
    const driver =
      await driverService.unassignVehicle(
        req.params.id
      );

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
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