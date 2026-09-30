"use client";

import { useRef, useState } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { TextInput } from "./fields";

const MAX_DURATION_SECONDS = 600; // 10:00
const MAX_UPLOAD_MB = 100; // safe headroom under Supabase free-tier defaults

const ACCEPTED_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "image/gif",
]);

function fmtDuration(s: number) {
  if (!Number.isFinite(s)) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmtSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function probeVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(v.duration || 0);
    v.onerror = () => resolve(NaN);
    v.src = url;
  });
}

function extFromMime(mime: string) {
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  if (mime === "image/gif") return "gif";
  return "bin";
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function VideoInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [meta, setMeta] = useState<{
    duration?: number;
    sizeBytes?: number;
    kind?: "gif" | "video";
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const clearFileState = () => {
    setMeta({});
    setError(null);
    setProgress("");
  };

  const backendReady = isSupabaseConfigured();

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    setProgress("Checking file…");

    if (!ACCEPTED_MIME.has(file.type)) {
      setBusy(false);
      setProgress("");
      setError(
        `Unsupported file type "${file.type || "unknown"}". Accepted: .mp4, .webm, .mov, .gif.`,
      );
      return;
    }

    const sizeBytes = file.size;
    const sizeMb = sizeBytes / (1024 * 1024);
    if (sizeMb > MAX_UPLOAD_MB) {
      setBusy(false);
      setProgress("");
      setError(
        `File is ${fmtSize(sizeBytes)} — max ${MAX_UPLOAD_MB} MB. Compress the video (H.264, 720p) or use an external URL.`,
      );
      return;
    }

    const isGif = file.type === "image/gif";
    const objectUrl = URL.createObjectURL(file);

    let duration = NaN;
    if (!isGif) {
      duration = await probeVideoDuration(objectUrl);
      if (!Number.isFinite(duration)) {
        URL.revokeObjectURL(objectUrl);
        setBusy(false);
        setProgress("");
        setError(
          "Could not read this video's duration. Try re-exporting as .mp4 (H.264) or .webm (VP9).",
        );
        return;
      }
      if (duration > MAX_DURATION_SECONDS + 0.5) {
        URL.revokeObjectURL(objectUrl);
        setBusy(false);
        setProgress("");
        setError(
          `Duration is ${fmtDuration(duration)} — max is ${fmtDuration(MAX_DURATION_SECONDS)}. Trim before uploading.`,
        );
        return;
      }
    }
    URL.revokeObjectURL(objectUrl);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setBusy(false);
      setProgress("");
      setError(
        "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the dev server.",
      );
      return;
    }

    const ext = extFromMime(file.type);
    const folder = isGif ? "gifs" : "videos";
    const path = `${folder}/${Date.now()}-${slugify(file.name)}.${ext}`;

    setProgress("Uploading to storage…");
    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });

    if (upErr) {
      setBusy(false);
      setProgress("");
      setError(`Upload failed: ${upErr.message}`);
      return;
    }

    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    onChange(pub.publicUrl);
    setMeta({
      duration: isGif ? undefined : duration,
      sizeBytes,
      kind: isGif ? "gif" : "video",
    });
    setBusy(false);
    setProgress("");
  };

  const kindFromValue = (() => {
    if (!value) return null;
    if (/\.gif(\?|#|$)/i.test(value)) return "gif";
    if (/\.(mp4|webm|mov)(\?|#|$)/i.test(value)) return "video";
    return "external";
  })();

  return (
    <div className="flex flex-col gap-2">
      <TextInput
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          clearFileState();
        }}
        placeholder="https://…/clip.mp4 or paste an external URL"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || !backendReady}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
        >
          {busy ? progress || "Uploading…" : "Upload file"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              clearFileState();
            }}
            className="text-[12px] text-slate-500 underline underline-offset-2 hover:text-slate-800"
          >
            Clear
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,image/gif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {!backendReady && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          Backend not configured. Uploads are disabled until Supabase env vars
          are set.
        </p>
      )}

      {(meta.sizeBytes || meta.duration || kindFromValue) && !error && (
        <p className="text-[11px] text-slate-600">
          {kindFromValue === "external" && (
            <span className="font-medium">External URL</span>
          )}
          {meta.kind === "gif" && (
            <span className="font-medium">
              GIF · loops silently, no controls
            </span>
          )}
          {meta.kind === "video" && (
            <span className="font-medium">
              MP4/WebM · {fmtDuration(meta.duration ?? 0)}
            </span>
          )}
          {meta.sizeBytes && (
            <>
              {" · "}
              <span>{fmtSize(meta.sizeBytes)}</span>
            </>
          )}
        </p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-md bg-slate-50 px-2.5 py-2 text-[11px] leading-relaxed text-slate-600">
        <strong>Accepted:</strong> .mp4 (H.264), .webm (VP9), .mov, or .gif.
        <br />
        <strong>Max duration:</strong> {fmtDuration(MAX_DURATION_SECONDS)}.
        <br />
        <strong>Max file size:</strong> {MAX_UPLOAD_MB} MB per file (Supabase
        Storage). Recommended: 1080p H.264 ~5 Mbps.
      </div>
    </div>
  );
}
