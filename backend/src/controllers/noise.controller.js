import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { getNoisePrediction } from "../services/ml.service.js";

//  @route   POST /api/noise/predict
// @access  Private
// @body    { latitude: Number, longitude: Number }
const predictNoise = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, message: "latitude and longitude are required" });
  }

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({ success: false, message: "Invalid latitude/longitude values" });
  }

  // Update user's last known location (useful later for hyper-local alerts)
  await User.findByIdAndUpdate(req.user._id, {
    lastKnownLocation: { latitude, longitude, updatedAt: new Date() },
  });

  const prediction = await getNoisePrediction(latitude, longitude);

  res.status(200).json({
    success: true,
    data: prediction,
  });
});

export default { predictNoise };
