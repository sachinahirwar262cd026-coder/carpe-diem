import express from "express";
import authRoutes from "./routes/auth.route.js"
import complaintRoutes from "./routes/complaint.route.js"
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);


// 404 + error handling 
// app.use(notFound);
// app.use(errorHandler);

export default app;
