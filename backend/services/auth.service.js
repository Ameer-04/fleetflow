const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const toPublicUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  const { password, __v, ...publicUser } = safeUser;
  return publicUser;
};

const register = async (name, email, password) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });

  const token = generateToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
};

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
};

module.exports = { register, login, getUserById };