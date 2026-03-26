import { Link } from "wouter";
import { SearchX, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-12">
        <Logo />
      </div>
      
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-zinc-400" />
        </div>
        <h1 className="text-4xl font-bold font-display text-foreground mb-4">404</h1>
        <h2 className="text-xl font-medium text-zinc-700 mb-6">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow shadow-primary/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>
    </div>
  );
}
