const deliveryService = require("../services/delivery.service");

const createDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.createDelivery(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveries = async (req, res, next) => {
  try {
    const result = await deliveryService.getDeliveries(
      req.query
    );

    res.status(200).json({
      success: true,
      data: result.deliveries,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveryById = async (req, res, next) => {
  try {
    const delivery =
      await deliveryService.getDeliveryById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const updateDelivery = async (req, res, next) => {
  try {
    const delivery =
      await deliveryService.updateDelivery(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Delivery updated successfully",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const changeDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      const error = new Error(
        "Status is required"
      );

      error.statusCode = 400;

      throw error;
    }

    const delivery =
      await deliveryService.changeDeliveryStatus(
        req.params.id,
        status
      );

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const cancelDelivery = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const delivery =
      await deliveryService.cancelDelivery(
        req.params.id,
        reason
      );

    res.status(200).json({
      success: true,
      message: "Delivery cancelled successfully",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDelivery = async (req, res, next) => {
  try {
    await deliveryService.deleteDelivery(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Delivery deleted successfully",
    });
  } catch (error) {
    next(error);
  }
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