"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";

interface ProfileHeaderProps {
  user: any;
  postsCount: number;
  onEdit: () => void;
  onUserUpdate: (user: any) => void;
}

export default function ProfileHeader({
  user,
  postsCount,
  onEdit,
  onUserUpdate,
}: ProfileHeaderProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        // ✅ Fixed: send actual base64 instead of ""
        const res = await api.put(`/users/${user._id}/profile-picture`, {
          profilePicture: reader.result,
        });

        onUserUpdate(res.data);
        setProfileMenuOpen(false);
      } catch (error) {
        console.log(error);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        // ✅ Fixed: send actual base64 instead of ""
        const res = await api.put(`/users/${user._id}/cover-picture`, {
          coverPicture: reader.result,
        });

        onUserUpdate(res.data);
        setCoverMenuOpen(false);
      } catch (error) {
        console.log(error);
      }
    };

    reader.readAsDataURL(file);
  };

  // ✅ Fixed: send "" to clear (remove) the picture — no reader needed here
  const removeProfile = async () => {
    try {
      const res = await api.put(`/users/${user._id}/profile-picture`, {
        profilePicture: "",
      });

      onUserUpdate(res.data);
      setProfileMenuOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const removeCover = async () => {
    try {
      const res = await api.put(`/users/${user._id}/cover-picture`, {
        coverPicture: "",
      });

      onUserUpdate(res.data);
      setCoverMenuOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* Hidden Inputs */}
      <input
        type="file"
        hidden
        ref={profileInputRef}
        accept="image/*"
        onChange={handleProfileUpload}
        // ✅ Allow re-selecting the same file
        onClick={(e) => (e.currentTarget.value = "")}
      />

      <input
        type="file"
        hidden
        ref={coverInputRef}
        accept="image/*"
        onChange={handleCoverUpload}
        onClick={(e) => (e.currentTarget.value = "")}
      />

      {/* Cover + Avatar wrapper */}
      <div className="relative">

        {/* Cover */}
        <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          {user?.coverPicture && (
            <img
              src={user.coverPicture}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          {/* Cover Menu */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setCoverMenuOpen(!coverMenuOpen)}
              className="px-4 py-2 rounded-lg bg-black/60 text-white backdrop-blur"
            >
              📷 Edit Cover Photo
            </button>

            {coverMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#0d1320] border border-gray-700 rounded-xl shadow-2xl z-50">
                <button
                  onClick={() => {
                    coverInputRef.current?.click();
                    setCoverMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-white/5"
                >
                  📷 Choose Cover Photo
                </button>

                {/* ✅ Fixed: added proper styling classes */}
                <button
                  onClick={() => {
                    coverInputRef.current?.click();
                    setCoverMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-white/5"
                >
                  ⬆ Upload Photo
                </button>

                <button className="w-full px-4 py-3 text-left hover:bg-white/5">
                  ↔ Reposition
                </button>

                <button
                  onClick={removeCover}
                  className="w-full px-4 py-3 text-left text-red-500 hover:bg-white/5"
                >
                  🗑 Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute left-6 -bottom-16 z-10">
          <div
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="relative cursor-pointer"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-36 h-36 rounded-full border-4 border-background object-cover shadow-xl bg-background"
              />
            ) : (
              <div className="w-36 h-36 rounded-full border-4 border-background bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}

            {/* Camera Icon */}
            <div className="absolute bottom-2 right-2 bg-white text-black rounded-full p-2 shadow-lg">
              📷
            </div>
          </div>

          {profileMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-[#0d1320] border border-gray-700 rounded-xl shadow-2xl z-50">
              <button
                onClick={() => {
                  profileInputRef.current?.click();
                  setProfileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-white/5"
              >
                ⬆ Upload New Picture
              </button>

              <button
                onClick={removeProfile}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-white/5"
              >
                🗑 Remove Picture
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-20 md:mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6 md:pl-44">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.name || "Alex Johnson"}
          </h1>

          <p className="text-muted-foreground">
            @{user?.username || "alexjohnson"}
          </p>

          <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
            {user?.bio || "No bio added yet"}
          </p>

          <div className="flex gap-8 mt-4">
            <div>
              <p className="font-bold text-lg text-foreground">{postsCount}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>

            <div>
              <p className="font-bold text-lg text-foreground">{user?.followers || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>

            <div>
              <p className="font-bold text-lg text-foreground">{user?.following || 0}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>

            <div>
              <p className="font-bold text-lg text-green-500">99%</p>
              <p className="text-sm text-muted-foreground">AI Trust Score</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white hover:opacity-90 transition"
          >
            Edit Profile
          </button>

          <button className="px-5 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition">
            Share Profile
          </button>
        </div>
      </div>
    </div>
  );
}