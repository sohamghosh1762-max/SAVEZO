import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* GET PROFILE */
router.get("/", async (req, res) => {
  try {
    let user = await User.findOne();

    if (!user) {
      user = await User.create({
        name: "Soham Ghosh",
        username: "sg_2200",
        bio: "AI/ML Student",
        location: "Kolkata, India",
        university: "Brainware University",
        profilePicture: "",
        coverPicture: "",
        followers: 0,
        following: 0,
      });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

/* UPDATE PROFILE */
router.put("/", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {},
      req.body,
      {
        new: true,
        upsert: true,
      }
    );

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

/* UPDATE PROFILE PICTURE */
router.put("/profile-picture", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {},
      {
        profilePicture: req.body.profilePicture,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

/* UPDATE COVER PICTURE */
router.put("/cover-picture", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {},
      {
        coverPicture: req.body.coverPicture,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

/* FOLLOW USER */
router.put("/follow", async (req, res) => {
  try {
    const user = await User.findOne();

    user.followers += 1;

    await user.save();

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

/* UNFOLLOW USER */
router.put("/unfollow", async (req, res) => {
  try {
    const user = await User.findOne();

    user.followers = Math.max(
      0,
      user.followers - 1
    );

    await user.save();

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

export default router;