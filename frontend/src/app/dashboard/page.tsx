"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import { SidebarRight } from "@/components/dashboard/SidebarRight";
import { PostCard } from "@/components/dashboard/PostCard";
import { CreatePostModal } from "@/components/dashboard/CreatePostModal";
import { StoriesBar } from "@/components/dashboard/StoriesBar";

import api from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();

  const [mongoPosts, setMongoPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] =
    useState<any>(null);

  // ==========================
  // AUTH CHECK
  // ==========================
  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const user =
      localStorage.getItem("savezoUser");

    if (!token || !user) {
      router.push("/auth");
      return;
    }

    setCurrentUser(
      JSON.parse(user)
    );
  }, [router]);

  // ==========================
  // FETCH POSTS
  // ==========================
  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");

      setMongoPosts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ==========================
  // REALTIME NEW POST
  // ==========================
  const handleAddPost = (
    newPost: any
  ) => {
    setMongoPosts((prev) => [
      newPost,
      ...prev,
    ]);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        lg:grid-cols-[260px_1fr_280px]
        min-h-[calc(100vh-68px)]
        bg-background
        text-foreground
        transition-colors
        duration-300
      "
    >
      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:block border-r border-border">
        <SidebarLeft />
      </aside>

      {/* FEED */}
      <main className="flex justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-[620px]">

          {/* CREATE POST */}
          <CreatePostModal
            onPost={handleAddPost}
          />

          {/* STORIES */}
          <StoriesBar />

          {/* POSTS */}
          {mongoPosts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No posts available
            </div>
          ) : (
            mongoPosts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                author={
                  post.userName ||
                  "Unknown User"
                }
                initials={
                  post.userName
                    ?.charAt(0)
                    .toUpperCase() || "U"
                }
                time={new Date(
                  post.createdAt
                ).toLocaleString()}
                text={post.text}
                image={post.image}
                likes={post.likes || 0}
                comments={
                  post.comments || 0
                }
                shares={post.shares || 0}
                saved={
                  post.saved || false
                }
              />
            ))
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden lg:block border-l border-border">
        <SidebarRight />
      </aside>
    </div>
  );
}