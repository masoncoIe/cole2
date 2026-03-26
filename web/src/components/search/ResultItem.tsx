import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import type { SearchResult } from "@workspace/api-client-react";

interface ResultItemProps {
  result: SearchResult;
  idx: number;
  onOpenUrl: (url: string) => void;
}

export function ResultItem({ result, idx, onOpenUrl }: ResultItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: Math.min(idx * 0.05, 0.4) }}
      className="flex flex-col gap-1.5 max-w-[680px] group"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 shadow-sm group-hover:border-zinc-300 transition-colors">
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <button
          onClick={() => onOpenUrl(result.url)}
          className="text-[14px] text-zinc-600 truncate hover:text-zinc-900 transition-colors flex-1 text-left"
        >
          {result.url}
        </button>
      </div>

      <button
        onClick={() => onOpenUrl(result.url)}
        className="text-[20px] sm:text-[22px] font-medium text-[#1a0dab] group-hover:underline decoration-[#1a0dab]/40 underline-offset-[3px] leading-[1.3] mt-0.5 text-left"
      >
        {result.title}
      </button>

      <p
        className="text-[15px] leading-[1.6] text-zinc-700 mt-1 [&>b]:font-bold [&>b]:text-zinc-900"
        dangerouslySetInnerHTML={{ __html: result.snippet }}
      />
    </motion.div>
  );
}
