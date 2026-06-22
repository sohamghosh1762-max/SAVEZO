"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

export default function RecentDetections() {
  const [detections, setDetections] = useState<any[]>([]);

  const fetchDetections = async () => {
    try {
      const res = await api.get("/detections");
      setDetections(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Delete this detection?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/detections/${id}`
      );

      setDetections((prev) =>
        prev.filter(
          (item) => item._id !== id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (
    id: string,
    currentName: string
  ) => {
    const newName = window.prompt(
      "Edit filename",
      currentName
    );

    if (!newName) return;

    try {
      const res = await api.put(
        `/detections/${id}`,
        {
          filename: newName,
        }
      );

      setDetections((prev) =>
        prev.map((item) =>
          item._id === id
            ? res.data
            : item
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        📁 Recent Detections
      </h2>

      {detections.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No detections yet
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {detections.map((item) => {
            const isFake =
              item.result === "Fake";

            return (
              <div
                key={item._id}
                className="
                  bg-white/5
                  border
                  border-white/10
                  rounded-xl
                  p-4
                  hover:border-primary/40
                  transition
                "
              >
                {/* Preview */}
                <div
                  className="
                    h-20
                    rounded-lg
                    bg-white/5
                    overflow-hidden
                    flex
                    items-center
                    justify-center
                    mb-4
                  "
                >
                  {item.preview ? (
                    item.fileType?.startsWith(
                      "image"
                    ) ? (
                      <img
                        src={item.preview}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl">
                        🎬
                      </div>
                    )
                  ) : (
                    <div className="text-3xl">
                      {item.fileType?.includes(
                        "video"
                      )
                        ? "🎬"
                        : "🖼️"}
                    </div>
                  )}
                </div>

                {/* Name + Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium truncate flex-1">
                    {item.filename}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleEdit(
                          item._id,
                          item.filename
                        )
                      }
                      className="
                        text-blue-400
                        hover:text-blue-300
                        transition
                      "
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          item._id
                        )
                      }
                      className="
                        text-red-400
                        hover:text-red-300
                        transition
                      "
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Result */}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isFake
                      ? "bg-red-500/20 text-red-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {item.confidence}%{" "}
                  {item.result}
                </span>

                {/* Time */}
                <p className="text-[11px] text-muted-foreground mt-3">
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}