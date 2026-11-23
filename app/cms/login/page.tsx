"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isCmsBackendConfigured } from "@/lib/cms-api";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedNext = params.get("next") || "/cms";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/cms";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isCmsBackendConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!configured) {
      setError("Cloudflare CMS is not configured. Check the Vercel environment variables.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/cms/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(result.error || "Sign-in failed.");
        setBusy(false);
        return;
      }
    } catch {
      setError("Could not reach the CMS backend.");
      setBusy(false);
      return;
    }
    setBusy(false);
    router.replace(next);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </label>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] text-red-700">
          {error}
        </p>
      )}
      {!configured && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] text-amber-800">
          Cloudflare CMS is not configured yet.
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function CmsLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Portfolio CMS
        </h1>
        <p className="mt-1 text-[13px] text-slate-600">
          Sign in with your configured CMS administrator credentials.
        </p>
        <Suspense fallback={<div className="mt-8 h-40 rounded-xl border border-slate-200 bg-white" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
