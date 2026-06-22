import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    text: {
      type: String,
      default: "",
    },

    background: {
      type: String,
      default: "",
    },

    avatar: {
  type: String,
  default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 Hours Auto Delete
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Story", StorySchema);