import express from "express";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import pollutionRoutes from "./routes/pollution.route.js";
import complaintRoutes from "./routes/complaint.route.js";
import corsMiddleware from "./config/cors.js";

const app = express();

// middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/pollution", pollutionRoutes);

// 404 + error handling
// app.use(notFound);
// app.use(errorHandler);

export default app;
