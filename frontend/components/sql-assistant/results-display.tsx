"use client";

import { FileText } from "lucide-react";

interface ResultsDisplayProps {
  results: string;
  title?: string;
}

export function ResultsDisplay({
  results,
  title = "Response",
}: ResultsDisplayProps) {
  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
        <FileText className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {results}
        </p>
      </div>
    </div>
  );
}
