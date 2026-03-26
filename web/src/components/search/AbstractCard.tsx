import { Sparkles, Info, ArrowRight } from "lucide-react";

interface AbstractCardProps {
  abstract: string;
  source?: string;
  url?: string;
  onOpenUrl?: (url: string) => void;
}

export function AbstractCard({ abstract, source, url, onOpenUrl }: AbstractCardProps) {
  if (!abstract) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-opacity duration-500 group-hover:opacity-10">
        <Sparkles className="w-32 h-32 text-blue-600" />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Info className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <span className="font-semibold font-display tracking-wide uppercase text-sm">Featured Snippet</span>
        </div>

        <p className="text-zinc-800 text-[16px] sm:text-[17px] leading-[1.7] max-w-3xl">{abstract}</p>

        {(source || url) && (
          <div className="mt-4 pt-5 border-t border-blue-200/50">
            {url && onOpenUrl ? (
              <button
                onClick={() => onOpenUrl(url)}
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-blue-700 hover:text-blue-900 transition-colors group/link"
              >
                Read more on {source || "source"}
                <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <span className="text-[15px] font-medium text-blue-800">Source: {source}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
