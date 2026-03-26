import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon: string;
  addedAt: number;
}

const STORAGE_KEY = "cole_bookmarks";

function getFavicon(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return "";
  }
}

function load(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  useEffect(() => {
    save(bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((url: string, title?: string) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.url === url)) return prev;
      const newBookmark: Bookmark = {
        id: `${Date.now()}-${Math.random()}`,
        title: title || url,
        url,
        favicon: getFavicon(url),
        addedAt: Date.now(),
      };
      return [newBookmark, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (url: string) => bookmarks.some((b) => b.url === url),
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
