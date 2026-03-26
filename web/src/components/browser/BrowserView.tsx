import { useRef, useState, useEffect } from "react";
import { X, ArrowLeft, RefreshCw, Globe, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";

interface BrowserViewProps {
  url: string;
  onClose: () => void;
  isBookmarked?: boolean;
  onBookmark?: (url: string, title: string) => void;
  onUnbookmark?: (url: string) => void;
}

export function BrowserView({ url, onClose, isBookmarked, onBookmark, onUnbookmark }: BrowserViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [displayUrl, setDisplayUrl] = useState(url);
  const [pageTitle, setPageTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const proxyUrl = `/api/browse?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    setDisplayUrl(url);
    setIsLoading(true);
    setError(false);
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    try {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (iframeWindow) {
        const loc = iframeWindow.location.href;
        if (loc && loc !== "about:blank") {
          const urlObj = new URL(loc);
          const originalUrl = urlObj.searchParams.get("url");
          if (originalUrl) {
            setDisplayUrl(decodeURIComponent(originalUrl));
          } else {
            setDisplayUrl(loc);
          }
        }
        // Try to read title
        try {
          const title = iframeRef.current?.contentDocument?.title || "";
          if (title) setPageTitle(title);
        } catch {
          // cross-origin
        }
      }
    } catch {
      // cross-origin
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleBack = () => {
    try {
      iframeRef.current?.contentWindow?.history.back();
    } catch { /* ignore */ }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      onUnbookmark?.(displayUrl);
    } else {
      let title = pageTitle;
      if (!title) {
        try { title = new URL(displayUrl).hostname; } catch { title = displayUrl; }
      }
      onBookmark?.(displayUrl, title);
    }
  };

  let displayDomain = displayUrl;
  try {
    displayDomain = new URL(displayUrl.startsWith("http") ? displayUrl : `https://${displayUrl}`).hostname;
  } catch { /* keep as-is */ }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card shrink-0 shadow-sm">
        <button
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleRefresh}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-sm min-w-0">
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground truncate flex-1 font-mono text-xs">{displayUrl}</span>
        </div>

        {/* Bookmark toggle */}
        <button
          onClick={handleBookmarkToggle}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            isBookmarked
              ? "text-primary hover:text-primary/70"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Open in new tab */}
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Close browser"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Loading bar */}
      {isLoading && (
        <div className="h-0.5 bg-border shrink-0 overflow-hidden">
          <div className="h-full bg-primary w-3/5 animate-pulse" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
          <Globe className="w-12 h-12 opacity-30" />
          <p className="text-lg font-medium">Failed to load page</p>
          <p className="text-sm opacity-60">The site may be blocking proxy access.</p>
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline hover:opacity-80"
          >
            Open directly in a new tab instead
          </a>
        </div>
      )}

      {/* iframe */}
      {!error && (
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          className="flex-1 w-full border-none bg-white"
          onLoad={handleLoad}
          onError={handleError}
          title={displayDomain}
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      )}
    </div>
  );
}
