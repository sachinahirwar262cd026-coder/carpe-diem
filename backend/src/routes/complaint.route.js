import express from "express";
import { createComplaint, getMyComplaints, updateComplaintStatus } from "../controllers/complaint.controller.js";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", protect, upload.single("spectrogram"), createComplaint);
router.get("/me", protect, getMyComplaints);
router.patch("/:id/status", protect, updateComplaintStatus);

export default router;