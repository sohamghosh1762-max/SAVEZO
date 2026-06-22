"use client";

import { useState } from "react";
import api from "@/lib/api";

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";

type PostCardProps = {
  id?: string | number;

  author: string;
  initials: string;
  time: string;
  text: string;

  image?: string;

  likes?: number;
  comments?: number;
  shares?: number;
  saved?: boolean;

  variant?: "video" | "split" | "gallery" | "alert" | "text";
};

type Comment = {
  id: string | number;
  user: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
};

// Formats large counts the way Facebook does: 1234 -> "1.2K"
const formatCount = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return `${num}`;
};

export function PostCard({
  id,
  author,
  initials,
  time,
  text,
  image,

  likes = 0,
  comments = 0,
  shares = 0,
  saved = false,

  variant = "text",
}: PostCardProps) {
  const [likesCount, setLikesCount] = useState(likes);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [sharesCount, setSharesCount] = useState(shares);
  const [savedPost, setSavedPost] = useState(saved);

  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    try {
      setLiked(!liked);

      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

      if (id) {
        await api.put(`/posts/${id}/like`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      user: "Alex Johnson",
      text: commentText,
      time: "Just now",
      likes: 0,
      liked: false,
    };

    try {
      setCommentsList((prev) => [...prev, newComment]);
      setCommentsCount((prev) => prev + 1);

      if (id) {
        await api.post(`/posts/${id}/comment`, newComment);
      }

      setCommentText("");
    } catch (error) {
      console.log(error);
    }
  };

  // Likes a single comment (not the whole post) — mirrors Facebook's
  // per-comment "Like" so you can see how many people liked that comment.
  const handleCommentLike = async (commentId: string | number) => {
    setCommentsList((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );

    try {
      if (id) {
        // Adjust/remove this if your backend doesn't have a per-comment like route yet.
        await api.put(`/posts/${id}/comment/${commentId}/like`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async () => {
    try {
      navigator.clipboard.writeText(window.location.href);

      setSharesCount((prev) => prev + 1);

      if (id) {
        await api.put(`/posts/${id}/share`);
      }

      alert("Post link copied!");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      setSavedPost(!savedPost);

      if (id) {
        await api.put(`/posts/${id}/save`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="
        bg-card
        border border-border
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:shadow-md
        transition
        mb-4
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {initials}
          </div>

          <div>
            <div className="font-semibold text-sm text-foreground">
              {author}
            </div>

            <div className="text-[11px] text-muted-foreground">
              {time}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition ${
            savedPost
              ? "bg-blue-500 text-white"
              : "bg-muted border border-border text-muted-foreground"
          }`}
        >
          <Bookmark size={12} />
          Save
        </button>
      </div>

      {/* POST TEXT */}
      {text && (
        <div className="px-4 pb-3 text-muted-foreground text-sm leading-relaxed">
          {text}
        </div>
      )}

      {/* MONGODB IMAGE */}
      {image && (
        <div className="relative">
          <img
            src={image}
            alt="Post"
            className="w-full max-h-[650px] object-cover"
          />

          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
            ✔ AI Verified
          </div>
        </div>
      )}

      {/* OLD DEMO VIDEO */}
      {!image && variant === "video" && (
        <div className="h-64 bg-muted flex items-center justify-center text-5xl">
          🎥
        </div>
      )}

      {/* OLD DEMO SPLIT */}
      {!image && variant === "split" && (
        <div className="grid grid-cols-2">
          <div className="h-40 bg-muted flex items-center justify-center text-2xl">
            🏛️
          </div>

          <div className="h-40 bg-muted flex items-center justify-center text-2xl">
            🎤
          </div>
        </div>
      )}

      {/* OLD DEMO GALLERY */}
      {!image && variant === "gallery" && (
        <div className="grid grid-cols-2 grid-rows-2">
          <div className="col-span-2 h-44 bg-muted flex items-center justify-center text-2xl">
            🌅
          </div>

          <div className="h-32 bg-muted flex items-center justify-center text-xl">
            🌊
          </div>

          <div className="h-32 bg-muted flex items-center justify-center text-sm">
            +4
          </div>
        </div>
      )}

      {/* ALERT */}
      {variant === "alert" && (
        <div className="p-4 bg-red-500/10 border-t border-red-500/30">
          <h3 className="text-red-500 font-semibold text-sm mb-1">
            ⚠ Suicide Risk Detected
          </h3>

          <p className="text-xs text-muted-foreground">
            AI detected possible self-harm related content.
          </p>

          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 w-[73%]" />
          </div>
        </div>
      )}

      {/* FOOTER */}
      {variant !== "alert" && (
        <>
          <div className="px-4 pt-3 flex justify-between text-xs text-muted-foreground">
            <span>{formatCount(likesCount)} Likes</span>

            <span>
              {formatCount(commentsCount)} Comments • {formatCount(sharesCount)} Shares
            </span>
          </div>

          <div className="flex items-center justify-around px-4 py-3 text-sm text-muted-foreground border-t border-border mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition ${
                liked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
              Like
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:text-blue-500 transition"
            >
              <MessageCircle size={18} />
              Comment
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-green-500 transition"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </>
      )}

      {showComments && (
        <div className="border-t border-border p-4">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
          />

          <button
            onClick={handleComment}
            className="mt-2 px-4 py-2 rounded-lg bg-blue-500 text-white"
          >
            Post Comment
          </button>

          {/* COMMENTS — who commented, and how many liked each comment */}
          <div className="mt-4 space-y-4">
            {commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {comment.user.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="relative inline-block max-w-full">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <p className="font-semibold text-sm">{comment.user}</p>
                      <p className="text-sm break-words">{comment.text}</p>
                    </div>

                    {/* Like-count badge, overlapping the bubble like Facebook */}
                    {comment.likes > 0 && (
                      <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-card border border-border rounded-full px-1.5 py-0.5 shadow-sm">
                        <Heart size={10} className="text-red-500" fill="currentColor" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatCount(comment.likes)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 ml-1 text-xs text-muted-foreground">
                    <span>{comment.time}</span>
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`font-semibold hover:underline ${
                        comment.liked ? "text-blue-500" : ""
                      }`}
                    >
                      Like
                    </button>
                    <button className="font-semibold hover:underline">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}