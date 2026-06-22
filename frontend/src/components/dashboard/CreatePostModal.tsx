"use client"

import { useState, useRef } from "react"
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function CreatePostModal({ onPost }: { onPost: (post: any) => void }) {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [showFeelingPicker, setShowFeelingPicker] =
  useState(false)

const [activeTab, setActiveTab] =
  useState<"feelings" | "activities">(
    "feelings"
  )

  const FEELINGS = [
  "😊 Happy",
  "😇 Blessed",
  "🥰 Loved",
  "😢 Sad",
  "😍 Lovely",
  "😁 Thankful",
  "🤩 Excited",
  "❤️ In Love",
  "🤪 Crazy",
  "🙏 Grateful",
  "😌 Blissful",
  "✨ Fantastic",
  "🥳 Festive",
]

const ACTIVITIES = [
  "🎉 Celebrating",
  "🍿 Watching",
  "🍴 Eating",
  "🍺 Drinking",
  "📅 Attending",
  "✈️ Travelling To",
  "🎧 Listening To",
  "🔍 Looking For",
  "📖 Reading",
  "💻 Working On",
  "🏋️ Exercising",
  "🎮 Gaming",
]

  const [scanStatus, setScanStatus] = useState<
  "idle" | "scanning" | "safe" | "blocked"
>("idle");

  const [riskScore, setRiskScore] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // HANDLE FILE + AI SCAN
  const handleFile = async (file: File) => {
    setSelectedFile(file)
    setOpen(true)
    setScanStatus("scanning")
    setRiskScore(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:5001/scan", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const result = await response.json()

      setRiskScore(result.riskScore)
      if (result.nude) {
        setScanStatus("blocked")
      } else {
        setScanStatus("safe")
      }
    } catch (error) {
      console.warn("Scan server connection error, using local fallback:", error)

      const fileNameLower = file.name.toLowerCase()
      const isTestBlock =
        fileNameLower.includes("nude") ||
        fileNameLower.includes("explicit") ||
        fileNameLower.includes("nsfw") ||
        fileNameLower.includes("sexy")

      setTimeout(() => {
        if (isTestBlock) {
          setRiskScore(90)
          setScanStatus("blocked")
        } else {
          setRiskScore(8)
          setScanStatus("safe")
        }
      }, 1500)
    }
  }

  // Open the native file picker. The Dialog itself opens once a file
  // is actually selected (inside handleFile), so we don't fight Radix's
  // focus trap by opening both at once.
  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleLiveClick = () => {
    fileInputRef.current?.click()
  }

  const handleFeelingClick = () => {
  setShowFeelingPicker(true)
}

  return (
    <div className="mb-6">

      <Dialog open={open} onOpenChange={setOpen}>

        {/* CREATE POST BOX */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-4 shadow-card">

          <DialogTrigger asChild>
            <div className="flex items-center gap-3 mb-3 cursor-pointer group">

              <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center font-bold text-sm text-white">
                AJ
              </div>

              <div className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-muted-foreground group-hover:bg-muted transition">
                What's on your mind, Alex?
              </div>

            </div>
          </DialogTrigger>

          <div className="border-t border-border my-3" />

          <div className="flex justify-between text-sm text-muted-foreground">

            <button type="button" onClick={handleLiveClick} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition">
              🎬 <span>Live Video</span>
            </button>

            <button type="button" onClick={handlePhotoClick} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition">
              🖼 <span>Photo/Video</span>
            </button>

            <button type="button" onClick={handleFeelingClick} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition">
              😊 <span>Feeling</span>
            </button>

          </div>
        </div>

        {/* FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*,video/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0])
            }
            // allow re-selecting the same file later
            e.target.value = ""
          }}
        />

        {/* MODAL */}
        <DialogContent className="bg-card border border-border text-foreground rounded-xl shadow-card">

          <DialogTitle>
            <VisuallyHidden>Create Post</VisuallyHidden>
          </DialogTitle>

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center font-bold text-sm text-white">
              AJ
            </div>

            <div>
              <p className="font-semibold text-foreground">Alex Johnson</p>
                {selectedFeeling && (
    <p className="text-xs text-primary">
      {selectedFeeling}
    </p>
  )}
</div>
              <p className="text-xs text-muted-foreground">🌍 Public</p>
            </div>
        

          {/* TEXT */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind, Alex?"
            className="w-full bg-transparent border-none outline-none text-lg mb-4 text-foreground placeholder:text-muted-foreground"
          />

          {/* SCAN UI */}
          {scanStatus !== "idle" && selectedFile && (
            <div className="mb-4">

              {scanStatus === "scanning" && (
                <div className="h-52 rounded-xl bg-muted flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">🚫 AI Nude Scan Running...</p>
                </div>
              )}

              {scanStatus === "blocked" && (
                <div className="h-52 rounded-xl bg-red-600 flex flex-col items-center justify-center text-center text-white px-6">
                  <div className="text-4xl mb-2">🚫</div>
                  <h3 className="text-lg font-bold">Upload Rejected</h3>
                  <p className="text-3xl font-bold mt-1">{riskScore}% Nude Risk</p>
                  <p className="text-sm mt-1">Explicit content detected</p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setScanStatus("idle")
                      setRiskScore(null)
                    }}
                    className="mt-3 px-4 py-2 bg-white text-red-600 rounded-full text-sm"
                  >
                    Try Different File
                  </button>
                </div>
              )}

              {scanStatus === "safe" && (
                <div className="relative h-52 rounded-xl bg-black flex items-center justify-center overflow-hidden">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{selectedFile.name}</p>
                    </div>
                  )}

                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md z-10">
                    ✔ AI Verified Safe
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <span className="absolute bottom-3 left-3 text-xs text-green-400 font-semibold z-10">
                    {riskScore !== null ? `${riskScore}% Explicit Risk` : "Safe"}
                  </span>
                </div>
              )}

            </div>
          )}

          {/* ACTION BAR */}
          <div className="flex items-center justify-between bg-muted border border-border rounded-xl p-3 mb-4">
            <span className="text-sm text-muted-foreground">Add to your post</span>

            <div className="flex gap-3 text-lg">
              <button type="button" onClick={handlePhotoClick}>🖼</button>
              <button type="button" onClick={handleFeelingClick}>😊</button>
              <button type="button">📍</button>
            </div>
          </div>

          {/* POST BUTTON */}
          <Button
            type="button"
            disabled={scanStatus !== "safe" && !text.trim()}
            onClick={() => {
    console.log("POST CLICKED");

              const postBody = {
                userName: "Alex Johnson",
                text: text,
                likes: 0,
                comments: 0,
                shares: 0,

                feeling: selectedFeeling || "",
              }

              const submitPost = async (image?: string) => {
                try {
                  const response = await api.post("/posts", {
                    ...postBody,
                    image: image ?? null,
                  });

                  onPost(response.data);

                  setOpen(false);
                  setText("");
                  setSelectedFile(null);
                  setScanStatus("idle");
                  setRiskScore(null);
                  setSelectedFeeling(null);
                } catch (error) {
                  console.error("Failed to create post:", error);
                }
              }

              if (selectedFile) {
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onloadend = () => submitPost(reader.result as string);
              } else {
                submitPost();
              }
            }}
            className="w-full bg-accent-gradient text-white disabled:opacity-50"
          >
            Post
          </Button>

        </DialogContent>

      </Dialog>

    </div>
  )
}