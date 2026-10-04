const dispatchService = require("../services/Dispatch.service");

const createDispatch = async (req, res, next) => {
  try {
    const dispatch =
      await dispatchService.createDispatch(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Dispatch created successfully",
      data: dispatch,
    });
  } catch (error) {
    next(error);
  }
};

const getDispatches = async (req, res, next) => {
  try {
    const result =
      await dispatchService.getDispatches(
        req.query,
        req.user
      );

    res.status(200).json({
      success: true,
      data: result.dispatches,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getDispatchById = async (
  req,
  res,
  next
) => {
  try {
    const dispatch =
      await dispatchService.getDispatchById(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    next(error);
  }
};

const startDispatch = async (
  req,
  res,
  next
) => {
  try {
    const dispatch =
      await dispatchService.startDispatch(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Dispatch started",
      data: dispatch,
    });
  } catch (error) {
    next(error);
  }
};

const completeDispatch = async (
  req,
  res,
  next
) => {
  try {
    const dispatch =
      await dispatchService.completeDispatch(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Dispatch completed",
      data: dispatch,
    });
  } catch (error) {
    next(error);
  }
};

const updateDeliveryProgress = async (req, res, next) => {
  try {
    const dispatch = await dispatchService.updateDeliveryProgress(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Delivery progress updated",
      data: dispatch,
    });
  } catch (error) {
    next(error);
  }
};

const cancelDispatch = async (
  req,
  res,
  next
) => {
  try {
    const dispatch =
      await dispatchService.cancelDispatch(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Dispatch cancelled",
      data: dispatch,
    });
  } catch (error) {
    next(error);
  }
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