import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    profilePicture: {
      type: String,
      default: "",
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
    /* USER INFO */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    /* POST CONTENT */
    text: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    /* FEELING / ACTIVITY */
    feeling: {
      type: String,
      default: "",
    },

    /* ENGAGEMENT */
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

    /* COMMENT LIST */
    commentsList: {
      type: [CommentSchema],
      default: [],
    },

    /* OPTIONAL */
    isEdited: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Post",
  PostSchema
);