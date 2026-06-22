import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
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

    avatar: {
      type: String,
      default: "",
    },

    /* STORY CONTENT */
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

    /* STORY SETTINGS */
    views: {
      type: Number,
      default: 0,
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },

    /* AUTO DELETE AFTER 24 HOURS */
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Story",
  StorySchema
);