"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "@/lib/api";
import { PostCard } from "@/components/dashboard/PostCard";

export default function SavedPostsPage() {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const res = await api.get("/posts/saved/all");

      setPosts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.text
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      post.userName
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-68px)] bg-background text-foreground transition-colors">
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Saved Posts
            <span className="text-muted-foreground ml-2">
              ({filteredPosts.length} Items)
            </span>
          </h1>

          {/* SEARCH */}
          <div className="relative w-full max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved posts..."
              className="
                w-full
                pl-9
                pr-4
                py-2
                rounded-lg
                bg-muted
                border
                border-border
                text-foreground
                placeholder:text-muted-foreground
                outline-none
              "
            />
          </div>
        </div>

        {/* POSTS */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No saved posts found
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                author={post.userName}
                initials={
                  post.userName?.charAt(0).toUpperCase() || "U"
                }
                time={new Date(
                  post.createdAt
                ).toLocaleString()}
                text={post.text}
                image={post.image}
                likes={post.likes}
                comments={post.comments}
                shares={post.shares}
                saved={post.saved}
                variant="text"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}