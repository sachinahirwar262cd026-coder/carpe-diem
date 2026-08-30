import express from "express";
import { predictPollution } from "../controllers/pollution.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/predict", protect, predictPollution);

export default router;
