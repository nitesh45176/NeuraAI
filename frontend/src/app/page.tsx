"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const capabilities = [
  "Transcript",
  "Summary",
  "Action items",
  "Decisions",
  "Meeting chat",
];

const steps = ["Transcribe", "Extract", "Search", "Export"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) {
      setError("Paste a meeting link to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await api.post("/transcribe", {
        source: url,
        language: "english",
      });

      const jobId = response.data.job_id;
      router.push(`/results/${jobId}`);
    } catch (error) {
      console.error(error);
      setError("Could not start analysis. Check the link and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ea] text-[#17211f]">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#17211f] text-sm font-semibold text-[#f7f3ea] shadow-sm">
            N
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">NeuraAI</p>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#66736b]">
              Meeting Intelligence
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-[#d8d0c1] bg-white/55 px-3 py-2 text-sm font-medium text-[#52615a] shadow-sm backdrop-blur md:flex">
          <span className="rounded-md bg-[#0f766e] px-3 py-1 text-xs text-white">
            English
          </span>
          <span>Hindi</span>
          <span>Hinglish</span>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 pb-12 pt-2 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-16 lg:pt-6">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#dccfba] bg-[#fffaf0]/75 px-4 py-2 text-sm font-medium text-[#5f594f] shadow-sm backdrop-blur">
            <span className="size-2 rounded-sm bg-[#f97316]" />
            AI workspace for recorded meetings
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-[#14201d] sm:text-6xl">
            Turn every meeting into clear next steps.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5b665f]">
            Upload or paste a meeting link and NeuraAI prepares the transcript,
            summary, decisions, questions, and action items in one focused
            workspace.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 max-w-2xl rounded-lg border border-[#dfd3c1] bg-[#fffaf0] p-3 shadow-[0_24px_70px_rgba(23,33,31,0.14)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="meeting-url">
                Meeting link
              </label>
              <input
                id="meeting-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste YouTube, Drive, Zoom, or meeting video link"
                className="min-h-14 flex-1 rounded-md border border-transparent bg-white px-5 text-base font-medium text-[#17211f] outline-none transition placeholder:text-[#8b948e] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-14 rounded-md bg-[#17211f] px-7 text-base font-semibold text-white shadow-sm transition hover:bg-[#263530] focus:outline-none focus:ring-4 focus:ring-[#17211f]/20 disabled:cursor-not-allowed disabled:bg-[#7d8782]"
              >
                {isSubmitting ? "Starting..." : "Analyze"}
              </button>
            </div>

            {error ? (
              <p className="px-2 pt-3 text-sm font-medium text-[#b42318]">
                {error}
              </p>
            ) : (
              <p className="px-2 pt-3 text-sm font-medium text-[#6a756f]">
                Audio, video, and YouTube links are supported.
              </p>
            )}
          </form>

          <div className="mt-4 max-w-2xl rounded-lg border border-[#f5c38b] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#7c3e10] shadow-sm">
            <span className="font-semibold text-[#9a3412]">Demo note:</span>{" "}
            This hosted frontend shows the NeuraAI experience. Live meeting
            processing requires the local FastAPI backend to be running.
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <span
                key={capability}
                className="rounded-md border border-[#d9ccbb] bg-white/45 px-4 py-2 text-sm font-medium text-[#4e5b54]"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-lg border border-[#d9ccbb] bg-[#17211f] p-4 shadow-[0_30px_90px_rgba(23,33,31,0.3)]">
            <div className="rounded-lg bg-[#fdf8ee] p-5">
              <div className="flex items-center justify-between border-b border-[#e4dacb] pb-4">
                <div>
                  <p className="text-sm font-semibold text-[#66736b]">
                    Today&apos;s analysis
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Product sync recording
                  </h2>
                </div>
                <div className="rounded-md bg-[#f97316] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  Live
                </div>
              </div>

              <div className="grid gap-3 py-5 sm:grid-cols-2">
                {[
                  ["42 min", "Meeting length"],
                  ["7", "Action items"],
                  ["4", "Decisions"],
                  ["3", "Open questions"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[#e5dacb] bg-white p-4"
                  >
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="mt-1 text-sm font-medium text-[#69746e]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#e5dacb] bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#66736b]">
                    AI pipeline
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">
                    Ready
                  </p>
                </div>

                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-[#0f766e] text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-[#e8dfd2]">
                        <div
                          className="h-full rounded-sm bg-[#0f766e]"
                          style={{ width: `${95 - index * 14}%` }}
                        />
                      </div>
                      <p className="w-20 text-sm font-semibold text-[#4f5c55]">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-[#17211f] p-4 text-[#f7f3ea]">
                <p className="text-sm font-semibold text-[#b7c7be]">
                  Ask NeuraAI
                </p>
                <p className="mt-2 text-lg font-semibold leading-7">
                  Who owns the launch checklist and when is it due?
                </p>
                <p className="mt-3 text-sm leading-6 text-[#dbe6df]">
                  Priya owns the checklist. The deadline discussed in the
                  meeting is Friday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
