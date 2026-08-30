import User from "../models/user.model.js";
import asyncHandler from "../utils/asynchandlers.util.js";
import generateToken from "../utils/generatetoken.util.js";

// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, isSensitiveGroup = false } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    isSensitiveGroup: !!isSensitiveGroup,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSensitiveGroup: user.isSensitiveGroup,
      },
      token,
    },
  });
});


// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // password field has select:false in schema, must explicitly include it
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSensitiveGroup: user.isSensitiveGroup,
      },
      token,
    },
  });
});


// @route   POST /api/auth/logout
// @access  Public / Protected
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export { signup, login, logout };