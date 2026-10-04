const express = require("express");
const { body, param, query, validationResult } = require("express-validator");

const driverController = require("../controllers/driverController");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

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

const driverFields = (partial = false) => {
  const textField = (name, message) => {
    const field = body(name);

    if (partial) {
      field.optional();
    }

    return field.trim().notEmpty().withMessage(message);
  };

  return [
  (partial ? body("user").optional() : body("user").notEmpty())
    .isMongoId()
    .withMessage("A valid driver user is required"),
  textField("licenseNumber", "License number is required"),
  (partial ? body("licenseExpiry").optional() : body("licenseExpiry").notEmpty())
    .isISO8601()
    .withMessage("A valid license expiry date is required"),
  textField("phone", "Phone is required"),
  body("address").optional().trim(),
  body("emergencyContact").optional().isObject().withMessage("Emergency contact must be an object"),
  body("hireDate").optional({ values: "falsy" }).isISO8601().withMessage("A valid hire date is required"),
  body("employmentStatus")
    .optional()
    .isIn(["active", "inactive", "suspended", "terminated"])
    .withMessage("Invalid employment status"),
  body("availability")
    .optional()
    .isIn(["available", "unavailable", "on_delivery", "on_leave"])
    .withMessage("Invalid availability"),
  ];
};

const driverId = param("id").isMongoId().withMessage("Invalid driver ID");

router.post(
  "/",
  authorizeRoles("admin"),
  driverFields(),
  validate,
  driverController.createDriver
);

router.get(
  "/",
  authorizeRoles("admin", "dispatcher"),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt(),
    query("employmentStatus").optional({ values: "falsy" }).isIn(["active", "inactive", "suspended", "terminated"]).withMessage("Invalid employment status"),
    query("availability").optional({ values: "falsy" }).isIn(["available", "unavailable", "on_delivery", "on_leave"]).withMessage("Invalid availability"),
    query("search").optional({ values: "falsy" }).trim().isLength({ max: 80 }).withMessage("Search is too long"),
  ],
  validate,
  driverController.getDrivers
);

router.get(
  "/:id",
  authorizeRoles("admin", "dispatcher"),
  driverId,
  validate,
  driverController.getDriverById
);

router.patch(
  "/:id",
  authorizeRoles("admin"),
  driverId,
  driverFields(true),
  validate,
  driverController.updateDriver
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  driverId,
  validate,
  driverController.deleteDriver
);

router.post(
  "/:id/assign-vehicle",
  authorizeRoles("admin", "dispatcher"),
  driverId,
  body("vehicleId").isMongoId().withMessage("A valid vehicle is required"),
  validate,
  driverController.assignVehicle
);

router.post(
  "/:id/unassign-vehicle",
  authorizeRoles("admin", "dispatcher"),
  driverId,
  validate,
  driverController.unassignVehicle
);

module.exports = router;