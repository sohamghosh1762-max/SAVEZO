import express from "express";
import Story from "../models/Story.js";

const router = express.Router();

/* ========================================
   CREATE STORY
======================================== */
router.post("/", async (req, res) => {
  try {
    console.log("===== STORY BODY =====");
    console.log(req.body);

    const story = await Story.create(req.body);

    console.log("===== STORY SAVED =====");
    console.log(story);

    res.status(201).json(story);
  } catch (error) {
    console.log("===== STORY ERROR =====");
    console.log(error);

    res.status(500).json({
      message: error.message,
      error,
    });
  }
});

/* ========================================
   GET ALL STORIES
======================================== */
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({
      createdAt: -1,
    });

    res.status(200).json(stories);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch stories",
      error,
    });
  }
});

/* ========================================
   GET SINGLE STORY
======================================== */
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(
      req.params.id
    );

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.status(200).json(story);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch story",
      error,
    });
  }
});

/* ========================================
   UPDATE STORY
======================================== */
router.put("/:id", async (req, res) => {
  try {
    const story =
      await Story.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.status(200).json(story);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update story",
      error,
    });
  }
});

/* ========================================
   DELETE STORY
======================================== */
router.delete("/:id", async (req, res) => {
  try {
    const story =
      await Story.findByIdAndDelete(
        req.params.id
      );

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.status(200).json({
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete story",
      error,
    });
  }
});

export default router;