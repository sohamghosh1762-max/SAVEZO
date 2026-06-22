import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* SIGN UP */
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
    } = req.body;

    const existingUser =
      await User.findOne({
        $or: [
          { email },
          { username },
        ],
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email or Username already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      bio: "",
      location: "",
      university: "",
      skills: [],
      profilePicture: "",
      coverPicture: "",
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

/* SIGN IN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } =
      req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

/* GET ALL USERS */
router.get("/", async (req, res) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

/* GET USER BY ID */
router.get("/:id", async (req, res) => {
  try {
    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

/* UPDATE PROFILE */
router.put("/:id", async (req, res) => {
  try {
    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      ).select("-password");

    res.json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

/* UPDATE PROFILE PICTURE */
router.put(
  "/:id/profile-picture",
  async (req, res) => {
    try {
      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            profilePicture:
              req.body.profilePicture,
          },
          {
            new: true,
          }
        ).select("-password");

      res.json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json(error);
    }
  }
);

/* UPDATE COVER PICTURE */
router.put(
  "/:id/cover-picture",
  async (req, res) => {
    try {
      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            coverPicture:
              req.body.coverPicture,
          },
          {
            new: true,
          }
        ).select("-password");

      res.json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json(error);
    }
  }
);

/* FOLLOW USER */
router.put(
  "/:id/follow",
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.followers += 1;

      await user.save();

      res.json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json(error);
    }
  }
);

/* UNFOLLOW USER */
router.put(
  "/:id/unfollow",
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.followers =
        Math.max(
          0,
          user.followers - 1
        );

      await user.save();

      res.json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json(error);
    }
  }
);

/* DELETE USER */
router.delete(
  "/:id",
  async (req, res) => {
    try {
      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "User deleted successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json(error);
    }
  }
);

export default router;