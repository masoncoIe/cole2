import { X, BookmarkIcon } from "lucide-react";
import type { Bookmark } from "@/hooks/useBookmarks";

interface BookmarkRowProps {
  bookmarks: Bookmark[];
  onOpen: (url: string) => void;
  onRemove: (id: string) => void;
}

export function BookmarkRow({ bookmarks, onOpen, onRemove }: BookmarkRowProps) {
  if (bookmarks.length === 0) return null;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-1.5 shrink-0 group bg-card border border-border rounded-full px-3 py-1.5 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer"
            onClick={() => onOpen(b.url)}
          >
            {b.favicon ? (
              <img
                src={b.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <BookmarkIcon className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs text-foreground/80 max-w-[100px] truncate font-medium">
              {b.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(b.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Remove bookmark"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
