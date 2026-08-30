import Complaint from "../models/complaint.model.js"
import asyncHandler from "../utils/asyncHandler.util.js"
import uploadBufferToCloudinary from "../utils/uploadBuffer.util.js"
import getNoiseComplaintAnalysis from "../services/ml.service.js"

const createComplaint = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Spectrogram image is required" });
  }

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: "latitude and longitude are required" });
  }

  const location = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };

  // Upload the in-memory file buffer straight to Cloudinary - nothing touches local disk
  let secureUrl, publicId;
  try {
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "noise-complaints");
    secureUrl = uploadResult.secureUrl;
    publicId = uploadResult.publicId;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return res.status(502).json({ success: false, message: "Failed to upload spectrogram image" });
  }

  // Save complaint with the Cloudinary URL, status pending
  const complaint = await Complaint.create({
    user: req.user._id,
    location,
    spectrogramImageUrl: secureUrl,
    spectrogramPublicId: publicId,
  });

  try {
    // Forward just the image URL + location to the noise classification model
    const modelResponse = await getNoiseComplaintAnalysis(secureUrl, location);

    complaint.modelResponse = modelResponse;
    complaint.status = "forwarded";
    await complaint.save();
  } catch (error) {
    // Complaint (and its Cloudinary URL) is still saved even if the model call fails - can retry later
    console.error("Failed to forward complaint to noise model:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Complaint submitted successfully",
    data: { complaint },
  });
});

// @route   GET /api/complaints/me
// @access  Private
const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { complaints } });
});

export default { createComplaint, getMyComplaints };