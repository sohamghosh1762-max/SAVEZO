import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,

    username: String,

    email: String,

    bio: String,

    location: String,

    university: String,

    skills: [String],

    profilePicture: {
      type: String,
      default: "",
    },

    coverPicture: {
      type: String,
      default: "",
    },

    followers: {
      type: Number,
      default: 0,
    },

    following: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);