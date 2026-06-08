"use client";

import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Message = {
  question: string;
  answer: string;
};

const suggestions = [
  "What are the top action items?",
  "Which decisions were finalized?",
  "What questions are still open?",
];

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);

  async function sendQuestion(event?: FormEvent<HTMLFormElement>, prompt?: string) {
    event?.preventDefault();

    const query = (prompt ?? question).trim();
    if (!query || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/chat/${jobId}`, {
        query,
      });

      setMessages((prev) => [
        ...prev,
        {
          question: query,
          answer: response.data.answer,
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error(error);
      setError("NeuraAI could not answer that yet. Please try again.");
    } finally {
      setLoading(false);
    }
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
                Meeting chat
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/results/${jobId}`)}
            className="rounded-md border border-[#d8d0c1] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#34403a] shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#17211f]/10"
          >
            Back to report
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.34fr_0.66fr] lg:px-8">
        <aside className="rounded-lg border border-[#ddd2c2] bg-[#fffaf0] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
            Ask the meeting
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
            Find answers without replaying the recording.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#617069]">
            NeuraAI searches the meeting transcript and returns grounded answers
            from the discussion.
          </p>

          <div className="mt-7 space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendQuestion(undefined, suggestion)}
                disabled={loading}
                className="w-full rounded-md border border-[#e1d6c7] bg-white px-4 py-3 text-left text-sm font-medium text-[#46524c] transition hover:border-[#0f766e] hover:text-[#17211f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[680px] flex-col rounded-lg border border-[#ddd2c2] bg-[#fffaf0] shadow-sm">
          <div className="border-b border-[#e3d8c8] px-5 py-4">
            <p className="text-sm font-semibold text-[#66736b]">
              Meeting knowledge base
            </p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[420px] items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-lg bg-[#17211f] text-lg font-semibold text-[#f7f3ea]">
                    AI
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Start with a specific question.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#65726b]">
                    Ask about owners, deadlines, decisions, risks, follow-ups,
                    or anything mentioned in the meeting.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={`${msg.question}-${index}`} className="space-y-3">
                  <div className="ml-auto max-w-2xl rounded-lg bg-[#17211f] px-4 py-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7c7be]">
                      You
                    </p>
                    <p className="mt-1 text-sm leading-6">{msg.question}</p>
                  </div>

                  <div className="max-w-3xl rounded-lg border border-[#e1d6c7] bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                      NeuraAI
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#46524c]">
                      {msg.answer}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(event) => sendQuestion(event)}
            className="border-t border-[#e3d8c8] p-4"
          >
            {error && (
              <p className="mb-3 rounded-md border border-[#f4c7c3] bg-[#fff1f0] px-3 py-2 text-sm font-medium text-[#b42318]">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="meeting-question">
                Ask a question
              </label>
              <input
                id="meeting-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about this meeting..."
                className="min-h-14 flex-1 rounded-md border border-[#e1d6c7] bg-white px-4 text-base font-medium text-[#17211f] outline-none transition placeholder:text-[#8b948e] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="min-h-14 rounded-md bg-[#17211f] px-6 text-base font-semibold text-white shadow-sm transition hover:bg-[#263530] focus:outline-none focus:ring-4 focus:ring-[#17211f]/20 disabled:cursor-not-allowed disabled:bg-[#7d8782]"
              >
                {loading ? "Thinking..." : "Send"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
