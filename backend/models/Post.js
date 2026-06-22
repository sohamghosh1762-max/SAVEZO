import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const PostSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: {
      type: Number,
      default: 0,
    },

    shares: {
      type: Number,
      default: 0,
    },

    saved: {
      type: Boolean,
      default: false,
    },

    commentsList: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Post",
  PostSchema
);