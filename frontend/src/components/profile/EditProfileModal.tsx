"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function EditProfileModal({
  open,
  onClose,
  user,
  onSave,
}: any) {
  const [form, setForm] = useState(user);

  useEffect(() => {
    setForm(user);
  }, [user]);

  if (!open) return null;

  const handleSave = async () => {
    try {
      const res = await api.put("/users", form);

      onSave(res.data);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <div className="w-[600px] bg-[#0d1320] rounded-2xl p-6 border border-gray-700">

        <h2 className="text-2xl font-bold mb-6">
          Edit Profile
        </h2>

        <input
          className="w-full p-3 rounded-lg bg-black/30 mb-3"
          placeholder="Name"
          value={form?.name || ""}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          className="w-full p-3 rounded-lg bg-black/30 mb-3"
          placeholder="Username"
          value={form?.username || ""}
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value,
            })
          }
        />

        <textarea
          className="w-full p-3 rounded-lg bg-black/30 mb-3"
          placeholder="Bio"
          value={form?.bio || ""}
          onChange={(e) =>
            setForm({
              ...form,
              bio: e.target.value,
            })
          }
        />

        <input
          className="w-full p-3 rounded-lg bg-black/30 mb-3"
          placeholder="Location"
          value={form?.location || ""}
          onChange={(e) =>
            setForm({
              ...form,
              location: e.target.value,
            })
          }
        />

        <input
          className="w-full p-3 rounded-lg bg-black/30 mb-3"
          placeholder="University"
          value={form?.university || ""}
          onChange={(e) =>
            setForm({
              ...form,
              university: e.target.value,
            })
          }
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}