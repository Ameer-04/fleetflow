const express = require("express");
const { body, param, query, validationResult } = require("express-validator");

const dispatchController = require("../controllers/dispatchController");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  next();
};

const dispatchId = param("id").isMongoId().withMessage("Invalid dispatch ID");

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "dispatcher"),
  [
    body("deliveryId").isMongoId().withMessage("A valid delivery is required"),
    body("driverId").isMongoId().withMessage("A valid driver is required"),
    body("vehicleId").isMongoId().withMessage("A valid vehicle is required"),
    body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes are too long"),
  ],
  validate,
  dispatchController.createDispatch
);

router.get(
  "/",
  authorizeRoles("admin", "dispatcher", "driver"),
  [
    query("status").optional({ values: "falsy" }).isIn(["assigned", "started", "completed", "cancelled"]).withMessage("Invalid dispatch status"),
    query("driver").optional({ values: "falsy" }).isMongoId().withMessage("Invalid driver ID"),
    query("vehicle").optional({ values: "falsy" }).isMongoId().withMessage("Invalid vehicle ID"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt(),
  ],
  validate,
  dispatchController.getDispatches
);

router.get(
  "/:id",
  authorizeRoles("admin", "dispatcher", "driver"),
  dispatchId,
  validate,
  dispatchController.getDispatchById
);

router.post(
  "/:id/start",
  authorizeRoles("admin", "dispatcher", "driver"),
  dispatchId,
  validate,
  dispatchController.startDispatch
);

router.post(
  "/:id/complete",
  authorizeRoles("admin", "dispatcher", "driver"),
  dispatchId,
  validate,
  dispatchController.completeDispatch
);

router.post(
  "/:id/cancel",
  authorizeRoles("admin", "dispatcher"),
  dispatchId,
  validate,
  dispatchController.cancelDispatch
);

router.post(
  "/:id/delivery-status",
  authorizeRoles("admin", "dispatcher", "driver"),
  dispatchId,
  body("status").isIn(["in_transit", "out_for_delivery", "delivered"]).withMessage("Invalid delivery progress status"),
  validate,
  dispatchController.updateDeliveryProgress
);

module.exports = router;