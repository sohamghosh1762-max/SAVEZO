"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Story {
  id: string | number;
  image?: string;
  text?: string;
  background?: string;
  createdAt: string;
  audio?: string;
  audioLabel?: string;
}

interface StoryViewerProps {
  open: boolean;
  onClose: () => void;
  stories: Story[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  name: string;
  avatar?: string; // profile photo url, falls back to initial letter
  viewersCount?: number; // shown only if isOwner is true
  isOwner?: boolean;
  onSendMessage?: (text: string) => void;
  onReact?: (emoji: string) => void;
}

const DURATION = 5000; // ms per story
const REACTIONS = ["👍", "❤️", "🥰", "😂", "😮", "😢", "😡"];
const FALLBACK_GRADIENT = "from-indigo-500 via-purple-500 to-pink-500";

export function StoryViewer({
  open,
  onClose,
  stories,
  currentIndex,
  setCurrentIndex,
  name,
  avatar,
  viewersCount,
  isOwner = false,
  onSendMessage,
  onReact,
}: StoryViewerProps) {
  const currentStory = stories[currentIndex];

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [floatingReaction, setFloatingReaction] = useState<{ emoji: string; key: number } | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reactionKeyRef = useRef(0);

  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, setCurrentIndex, onClose]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, setCurrentIndex]);

  // Reset progress + loading state whenever the active story changes
  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    setShowMenu(false);

    if (currentStory?.image) {
      setImageLoaded(false);
    } else {
      setImageLoaded(true);
    }
  }, [currentIndex, currentStory?.id, currentStory?.image]);

  // Real-time, pausable progress (drives the top bars + auto-advance)
  useEffect(() => {
    if (!open || !imageLoaded || isPaused || isInputFocused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = elapsedRef.current + (now - startTimeRef.current);
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        nextStory();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      elapsedRef.current += performance.now() - startTimeRef.current;
    };
  }, [open, imageLoaded, isPaused, isInputFocused, nextStory]);

  // Background audio: play/pause in sync with the story's pause state
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (!open || isPaused || isInputFocused) {
      audioEl.pause();
    } else {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {
        // Autoplay can be blocked until the user interacts with the page; ignore.
      });
    }
  }, [open, isPaused, isInputFocused, currentIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (isInputFocused) return; // don't steal arrow keys while typing
      if (e.key === "ArrowLeft") prevStory();
      else if (e.key === "ArrowRight") nextStory();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, prevStory, nextStory, onClose, isInputFocused]);

  if (!open || !currentStory) return null;

  // --- Pointer handling: press-and-hold to pause, tap to navigate, swipe down to dismiss ---

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsPaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const deltaY = e.clientY - pointerStartRef.current.y;
    if (deltaY > 10) {
      setIsDragging(true);
      setDragY(deltaY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    setIsPaused(false);

    if (!start) return;
    const deltaY = e.clientY - start.y;
    const deltaTime = Date.now() - start.time;

    if (isDragging) {
      setIsDragging(false);
      if (deltaY > 120) {
        onClose();
      } else {
        setDragY(0);
      }
      return;
    }

    // Quick tap (not a drag) -> navigate based on which half was tapped
    if (deltaTime < 250) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      if (tapX < rect.width / 2) {
        prevStory();
      } else {
        nextStory();
      }
    }
  };

  // Prevent clicks on UI chrome (buttons, input, menu) from bubbling up to the
  // pause/tap/drag handlers on the story container.
  const stopBubble = (e: React.PointerEvent) => e.stopPropagation();

  const handleSendMessage = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setMessageText("");
  };

  const handleReact = (emoji: string) => {
    onReact?.(emoji);
    reactionKeyRef.current += 1;
    setFloatingReaction({ emoji, key: reactionKeyRef.current });
    window.setTimeout(() => setFloatingReaction((cur) => (cur?.key === reactionKeyRef.current ? null : cur)), 900);
  };

  const hasCaptionOverlay = Boolean(currentStory.image && currentStory.text);
  const isTextOnly = !currentStory.image;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop (fades out while dragging to dismiss; click outside the card to close) */}
      <div
        className="absolute inset-0 bg-black/95"
        style={{ opacity: 1 - Math.min(dragY / 400, 0.6) }}
        onClick={onClose}
      />

      {/* Story Container */}
      <div
        className="relative w-[400px] max-w-[95vw] h-[85vh] rounded-3xl overflow-hidden bg-black shadow-2xl select-none cursor-pointer touch-none"
        style={{
          transform: `translateY(${dragY}px) scale(${1 - Math.min(dragY / 1000, 0.05)})`,
          transition: isDragging ? "none" : "transform 0.25s ease",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background audio for the current story, if any */}
        {currentStory.audio && (
          <audio ref={audioRef} src={currentStory.audio} loop={false} muted={isMuted} />
        )}

        {/* Previous Story */}
        {currentIndex > 0 && (
          <button
            onClick={prevStory}
            onPointerDown={stopBubble}
            aria-label="Previous story"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md text-white text-4xl hover:bg-white/30 flex items-center justify-center"
          >
            ‹
          </button>
        )}

        {/* Next Story */}
        <button
          onClick={nextStory}
          onPointerDown={stopBubble}
          aria-label="Next story"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md text-white text-4xl hover:bg-white/30 flex items-center justify-center"
        >
          ›
        </button>

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
        )}

        {/* Background: photo, or gradient for text-only stories */}
        {currentStory.image ? (
          <img
            key={currentStory.id}
            src={currentStory.image}
            alt=""
            draggable={false}
            onLoad={() => setImageLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              currentStory.background || FALLBACK_GRADIENT
            } flex items-center justify-center p-8`}
          >
            <h1 className="text-white text-4xl md:text-5xl font-extrabold text-center leading-tight drop-shadow-lg max-w-[85%]">
              {currentStory.text}
            </h1>
          </div>
        )}

        {/* Caption overlaid on top of a photo story */}
        {hasCaptionOverlay && (
          <div className="absolute inset-x-0 bottom-28 px-8 z-30 flex justify-center">
            <p className="text-white text-xl font-semibold text-center leading-snug drop-shadow-lg bg-black/30 rounded-2xl px-4 py-2 backdrop-blur-sm max-w-[90%]">
              {currentStory.text}
            </p>
          </div>
        )}

        {/* Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

        {/* Progress bars */}
        <div className="absolute top-2 left-3 right-3 flex gap-1 z-[999]">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-[5px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: index < currentIndex ? "100%" : index === currentIndex ? `${progress}%` : "0%",
                  transition: index === currentIndex ? "none" : "width 0.1s linear",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          className="absolute top-10 left-4 right-4 flex items-center justify-between z-[100]"
          onPointerDown={stopBubble}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/70 flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white text-sm font-semibold leading-tight truncate">{name}</p>
                <p className="text-xs text-gray-300">{new Date(currentStory.createdAt).toLocaleString()}</p>
                {isOwner && typeof viewersCount === "number" && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.8 1.6-9.8 4.9v2.7h19.6v-2.7c0-3.3-6.5-4.9-9.8-4.9z" />
                    </svg>
                    {viewersCount}
                  </span>
                )}
              </div>
              {currentStory.audioLabel && (
                <p className="text-xs text-gray-200 leading-tight truncate max-w-[180px]">
                  ♪ {currentStory.audioLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 relative flex-shrink-0">
            {currentStory.audio && (
              <button
                onClick={() => setIsMuted((m) => !m)}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="text-white text-xl"
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            )}

            <button
              onClick={() => setShowMenu((v) => !v)}
              aria-label="More options"
              className="text-white text-xl"
            >
              ⋯
            </button>

            <button onClick={onClose} aria-label="Close" className="text-white text-2xl font-bold leading-none">
              ✕
            </button>

            {showMenu && (
              <div className="absolute top-8 right-0 w-44 bg-neutral-900 border border-white/10 rounded-xl shadow-xl overflow-hidden text-sm">
                <button
                  className="w-full text-left px-4 py-2.5 text-white hover:bg-white/10"
                  onClick={() => setShowMenu(false)}
                >
                  Mute notifications
                </button>
                <button
                  className="w-full text-left px-4 py-2.5 text-white hover:bg-white/10"
                  onClick={() => setShowMenu(false)}
                >
                  Copy link
                </button>
                <button
                  className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/10"
                  onClick={() => setShowMenu(false)}
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pause dim indicator */}
        {(isPaused || isInputFocused) && !isDragging && (
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        )}

        {/* Floating reaction pop */}
        {floatingReaction && (
          <div
            key={floatingReaction.key}
            className="absolute bottom-24 right-8 text-5xl pointer-events-none z-50 animate-[float-up_0.9s_ease-out_forwards]"
          >
            {floatingReaction.emoji}
          </div>
        )}

        {/* Send message + quick reactions */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 z-50" onPointerDown={stopBubble}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Send message..."
            className="flex-1 bg-black/40 border border-white/30 rounded-full px-5 py-3 text-white placeholder:text-white/70 outline-none backdrop-blur-md focus:border-white/60"
          />

          {messageText.trim() ? (
            <button
              onClick={handleSendMessage}
              aria-label="Send message"
              className="text-white text-2xl px-1"
            >
              ➤
            </button>
          ) : (
            REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-3xl transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(1.4);
          }
        }
      `}</style>
    </div>
  );
}