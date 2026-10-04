const User = require("../models/User");
const Driver = require("../models/Driver");

const getUsers = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
    const filter = { accountStatus: "active" };

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const assignedDriverUsers = await Driver.distinct("user");
    const users = await User.find({
      ...filter,
      _id: { $nin: assignedDriverUsers },
    })
      .select("name email role")
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
