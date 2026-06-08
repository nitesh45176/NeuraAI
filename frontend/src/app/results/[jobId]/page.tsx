"use client";

import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SummaryData = {
  title: string;
  summary: string;
  action_items: string[];
  key_decisions: string[];
  open_questions: string[];
};

type RawSummaryData = {
  title?: unknown;
  summary?: unknown;
  action_items?: unknown;
  key_decisions?: unknown;
  open_questions?: unknown;
};

type InsightSectionProps = {
  accent: string;
  emptyText: string;
  items: string[];
  title: string;
};

function InsightSection({ accent, emptyText, items, title }: InsightSectionProps) {
  return (
    <section className="rounded-lg border border-[#ddd2c2] bg-[#fffaf0] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`size-3 rounded-sm ${accent}`} />
          <h2 className="text-lg font-semibold tracking-tight text-[#17211f]">
            {title}
          </h2>
        </div>
        <span className="rounded-md border border-[#e2d7c7] bg-white px-2.5 py-1 text-xs font-semibold text-[#66736b]">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="rounded-md border border-[#e7ddcf] bg-white px-4 py-3 text-sm leading-6 text-[#46524c]"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-[#d9ccbb] bg-white/60 px-4 py-3 text-sm text-[#76817b]">
          {emptyText}
        </p>
      )}
    </section>
  );
}

function formatItem(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const parts = [
      record.task,
      record.action,
      record.item,
      record.owner ? `Owner: ${record.owner}` : null,
      record.deadline ? `Deadline: ${record.deadline}` : null,
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(" | ");
  }

  return JSON.stringify(value);
}

function toList(value: unknown): string[] {
  const emptyPatterns = [
    "no action items found",
    "no key decisions found",
    "no open questions found",
  ];

  const isPlaceholder = (item: string) =>
    emptyPatterns.some((pattern) => item.toLowerCase().includes(pattern));

  if (Array.isArray(value)) {
    return value.map(formatItem).filter((item) => item && !isPlaceholder(item));
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|•|- /)
      .map((item) => item.trim())
      .filter((item) => item && !isPlaceholder(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .map(formatItem)
      .filter((item) => item && !isPlaceholder(item));
  }

  return [];
}

function normalizeSummary(raw: RawSummaryData): SummaryData {
  return {
    title: typeof raw.title === "string" ? raw.title : "Meeting Summary",
    summary: typeof raw.summary === "string" ? raw.summary : "",
    action_items: toList(raw.action_items),
    key_decisions: toList(raw.key_decisions),
    open_questions: toList(raw.open_questions),
  };
}

export default function ResultsPage() {
  const [status, setStatus] = useState("pending");
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);

  useEffect(() => {
    let isMounted = true;

    const timer = setInterval(async () => {
      try {
        const response = await api.get(`/transcribe/${jobId}`);

        if (!isMounted) return;
        setStatus(response.data.status);

        if (response.data.status === "completed") {
          clearInterval(timer);
          const summaryResponse = await api.get(`/summary/${jobId}`);

          if (!isMounted) return;
          setData(normalizeSummary(summaryResponse.data));
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        clearInterval(timer);
        setError("We could not fetch this meeting yet. Please refresh and try again.");
        setLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [jobId]);

  const metrics = useMemo(
    () => [
      ["Actions", data?.action_items.length ?? 0],
      ["Decisions", data?.key_decisions.length ?? 0],
      ["Questions", data?.open_questions.length ?? 0],
    ],
    [data]
  );

  if (loading || !data) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-8 text-[#17211f]">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
          <section className="w-full rounded-lg border border-[#ddd2c2] bg-[#fffaf0] p-8 text-center shadow-[0_24px_70px_rgba(23,33,31,0.12)]">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-lg bg-[#17211f] text-lg font-semibold text-[#f7f3ea]">
              N
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
              {error ? "Attention needed" : "Processing meeting"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {error || "Building your meeting brief"}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#617069]">
              {error
                ? "The page is ready, but the backend did not return the meeting summary."
                : "NeuraAI is transcribing, extracting decisions, and preparing your searchable meeting workspace."}
            </p>

            {!error && (
              <div className="mx-auto mt-8 max-w-xl rounded-lg border border-[#e3d8c8] bg-white p-2">
                <div className="h-3 overflow-hidden rounded-sm bg-[#e8dfd2]">
                  <div className="h-full w-2/3 animate-pulse rounded-sm bg-[#0f766e]" />
                </div>
              </div>
            )}

            <div className="mt-6 inline-flex rounded-md border border-[#d9ccbb] bg-white px-4 py-2 text-sm font-semibold text-[#5b665f]">
              Status: {status}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#17211f]">
      <header className="border-b border-[#dfd4c3] bg-[#fffaf0]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#17211f] text-sm font-semibold text-[#f7f3ea]">
              N
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">NeuraAI</p>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#66736b]">
                Meeting report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-md border border-[#d8d0c1] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#34403a] shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#17211f]/10"
            >
              New meeting
            </button>

            <button
              onClick={() => router.push(`/chat/${jobId}`)}
              className="rounded-md bg-[#17211f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263530] focus:outline-none focus:ring-4 focus:ring-[#17211f]/20"
            >
              Chat with meeting
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.82fr_0.38fr] lg:px-8">
        <section className="rounded-lg border border-[#ddd2c2] bg-[#fffaf0] p-6 shadow-sm lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
            Completed analysis
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {data.title || "Meeting Summary"}
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#56645d]">
            {data.summary}
          </p>
        </section>

        <aside className="rounded-lg border border-[#ddd2c2] bg-[#17211f] p-6 text-[#f7f3ea] shadow-sm">
          <p className="text-sm font-semibold text-[#b7c7be]">Meeting signals</p>
          <div className="mt-5 grid gap-3">
            {metrics.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-md bg-white/8 px-4 py-3"
              >
                <span className="text-sm font-medium text-[#dbe6df]">{label}</span>
                <span className="text-2xl font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push(`/chat/${jobId}`)}
            className="mt-5 w-full rounded-md bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/30"
          >
            Ask follow-up questions
          </button>
        </aside>

        <div className="grid gap-6 lg:col-span-2 lg:grid-cols-3">
          <InsightSection
            accent="bg-[#f97316]"
            emptyText="No action items were detected."
            items={data.action_items}
            title="Action Items"
          />
          <InsightSection
            accent="bg-[#0f766e]"
            emptyText="No key decisions were detected."
            items={data.key_decisions}
            title="Key Decisions"
          />
          <InsightSection
            accent="bg-[#64748b]"
            emptyText="No open questions were detected."
            items={data.open_questions}
            title="Open Questions"
          />
        </div>
      </div>
    </main>
  );
}
