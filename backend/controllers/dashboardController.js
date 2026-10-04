const dashboardService = require("../services/dashboard.service");

const getDashboardOverview = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await dashboardService.getDashboardOverview();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};