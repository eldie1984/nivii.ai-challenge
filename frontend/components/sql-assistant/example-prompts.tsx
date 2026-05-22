"use client";

import { Lightbulb } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Find the top 10 customers by revenue",
  "Show monthly sales growth rate",
  "List products with low inventory",
  "Get average order value by region",
];

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ExamplePrompts({ onSelect, disabled }: ExamplePromptsProps) {
  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">
          Try an example
        </span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            disabled={disabled}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground bg-secondary/40 hover:bg-secondary/70 hover:text-foreground border border-border/40 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
