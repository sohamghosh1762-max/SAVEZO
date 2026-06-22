import express from "express";
import Story from "../models/Story.js";

const router = express.Router();

/* CREATE STORY */
router.post("/", async (req, res) => {
  try {
    const story = await Story.create(req.body);
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* GET STORIES */
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({
      createdAt: -1,
    });

    res.json(stories);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedStory =
      await Story.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(updatedStory);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(story);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* DELETE STORY */
router.delete("/:id", async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);

    res.json({
      message: "Story deleted",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;