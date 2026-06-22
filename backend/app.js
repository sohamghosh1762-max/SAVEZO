import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import storyRoutes from "./routes/storyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";
import detectionRoutes from "./routes/detectionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("SaveZo Backend Running");
});

app.use("/api/stories", storyRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/seed", seedRoutes);

app.use("/api/detections", detectionRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Running 🚀");
});