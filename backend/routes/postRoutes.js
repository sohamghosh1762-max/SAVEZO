import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

/* CREATE POST */
router.post("/", async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* GET ALL POSTS */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* GET SAVED POSTS */
router.get("/saved/all", async (req, res) => {
  try {
    const posts = await Post.find({
      saved: true,
    }).sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* LIKE POST */
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.likes += 1;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ADD COMMENT */
router.post("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = {
      user: req.body.user,
      text: req.body.text,
    };

    post.comments += 1;
    post.commentsList.push(comment);

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* GET COMMENTS */
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post.commentsList);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* SHARE POST */
router.put("/:id/share", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.shares += 1;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* SAVE / UNSAVE POST */
router.put("/:id/save", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.saved = !post.saved;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* DELETE COMMENT */
router.delete("/:postId/comment/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.postId
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.commentsList = post.commentsList.filter(
      (comment) =>
        comment._id.toString() !==
        req.params.commentId
    );

    post.comments = post.commentsList.length;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* DELETE POST */
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;