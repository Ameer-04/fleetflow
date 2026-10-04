const express = require("express");

const { authorizeRoles, protect } = require("../middleware/authMiddleware");

const {
  getDashboardOverview,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get(
  "/overview",
  protect,
  authorizeRoles("admin", "dispatcher", "driver", "user"),
  getDashboardOverview
);

module.exports = router;