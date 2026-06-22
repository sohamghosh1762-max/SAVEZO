import express from "express";
import Detection from "../models/Detection.js";

const router = express.Router();

/* SAVE DETECTION */
router.post("/", async (req, res) => {
  try {
    const detection = await Detection.create(
      req.body
    );

    res.json(detection);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* GET DETECTIONS */
router.get("/", async (req, res) => {
  try {
    const detections =
      await Detection.find()
        .sort({ createdAt: -1 })
        .limit(20);

    res.json(detections);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* EDIT DETECTION */
router.put("/:id", async (req, res) => {
  try {
    const detection =
      await Detection.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!detection) {
      return res.status(404).json({
        message: "Detection not found",
      });
    }

    res.json(detection);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* DELETE DETECTION */
router.delete("/:id", async (req, res) => {
  try {
    const detection =
      await Detection.findByIdAndDelete(
        req.params.id
      );

    if (!detection) {
      return res.status(404).json({
        message: "Detection not found",
      });
    }

    res.json({
      message:
        "Detection deleted successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;