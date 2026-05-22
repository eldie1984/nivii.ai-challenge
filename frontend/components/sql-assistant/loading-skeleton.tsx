"use client";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
          <div className="h-4 w-4 rounded bg-secondary" />
          <div className="h-4 w-24 rounded bg-secondary" />
        </div>
        <div className="p-4 space-y-2">
          <div className="h-4 w-full rounded bg-secondary/50" />
          <div className="h-4 w-4/5 rounded bg-secondary/50" />
          <div className="h-4 w-3/5 rounded bg-secondary/50" />
        </div>
      </div>
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
          <div className="h-4 w-4 rounded bg-secondary" />
          <div className="h-4 w-16 rounded bg-secondary" />
        </div>
        <div className="p-6 space-y-3">
          <div className="h-4 w-full rounded bg-secondary/50" />
          <div className="h-4 w-5/6 rounded bg-secondary/50" />
          <div className="h-4 w-4/6 rounded bg-secondary/50" />
        </div>
      </div>
    </div>
  );
}
