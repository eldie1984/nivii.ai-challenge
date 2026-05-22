"use client";

import { useState } from "react";
import { Header } from "@/components/sql-assistant/header";
import { QueryInput } from "@/components/sql-assistant/query-input";
import { SqlOutput } from "@/components/sql-assistant/sql-output";
import { ResultsDisplay } from "@/components/sql-assistant/results-display";
import { ExamplePrompts } from "@/components/sql-assistant/example-prompts";
import { LoadingSkeleton } from "@/components/sql-assistant/loading-skeleton";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type ApiResponse = {
  query?: string;
  sql?: string;
  executed_query?: string;
  response?: string;
  result?: string;
  results?: string;
  text?: string;
  explanation?: string;
  [key: string]: unknown;
};

function pickString(
  data: ApiResponse,
  keys: string[],
  fallback = "",
): string {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (v !== undefined && v !== null && typeof v !== "string") {
      return JSON.stringify(v, null, 2);
    }
  }
  return fallback;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<{ data: ApiResponse | null; text: string }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const message =
      res.status === 500 || res.status === 504
        ? "In this moment we can't process the request, please retry or reformulate your question."
        : `Request failed (${res.status} ${res.statusText})${
            errText ? `: ${errText}` : ""
          }`;
    throw new HttpError(res.status, message);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await res.json()) as ApiResponse;
    return { data, text: "" };
  }
  const text = await res.text();
  return { data: null, text };
}

const RETRY_STATUSES = new Set([504]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function postJsonWithRetry(
  path: string,
  body: Record<string, unknown>,
  opts: {
    signal?: AbortSignal;
    maxRetries?: number;
    onRetry?: (attempt: number, error: HttpError) => void;
  } = {},
): Promise<{ data: ApiResponse | null; text: string }> {
  const { signal, maxRetries = MAX_RETRIES, onRetry } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await postJson(path, body, signal);
    } catch (err) {
      lastError = err;
      const isRetryable =
        err instanceof HttpError && RETRY_STATUSES.has(err.status);
      if (!isRetryable || attempt === maxRetries) throw err;

      onRetry?.(attempt + 1, err);
      // Exponential backoff: 1s, 2s, 4s
      await sleep(BASE_DELAY_MS * 2 ** attempt);
      if (signal?.aborted) throw err;
    }
  }

  throw lastError;
}

export default function SqlAssistantPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [response, setResponse] = useState<{
    sql: string;
    results: string;
  } | null>(null);
  // The prompt that produced the current response — frozen at submit time
  // so editing the input afterwards doesn't change what gets sent to /explain.
  const [submittedPrompt, setSubmittedPrompt] = useState<string>("");

  // Execute query state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Explain result state
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(
    null,
  );

  const resetDownstream = () => {
    setExecutionResult(null);
    setExecutionError(null);
    setExplanation(null);
    setExplanationError(null);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    const promptText = query.trim();
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSubmittedPrompt(promptText);
    setRetryAttempt(0);
    resetDownstream();

    try {
      const { data, text } = await postJsonWithRetry(
        "/query",
        { query: promptText },
        {
          onRetry: (attempt) => {
            setRetryAttempt(attempt);
            console.warn(
              `Gateway timeout on /query — retry ${attempt}/${MAX_RETRIES}`,
            );
          },
        },
      );
      if (data) {
        setResponse({
          sql: pickString(data, ["query", "sql", "executed_query"]),
          results: pickString(data, [
            "response",
            "result",
            "results",
            "text",
          ]),
        });
      } else {
        setResponse({ sql: "", results: text });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error";
      console.error("Error fetching SQL response:", err);
      setError(message);
    } finally {
      setIsLoading(false);
      setRetryAttempt(0);
    }
  };

  const handleExecute = async () => {
    if (!response?.sql) return;

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      const { data, text } = await postJson("/execute", {
        query: response.sql,
      });
      const result = data
        ? pickString(data, ["result", "results", "response", "text"], text)
        : text;
      setExecutionResult(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error";
      console.error("Error executing query:", err);
      setExecutionError(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExplain = async () => {
    if (!response) return;

    setIsExplaining(true);
    setExplanationError(null);
    setExplanation(null);

    try {
      const { data, text } = await postJsonWithRetry(
        "/explain",
        {
          query: response.sql,
          result: executionResult ?? response.results,
          prompt: submittedPrompt,
        },
        {
          onRetry: (attempt) => {
            console.warn(
              `Gateway timeout on /explain — retry ${attempt}/${MAX_RETRIES}`,
            );
          },
        },
      );
      const explained = data
        ? pickString(
            data,
            ["explanation", "response", "result", "text"],
            text,
          )
        : text;
      setExplanation(explained);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error";
      console.error("Error explaining result:", err);
      setExplanationError(message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleExampleSelect = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
            Transform Natural Language into SQL
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto text-pretty">
            Describe what data you need in plain English, and let AI generate
            optimized SQL queries for your database.
          </p>
        </div>

        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="mt-6 sm:mt-8">
            {retryAttempt > 0 && (
              <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-xs sm:text-sm text-amber-400">
                <span className="font-medium">Gateway timeout —</span>{" "}
                retrying ({retryAttempt}/{MAX_RETRIES})...
              </div>
            )}
            <LoadingSkeleton />
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-6 sm:mt-8 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <span className="font-medium">Request failed:</span> {error}
          </div>
        )}

        {response && !isLoading && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {response.sql && (
              <SqlOutput
                sql={response.sql}
                onExecute={handleExecute}
                onExplain={handleExplain}
                isExecuting={isExecuting}
                isExplaining={isExplaining}
                canExplain={Boolean(
                  executionResult ?? response.results,
                )}
              />
            )}

            {executionError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <span className="font-medium">Execution failed:</span>{" "}
                {executionError}
              </div>
            )}

            {executionResult !== null && (
              <ResultsDisplay
                title="Execution Result"
                results={executionResult}
              />
            )}

            {explanationError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <span className="font-medium">Explanation failed:</span>{" "}
                {explanationError}
              </div>
            )}

            {explanation !== null && (
              <ResultsDisplay title="Explanation" results={explanation} />
            )}
          </div>
        )}

        <ExamplePrompts onSelect={handleExampleSelect} disabled={isLoading} />
      </main>
    </div>
  );
}
