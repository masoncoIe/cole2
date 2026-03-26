import { useState } from "react";
import { useLocation, useSearch as useWouterSearch, Link } from "wouter";
import { useSearch } from "@workspace/api-client-react";
import type { SearchResults } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX, AlertCircle } from "lucide-react";

import { SearchBar } from "@/components/search/SearchBar";
import { AbstractCard } from "@/components/search/AbstractCard";
import { ResultItem } from "@/components/search/ResultItem";
import { RelatedTopicCard } from "@/components/search/RelatedTopicCard";
import { Logo } from "@/components/ui/logo";
import { BrowserView } from "@/components/browser/BrowserView";
import { BookmarkRow } from "@/components/BookmarkRow";
import { useBookmarks } from "@/hooks/useBookmarks";

function isUrl(query: string): boolean {
  try {
    const raw = query.trim();
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    const url = new URL(withProto);
    // Must have a dot in hostname to be a real URL (avoids treating "localhost" as URL in most cases)
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

function normalizeUrl(query: string): string {
  const raw = query.trim();
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function LoadingState() {
  return (
    <div className="space-y-10 animate-pulse mt-6">
      <div className="bg-zinc-100 rounded-3xl h-44 w-full max-w-[800px]" />
      <div className="space-y-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2.5 max-w-[680px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-200 shrink-0" />
              <div className="h-4 w-56 bg-zinc-200 rounded-md" />
            </div>
            <div className="h-7 w-4/5 bg-blue-100/60 rounded-md my-1" />
            <div className="h-4 w-full bg-zinc-100 rounded-md" />
            <div className="h-4 w-11/12 bg-zinc-100 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="p-10 text-center bg-red-50 rounded-3xl border border-red-100 max-w-2xl mx-auto my-16 shadow-sm">
      <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-5" strokeWidth={2} />
      <h3 className="text-2xl font-bold text-red-950 font-display">Search Interrupted</h3>
      <p className="text-red-800 mt-3 text-[16px] leading-relaxed max-w-md mx-auto">
        We couldn't connect to the search proxy. Please ensure the backend is running and try your search again.
      </p>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-24 text-center max-w-2xl mx-auto">
      <div className="w-24 h-24 bg-zinc-100/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-zinc-200/50">
        <SearchX className="w-10 h-10 text-zinc-400" strokeWidth={2} />
      </div>
      <h3 className="text-[26px] font-bold text-foreground font-display mb-3">
        No results for <span className="text-primary break-all">"{query}"</span>
      </h3>
      <p className="text-muted-foreground text-[17px] leading-relaxed max-w-lg mx-auto">
        We couldn't find any exact matches. Try checking for typos, using broader keywords, or adjusting your search terms.
      </p>
    </div>
  );
}

function SearchResultsView({
  data,
  query,
  onOpenUrl,
}: {
  data: SearchResults;
  query: string;
  onOpenUrl: (url: string) => void;
}) {
  if (!data.results?.length && !data.abstract && !data.relatedTopics?.length) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="flex flex-col gap-12 mt-2">
      {data.abstract && (
        <AbstractCard
          abstract={data.abstract}
          source={data.abstractSource}
          url={data.abstractUrl}
          onOpenUrl={onOpenUrl}
        />
      )}

      {data.results && data.results.length > 0 && (
        <div className="flex flex-col gap-10">
          {data.results.map((result, idx) => (
            <ResultItem key={`${result.url}-${idx}`} result={result} idx={idx} onOpenUrl={onOpenUrl} />
          ))}
        </div>
      )}

      {data.relatedTopics && data.relatedTopics.length > 0 && (
        <div className="pt-10 mt-4 border-t border-border">
          <h3 className="font-display text-[22px] font-bold text-foreground mb-8">Related Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {data.relatedTopics.map((topic, idx) => (
              <RelatedTopicCard key={idx} topic={topic} onOpenUrl={onOpenUrl} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const searchString = useWouterSearch();
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const searchParams = new URLSearchParams(searchString);
  const q = searchParams.get("q") || "";

  const { data, isLoading, error } = useSearch(
    { q },
    {
      query: {
        enabled: q.trim().length > 0,
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    }
  );

  const handleSearch = (query: string) => {
    if (query.trim()) {
      if (isUrl(query)) {
        setBrowserUrl(normalizeUrl(query));
        return;
      }
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleOpenUrl = (url: string) => setBrowserUrl(url);

  const handleUnbookmarkByUrl = (url: string) => {
    const bm = bookmarks.find((b) => b.url === url);
    if (bm) removeBookmark(bm.id);
  };

  const isSearching = q.length > 0;

  return (
    <>
      {browserUrl && (
        <BrowserView
          url={browserUrl}
          onClose={() => setBrowserUrl(null)}
          isBookmarked={isBookmarked(browserUrl)}
          onBookmark={addBookmark}
          onUnbookmark={handleUnbookmarkByUrl}
        />
      )}

      <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="home-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6"
            >
              {/* Center content */}
              <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
                <Logo />
                <SearchBar initialQuery={q} onSearch={handleSearch} autoFocus />
                <BookmarkRow
                  bookmarks={bookmarks}
                  onOpen={handleOpenUrl}
                  onRemove={removeBookmark}
                />
              </div>

              {/* Hint pinned to bottom */}
              <p className="fixed bottom-6 text-center text-muted-foreground/60 text-[13px]">
                Search the web or type a URL to open it here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="home-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col min-h-screen"
            >
              <header className="sticky top-0 z-30 w-full bg-background/85 backdrop-blur-2xl border-b border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-5 px-4 sm:px-6 lg:px-8 transition-all">
                <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                  <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity block shrink-0">
                    <Logo small />
                  </Link>
                  <div className="flex-1 w-full sm:max-w-[700px]">
                    <SearchBar initialQuery={q} onSearch={handleSearch} />
                  </div>
                </div>
              </header>

              <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {isLoading && (
                  <div className="mb-8 text-[15px] text-muted-foreground animate-pulse">
                    Searching for <span className="font-medium text-foreground">"{q}"</span>...
                  </div>
                )}
                {isLoading && <LoadingState />}
                {!isLoading && error && <ErrorState />}
                {!isLoading && data && (
                  <SearchResultsView data={data} query={q} onOpenUrl={handleOpenUrl} />
                )}
              </main>

              <footer className="py-6 text-center text-xs text-muted-foreground/50 border-t border-border mt-10">
                Click any result to open it here. No new tabs.
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
