"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function QueryInput({
  query,
  setQuery,
  onSubmit,
  isLoading,
}: QueryInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative bg-card border border-border/60 rounded-xl p-4 sm:p-6">
        <label
          htmlFor="query-input"
          className="block text-sm font-medium text-foreground mb-3"
        >
          Enter your query in natural language
        </label>
        <textarea
          id="query-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Show me the top 5 customers by total spend in 2025"
          className="w-full h-32 sm:h-40 bg-input/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all duration-200"
          disabled={isLoading}
        />
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-secondary/50 border border-border/50 rounded">
              ⌘
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-secondary/50 border border-border/50 rounded">
              Enter
            </kbd>{" "}
            to run
          </p>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !query.trim()}
            className="relative w-full sm:w-auto overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-shimmer transition-opacity" />
            <span className="relative flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate SQL
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
