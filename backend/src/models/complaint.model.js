import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    spectrogramImageUrl: {
      type: String,
      required: true,
    },
    spectrogramPublicId: {
      type: String,
      required: true,
    },
    modelResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "forwarded", "resolved", "rejected"],
      default: "pending",
    },
    estimatedNoiseLevelDb: {
      type: Number,
      default: null,
    },
    noiseSourceType: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

complaintSchema.index({ "location.latitude": 1, "location.longitude": 1 });

export default mongoose.model("Complaint", complaintSchema);