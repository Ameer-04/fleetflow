const express = require("express");
const { body, param, query, validationResult } = require("express-validator");

const vehicleController = require("../controllers/vehicle.controller");
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

const vehicleFields = (partial = false) => {
  const textField = (name, message) => {
    const field = body(name).trim();

    if (partial) {
      field.optional();
    }

    return field.notEmpty().withMessage(message);
  };

  const numberField = body("year");
  const capacityField = body("capacity");

  if (partial) {
    numberField.optional();
    capacityField.optional();
  }

  return [
    textField("registrationNumber", "Registration number is required"),
    textField("make", "Make is required"),
    textField("model", "Model is required"),
    numberField
      .isInt({ min: 1886, max: 2100 })
      .withMessage("Year must be between 1886 and 2100")
      .toInt(),
    (partial ? body("type").optional() : body("type"))
      .isIn(["van", "truck", "pickup", "motorcycle", "refrigerated_truck"])
      .withMessage("Invalid vehicle type"),
    capacityField
      .isFloat({ min: 0 })
      .withMessage("Capacity must be a non-negative number")
      .toFloat(),
    body("capacityUnit")
      .optional()
      .isIn(["kg", "ton"])
      .withMessage("Capacity unit must be kg or ton"),
    body("status")
      .optional()
      .isIn(["available", "assigned", "in_transit", "maintenance", "inactive"])
      .withMessage("Invalid vehicle status"),
  ];
};

const vehicleId = param("id").isMongoId().withMessage("Invalid vehicle ID");

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin"),
  vehicleFields(),
  validate,
  vehicleController.createVehicle
);

router.get(
  "/",
  authorizeRoles("admin", "dispatcher"),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt(),
    query("status")
      .optional({ values: "falsy" })
      .isIn(["available", "assigned", "in_transit", "maintenance", "inactive"])
      .withMessage("Invalid vehicle status"),
    query("type")
      .optional({ values: "falsy" })
      .isIn(["van", "truck", "pickup", "motorcycle", "refrigerated_truck"])
      .withMessage("Invalid vehicle type"),
    query("sortBy")
      .optional({ values: "falsy" })
      .isIn(["registrationNumber", "make", "model", "year", "type", "capacity", "status", "createdAt"])
      .withMessage("Invalid sort field"),
    query("sortOrder")
      .optional({ values: "falsy" })
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
  ],
  validate,
  vehicleController.getVehicles
);

router.get(
  "/:id",
  authorizeRoles("admin", "dispatcher"),
  vehicleId,
  validate,
  vehicleController.getVehicleById
);

router.patch(
  "/:id",
  authorizeRoles("admin"),
  vehicleId,
  vehicleFields(true),
  validate,
  vehicleController.updateVehicle
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  vehicleId,
  validate,
  vehicleController.deleteVehicle
);

module.exports = router;