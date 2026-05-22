"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Play, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SqlOutputProps {
  sql: string;
  onExecute?: () => void;
  onExplain?: () => void;
  isExecuting?: boolean;
  isExplaining?: boolean;
  canExplain?: boolean;
}

export function SqlOutput({
  sql,
  onExecute,
  onExplain,
  isExecuting = false,
  isExplaining = false,
  canExplain = true,
}: SqlOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const busy = isExecuting || isExplaining;

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Executed Query
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap break-words">
          <code>{sql}</code>
        </pre>
      </div>
      {(onExecute || onExplain) && (
        <div className="flex flex-col sm:flex-row gap-2 px-4 py-3 border-t border-border/50 bg-secondary/20">
          {onExecute && (
            <Button
              onClick={onExecute}
              disabled={busy || !sql}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Execute Query
                  </>
                )}
              </span>
            </Button>
          )}
          {onExplain && (
            <Button
              onClick={onExplain}
              disabled={busy || !canExplain}
              variant="outline"
              className="flex-1 sm:flex-none border-border/60 bg-secondary/40 hover:bg-secondary/70 text-foreground font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isExplaining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 text-accent" />
                    Explain Result
                  </>
                )}
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
