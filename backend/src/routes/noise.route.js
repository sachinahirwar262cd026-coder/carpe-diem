import express from "express";
import { getForecast, getMapPoints } from "../controllers/noise.controller.js";
const router = express.Router();
router.post("/forecast", getForecast);
router.post("/map-points", getMapPoints);
export default router;