"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  /** When the lightbox re-mounts a different item, pass a changing key. */
};

const GIF_RE = /\.gif(\?|#|$)/i;

function isGif(src: string) {
  return GIF_RE.test(src) || src.startsWith("data:image/gif");
}

export function VideoPlayer({ src, poster, title, className }: Props) {
  if (isGif(src)) {
    return (
      // GIFs autoplay natively, no controls needed.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={title ?? ""}
        className={`h-full w-full object-contain bg-black ${className ?? ""}`}
      />
    );
  }
  return <NativeVideo src={src} poster={poster} title={title} className={className} />;
}

function NativeVideo({
  src,
  poster,
  title,
  className,
}: {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const scheduleHide = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 1600);
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center bg-black ${
        className ?? ""
      }`}
      onMouseMove={() => {
        setShowControls(true);
        if (playing) scheduleHide();
      }}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        title={title}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          scheduleHide();
        }}
        onPause={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        onEnded={() => {
          setPlaying(false);
          setStarted(false);
          setShowControls(true);
        }}
        onClick={toggle}
        className="h-full w-full object-contain"
      />

      {/* Big centered play button (before first play + after end) */}
      {!started && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          className="pointer-events-auto absolute inset-0 grid place-items-center bg-black/10 transition-colors hover:bg-black/25"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black shadow-lg transition-transform hover:scale-105">
            <PlayIcon size={26} />
          </span>
        </button>
      )}

      {/* Small hover play/pause chip (during / after start) */}
      {started && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          aria-label={playing ? "Pause" : "Play"}
          className={`pointer-events-auto absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-opacity duration-200 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </button>
      )}
    </div>
  );
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.5v13a1 1 0 001.5.87l11-6.5a1 1 0 000-1.74l-11-6.5A1 1 0 008 5.5z" />
    </svg>
  );
}

function PauseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="5" width="4.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
    </svg>
  );
}
