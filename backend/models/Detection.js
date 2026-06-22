import mongoose from "mongoose";

const DetectionSchema =
  new mongoose.Schema(
    {
      filename: String,

      fileType: String,

      preview: String,

      result: String,

      confidence: Number,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Detection",
  DetectionSchema
);