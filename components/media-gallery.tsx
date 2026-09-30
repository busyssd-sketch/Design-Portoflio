"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VideoPlayer } from "./video-player";

export type MediaItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  kind: "design" | "video";
  video_url?: string;
};

type Props = {
  items: MediaItem[];
  layout: "designs" | "videos";
};

export function MediaGallery({ items, layout }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setOpenIndex(i), []);
  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? i : (i - 1 + items.length) % items.length
      ),
    [items.length]
  );

  return (
    <>
      {layout === "designs" ? (
        <DesignsGrid items={items} onOpen={open} />
      ) : (
        <VideosGrid items={items} onOpen={open} />
      )}
      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </>
  );
}

/* --------------------------- grids --------------------------- */

function DesignsGrid({
  items,
  onOpen,
}: {
  items: MediaItem[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 pt-8 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item, i) => (
        <Tile
          key={item.id}
          onClick={() => onOpen(i)}
          index={i}
          aspect="square"
          title={item.title}
        >
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 300px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Tile>
      ))}
    </div>
  );
}

function VideosGrid({
  items,
  onOpen,
}: {
  items: MediaItem[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-8 sm:grid-cols-2">
      {items.map((item, i) => (
        <article key={item.id}>
          <Tile
            onClick={() => onOpen(i)}
            index={i}
            aspect="video"
            title={item.title}
          >
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(min-width: 640px) 420px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <Image
                src="/icons/play.svg"
                alt=""
                width={56}
                height={56}
                className="drop-shadow-md"
              />
            </span>
          </Tile>
          <h3 className="mt-3 text-[14px] font-semibold text-ink">
            {item.title}
          </h3>
        </article>
      ))}
    </div>
  );
}

/* --------------------------- Tile --------------------------- */

function Tile({
  children,
  onClick,
  index,
  aspect,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  index: number;
  aspect: "square" | "video";
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${title}`}
      className={`group relative block w-full overflow-hidden rounded-lg bg-surface animate-fade-up
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink
        ${aspect === "square" ? "aspect-square" : "aspect-video"}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {children}
    </button>
  );
}

/* --------------------------- Lightbox (portalled to <body>) --------------------------- */

function Lightbox({
  items,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const item = items[index];
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll, handle ESC / arrow keys, restore focus on unmount
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose, onNext, onPrev]);

  if (!mounted) return null;

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const overlay = (
    <div
      ref={backdropRef}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md animate-fade-in sm:px-20 md:px-28"
    >
      {/* Modal box: 16:9 aspect, image left, text right */}
      <div
        className="relative flex w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] md:aspect-video md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image / video side */}
        <div className="relative aspect-video w-full bg-black md:aspect-auto md:h-full md:w-3/5">
          {item.kind === "video" && item.video_url ? (
            <VideoPlayer
              key={item.id}
              src={item.video_url}
              poster={item.image_url || undefined}
              title={item.title}
            />
          ) : (
            <>
              <Image
                key={item.id}
                src={item.image_url}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 660px, 100vw"
                priority
                className="object-contain animate-fade-in"
              />
              {item.kind === "video" && (
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  <Image
                    src="/icons/play.svg"
                    alt=""
                    width={72}
                    height={72}
                    className="opacity-90 drop-shadow-lg"
                  />
                </span>
              )}
            </>
          )}
        </div>

        {/* Text side */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
            {item.kind === "design" ? "Design" : "Video"}
          </p>
          <h2
            id="lightbox-title"
            className="text-[22px] font-semibold leading-tight text-ink md:text-[26px]"
          >
            {item.title}
          </h2>
          <p className="text-[14px] leading-relaxed text-ink/85">
            {item.description}
          </p>
          <div className="mt-auto pt-4 text-[11px] text-muted">
            {index + 1} / {items.length}
          </div>
        </div>

        {/* Close button */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-bg/90 text-ink shadow-soft transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <CloseGlyph />
        </button>
      </div>

      {/* Floating prev / next — well outside the modal box */}
      <NavButton
        direction="prev"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      />
      <NavButton
        direction="next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      />
    </div>
  );

  return createPortal(overlay, document.body);
}

function NavButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: (e: React.MouseEvent) => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      onClick={onClick}
      aria-label={isPrev ? "Previous" : "Next"}
      className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-14 sm:w-14 ${
        isPrev
          ? "left-3 sm:left-8 md:left-12"
          : "right-3 sm:right-8 md:right-12"
      }`}
    >
      {isPrev ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
