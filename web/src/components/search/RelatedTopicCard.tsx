import { Search } from "lucide-react";
import type { SearchResult } from "@workspace/api-client-react";

interface RelatedTopicCardProps {
  topic: SearchResult;
  onOpenUrl: (url: string) => void;
}

export function RelatedTopicCard({ topic, onOpenUrl }: RelatedTopicCardProps) {
  return (
    <button
      onClick={() => onOpenUrl(topic.url)}
      className="block p-5 rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-blue-50/30 hover:border-blue-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 group text-left w-full"
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
          <Search className="w-4 h-4 text-zinc-500 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-blue-700 mb-1.5 line-clamp-1 group-hover:underline decoration-blue-700/40 underline-offset-2 text-[16px]">
            {topic.title}
          </h4>
          <p
            className="text-[14px] text-zinc-600 line-clamp-2 leading-relaxed [&>b]:font-semibold"
            dangerouslySetInnerHTML={{ __html: topic.snippet }}
          />
        </div>
      </div>
    </button>
  );
}
