import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

router.get("/dummy-posts", async (req, res) => {
  try {
    await Post.insertMany([
      {
        userName: "Alex Rivera",
        text: "Incredible drone footage I captured over the city last night 🌃✨",
      },
      {
        userName: "Samira Khan",
        text: "Amazing day at the AI Safety Conference! #DigitalWellbeing",
      },
      {
        userName: "James Park",
        text: "Quick tutorial I made on how to spot AI-generated deepfake videos.",
      },
      {
        userName: "AI Safety System",
        text: "AI detected suspicious content.",
      },
      {
        userName: "Mia Laurent",
        text: "Weekend vibes 🌞 Nature is the best therapy.",
      },
      {
        userName: "Zara Mitchell",
        text: "Thread 🧵 on why AI-powered moderation is the only scalable solution for platform safety.",
      },
    ]);

    res.json({
      message: "Dummy posts inserted successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;