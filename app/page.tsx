"use client";

import { useCallback, useState } from "react";
import CropForm from "@/components/CropForm";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import RecommendationResults from "@/components/RecommendationResults";
import { EMPTY_FORM } from "@/lib/types";
import type { FormState, RequestStatus, ApiErrorBody } from "@/lib/types";
import type { RecommendationResponse } from "@/lib/schema";

export default function Home() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastSubmitted, setLastSubmitted] = useState<FormState | null>(null);

  const submit = useCallback(async (value: FormState) => {
    setStatus("loading");
    setErrorMessage("");
    setLastSubmitted(value);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });

      const body = await res.json();

      if (!res.ok) {
        const err = body as ApiErrorBody;
        setErrorMessage(
          err.message || "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }

      setResult(body.data as RecommendationResponse);
      setStatus("success");
    } catch {
      setErrorMessage(
        "Couldn't reach the server. Check your connection and try again."
      );
      setStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    if (lastSubmitted) submit(lastSubmitted);
  }, [lastSubmitted, submit]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-leaf-600">
          Field-ready recommendations
        </p>
        <h1 className="font-display text-3xl text-soil-900 sm:text-4xl">
          Crop Recommendation Assistant
        </h1>
        <p className="max-w-xl text-soil-600">
          Tell us where you&apos;re growing, the season, your soil, and how
          much water you have. The assistant turns that into a short list of
          suitable crops with reasons and precautions — not a chatbot, a
          decision aid.
        </p>
      </header>

      <div className="grid gap-10 sm:grid-cols-2">
        <CropForm
          value={form}
          onChange={setForm}
          onSubmit={submit}
          disabled={status === "loading"}
        />

        <div>
          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}
          {status === "error" && (
            <ErrorState message={errorMessage} onRetry={retry} />
          )}
          {status === "success" && result && (
            <RecommendationResults data={result} />
          )}
        </div>
      </div>
    </main>
  );
}
