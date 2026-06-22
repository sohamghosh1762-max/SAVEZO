interface StoryMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function StoryMenu({
  onEdit,
  onDelete,
}: StoryMenuProps) {
  return (
    <div className="absolute right-2 top-2 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={onEdit}
        className="block px-4 py-2 hover:bg-muted w-full text-left"
      >
        ✏️ Edit Story
      </button>

      <button
        onClick={onDelete}
        className="block px-4 py-2 hover:bg-muted text-red-500 w-full text-left"
      >
        🗑 Delete Story
      </button>
    </div>
  );
}