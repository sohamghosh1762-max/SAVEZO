"use client";

import { useEffect, useState } from "react";

interface TextStoryModalProps {
  open: boolean;
  onClose: () => void;

  onCreate: (story: {
    text: string;
    background: string;
  }) => void;

  initialText?: string;
  initialBackground?: string;
  isEditing?: boolean;
}

const backgrounds = [
  "from-pink-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-600",
  "from-indigo-500 to-purple-700",
  "from-yellow-500 to-orange-600",
];

export function TextStoryModal({
  open,
  onClose,
  onCreate,
  initialText = "",
  initialBackground = backgrounds[0],
  isEditing = false,
}: TextStoryModalProps) {
  const [text, setText] = useState(initialText);
  const [background, setBackground] = useState(initialBackground);

  useEffect(() => {
    if (open) {
      setText(initialText);
      setBackground(initialBackground);
    }
  }, [open, initialText, initialBackground]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!text.trim()) return;

    onCreate({
      text,
      background,
    });

    setText("");
    setBackground(backgrounds[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center">

      <div className="bg-card rounded-3xl w-[1000px] max-w-[95vw] h-[700px] overflow-hidden shadow-2xl flex">

        {/* LEFT PANEL */}
        <div className="w-[340px] border-r border-border p-6 flex flex-col">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {isEditing ? "Edit Story" : "Create Story"}
            </h2>

            <button
              onClick={onClose}
              className="text-2xl text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <p className="font-semibold">Soham Ghosh</p>
            <p className="text-sm text-muted-foreground">
              Your Story
            </p>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing..."
            maxLength={250}
            className="
              w-full
              h-[180px]
              p-4
              rounded-xl
              border
              border-border
              bg-background
              resize-none
              outline-none
              text-lg
            "
          />

          <div className="mt-6">
            <p className="font-medium mb-3">
              Background Color
            </p>

            <div className="flex flex-wrap gap-3">
              {backgrounds.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackground(color)}
                  className={`
                    w-12
                    h-12
                    rounded-full
                    bg-gradient-to-br
                    ${color}
                    border-4
                    ${
                      background === color
                        ? "border-white"
                        : "border-transparent"
                    }
                  `}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto flex gap-3">
            <button
              onClick={onClose}
              className="
                flex-1
                py-3
                rounded-xl
                border
                border-border
                hover:bg-muted
              "
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="
                flex-1
                py-3
                rounded-xl
                bg-blue-600
                text-white
                disabled:opacity-50
                hover:bg-blue-700
              "
            >
              {isEditing
                ? "Save Changes"
                : "Publish Story"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - LIVE PREVIEW */}
        <div className="flex-1 flex items-center justify-center bg-muted">

          <div
            className={`
              w-[350px]
              h-[620px]
              rounded-3xl
              shadow-2xl
              bg-gradient-to-br
              ${background}
              flex
              items-center
              justify-center
              p-8
              relative
              overflow-hidden
            `}
          >
            <div className="absolute inset-0 bg-black/10" />

            <h1
              className="
                relative
                text-white
                text-4xl
                font-extrabold
                text-center
                leading-tight
                drop-shadow-xl
                break-words
              "
            >
              {text || "Your story preview"}
            </h1>
          </div>

        </div>

      </div>

    </div>
  );
}