const {
  login,
  register,
  getUserById: getUserByIdService,
} = require("../services/auth.service");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookieOptions");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await register(name, email, password);

    setAuthCookie(res, token);
    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login(email, password);

    setAuthCookie(res, token);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const adminOnlyRoute = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: req.user,
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserById,
  adminOnlyRoute,
};