import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ initialQuery = "", onSearch, className, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center w-full bg-card rounded-full border-2 border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-primary/30 focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-300",
        className
      )}
    >
      <div className="pl-6 pr-3 text-muted-foreground flex items-center justify-center pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the web securely..."
        autoFocus={autoFocus}
        className="flex-1 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[17px] font-medium w-full"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="pr-6 pl-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center h-full group"
          aria-label="Clear search"
        >
          <div className="p-1 rounded-full group-hover:bg-zinc-100 transition-colors">
            <X className="w-5 h-5" />
          </div>
        </button>
      )}
      <button type="submit" className="sr-only">Search</button>
    </form>
  );
}
