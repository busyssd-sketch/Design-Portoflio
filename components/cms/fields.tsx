"use client";

import { useRef, useState } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase";

/* ---------- Label / wrapper ---------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-[18px] font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] text-slate-600">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/* ---------- Basic inputs ---------- */

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
        props.className ?? ""
      }`}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`min-h-[80px] rounded-md border border-slate-300 bg-white px-3 py-2 text-[14px] leading-relaxed text-slate-900 outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
        props.className ?? ""
      }`}
    />
  );
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput type="number" {...props} />;
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-400"
      />
      {label}
    </label>
  );
}

/* ---------- Image input with dimension hints ---------- */

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return "bin";
}

export function ImageInput({
  value,
  onChange,
  preferredSize,
  aspect,
  maxKb,
}: {
  value: string;
  onChange: (url: string) => void;
  preferredSize?: string; // "1200×900px"
  aspect?: string; // "4:3"
  maxKb?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendReady = isSupabaseConfigured();

  const uploadFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Not an image file.");
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Supabase not configured — add env vars to enable uploads.");
      return;
    }
    setBusy(true);
    const ext = extFromMime(file.type);
    const path = `images/${Date.now()}-${slugifyName(file.name)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
    if (upErr) {
      setBusy(false);
      setError(`Upload failed: ${upErr.message}`);
      return;
    }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    onChange(pub.publicUrl);
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-300 bg-slate-100">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-slate-400">no image</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <TextInput
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/gallery/01.png or https://…"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || !backendReady}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              {busy ? "Uploading…" : "Upload file"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[12px] text-slate-500 underline underline-offset-2 hover:text-slate-800"
              >
                Clear
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
      {!backendReady && (
        <p className="text-[11px] text-amber-700">
          Uploads disabled — Supabase env vars missing.
        </p>
      )}
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-700">
          {error}
        </p>
      )}
      {(preferredSize || aspect || maxKb) && (
        <p className="text-[11px] text-slate-500">
          Preferred:
          {preferredSize && <> {preferredSize}</>}
          {aspect && <> · {aspect}</>}
          {maxKb && <> · &lt;{maxKb}KB</>}
          {" · PNG or JPG"}
        </p>
      )}
    </div>
  );
}

/* ---------- Reusable list-item card ---------- */

export function ItemCard({
  title,
  subtitle,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  children,
}: {
  title: string;
  subtitle?: string;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-slate-200 bg-white open:border-slate-400">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-[14px]">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-slate-900">
            {title || <em className="text-slate-400">untitled</em>}
          </div>
          {subtitle && (
            <div className="mt-0.5 truncate text-[12px] text-slate-500">
              {subtitle}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMoveUp();
            }}
            disabled={disableUp}
            className="grid h-7 w-7 place-items-center rounded border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-30"
            aria-label="Move up"
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMoveDown();
            }}
            disabled={disableDown}
            className="grid h-7 w-7 place-items-center rounded border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-30"
            aria-label="Move down"
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm("Delete this item?")) onDelete();
            }}
            className="ml-1 grid h-7 w-7 place-items-center rounded border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50"
            aria-label="Delete"
            title="Delete"
          >
            ×
          </button>
          <span className="ml-2 text-slate-400 transition-transform group-open:rotate-180">
            ▾
          </span>
        </div>
      </summary>
      <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-4 md:grid-cols-2">
        {children}
      </div>
    </details>
  );
}

/* ---------- Add-row button ---------- */

export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 self-start rounded-md border border-dashed border-slate-400 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-600 hover:bg-slate-50"
    >
      + {label}
    </button>
  );
}

/* ---------- Utilities exported for pages ---------- */

export function makeId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}
