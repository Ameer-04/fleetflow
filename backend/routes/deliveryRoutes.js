const express = require("express");
const { body, param, query, validationResult } = require("express-validator");

const deliveryController = require("../controllers/deliveryController");
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

const deliveryFields = (partial = false) => [
  ...["customer", "pickup", "destination", "package"].map((field) => {
    const validator = body(field);

    if (partial) {
      validator.optional();
    }

    return validator.isObject().withMessage(`${field} details are required`);
  }),
  body("customer.name").if((value, { req }) => !partial || req.body.customer).trim().notEmpty().withMessage("Customer name is required"),
  body("customer.phone").if((value, { req }) => !partial || req.body.customer).trim().notEmpty().withMessage("Customer phone is required"),
  body("pickup.address").if((value, { req }) => !partial || req.body.pickup).trim().notEmpty().withMessage("Pickup address is required"),
  body("destination.address").if((value, { req }) => !partial || req.body.destination).trim().notEmpty().withMessage("Destination address is required"),
  body("package.description").if((value, { req }) => !partial || req.body.package).trim().notEmpty().withMessage("Package description is required"),
  body("package.weight").if((value, { req }) => !partial || req.body.package).isFloat({ min: 0 }).withMessage("Package weight must be non-negative").toFloat(),
  body("package.quantity").if((value, { req }) => !partial || req.body.package).isInt({ min: 1 }).withMessage("Package quantity must be at least 1").toInt(),
  body("package.weightUnit").optional().isIn(["kg", "ton"]).withMessage("Weight unit must be kg or ton"),
  body("priority").optional().isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid delivery priority"),
  body("scheduledDate").optional({ values: "falsy" }).isISO8601().withMessage("Scheduled date must be valid"),
];

const deliveryId = param("id").isMongoId().withMessage("Invalid delivery ID");

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "dispatcher"),
  deliveryFields(),
  validate,
  deliveryController.createDelivery
);

router.get(
  "/",
  authorizeRoles("admin", "dispatcher", "driver"),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt(),
    query("status").optional({ values: "falsy" }).isIn(["pending", "confirmed", "ready_for_dispatch", "dispatched", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled"]).withMessage("Invalid delivery status"),
    query("priority").optional({ values: "falsy" }).isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid delivery priority"),
    query("search").optional({ values: "falsy" }).trim().isLength({ max: 80 }).withMessage("Search is too long"),
  ],
  validate,
  deliveryController.getDeliveries
);

router.get(
  "/:id",
  authorizeRoles("admin", "dispatcher", "driver"),
  deliveryId,
  validate,
  deliveryController.getDeliveryById
);

router.patch(
  "/:id",
  authorizeRoles("admin", "dispatcher"),
  deliveryId,
  deliveryFields(true),
  validate,
  deliveryController.updateDelivery
);

router.post(
  "/:id/status",
  authorizeRoles("admin", "dispatcher"),
  deliveryId,
  body("status").isIn(["pending", "confirmed", "ready_for_dispatch", "dispatched", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled"]).withMessage("Invalid delivery status"),
  validate,
  deliveryController.changeDeliveryStatus
);

router.post(
  "/:id/cancel",
  authorizeRoles("admin", "dispatcher"),
  deliveryId,
  body("reason").optional().trim().isLength({ max: 500 }).withMessage("Cancellation reason is too long"),
  validate,
  deliveryController.cancelDelivery
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  deliveryId,
  validate,
  deliveryController.deleteDelivery
);

module.exports = router;