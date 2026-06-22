"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  onPhotoStory: () => void;
  onTextStory: () => void;
}

export function CreateStoryModal({
  open,
  onClose,
  onPhotoStory,
  onTextStory,
}: Props) {
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center transition-opacity duration-150 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-card rounded-3xl p-8 w-[700px] max-w-[95vw]">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Create Story
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Photo Story */}
          <div
            onClick={onPhotoStory}
            className="
              h-[350px]
              rounded-3xl
              cursor-pointer
              flex
              flex-col
              items-center
              justify-center
              text-white
              bg-gradient-to-br
              from-purple-600
              to-cyan-400
              hover:scale-105
              transition
            "
          >
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl mb-4">
              📷
            </div>

            <h3 className="text-2xl font-bold text-center">
              Create a Photo
              <br />
              or Video Story
            </h3>
          </div>

          {/* Text Story */}
          <div
            onClick={onTextStory}
            className="
              h-[350px]
              rounded-3xl
              cursor-pointer
              flex
              flex-col
              items-center
              justify-center
              text-white
              bg-gradient-to-br
              from-pink-500
              to-purple-600
              hover:scale-105
              transition
            "
          >
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl mb-4">
              Aa
            </div>

            <h3 className="text-2xl font-bold text-center">
              Create a
              <br />
              Text Story
            </h3>
          </div>

        </div>

      </div>
    </div>
  );
}