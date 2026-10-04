const express = require("express");
const { query, validationResult } = require("express-validator");
const userController = require("../controllers/userController");
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

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  [
    query("role")
      .optional({ values: "falsy" })
      .isIn(["user", "admin", "dispatcher", "driver"])
      .withMessage("Invalid user role"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
      .toInt(),
  ],
  validate,
  userController.getUsers
);

module.exports = router;
