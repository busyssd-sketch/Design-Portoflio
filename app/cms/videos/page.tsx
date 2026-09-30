"use client";

import { useDraft } from "@/lib/cms-store";
import {
  Field,
  Section,
  TextInput,
  TextArea,
  ImageInput,
  ItemCard,
  AddButton,
  makeId,
} from "@/components/cms/fields";
import { VideoInput } from "@/components/cms/video-input";
import type { VideoItem } from "@/lib/types";

export default function VideosCmsPage() {
  const [content, setContent] = useDraft();
  const videos = content.videos;

  const update = (updater: (list: VideoItem[]) => VideoItem[]) =>
    setContent((c) => {
      const next = updater(c.videos).map((v, i) => ({
        ...v,
        order_index: i + 1,
      }));
      return { ...c, videos: next };
    });

  const patch = (id: string, changes: Partial<VideoItem>) =>
    update((list) => list.map((v) => (v.id === id ? { ...v, ...changes } : v)));

  const add = () =>
    update((list) => [
      ...list,
      {
        id: makeId("v"),
        title: "New video",
        description: "",
        thumbnail_url: "",
        video_url: "",
        order_index: list.length + 1,
      },
    ]);

  const remove = (id: string) =>
    update((list) => list.filter((v) => v.id !== id));

  const move = (id: string, dir: -1 | 1) =>
    update((list) => {
      const idx = list.findIndex((v) => v.id === id);
      const next = [...list];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  return (
    <div>
      <Section
        title="Videos gallery"
        description="Populates the Videos tab (2 columns × 3+ rows). A play glyph appears over each thumbnail."
      >
        <p className="text-[12px] text-slate-500">
          <strong>Thumbnail guidance:</strong> 16:9 landscape, at least
          1600×900px, under 400KB. PNG or JPG. Keep faces / focal points
          slightly off-center — a play icon sits in the middle.
        </p>
        <p className="text-[12px] text-slate-500">
          <strong>Video / GIF:</strong> uploaded clips play in the site&apos;s
          own player (play/pause only) — no YouTube branding. GIFs autoplay
          silently. Cap: 2:00 duration.
        </p>

        <div className="flex flex-col gap-2">
          {videos.map((v, i) => (
            <ItemCard
              key={v.id}
              title={v.title}
              subtitle={v.description.slice(0, 80)}
              onDelete={() => remove(v.id)}
              onMoveUp={() => move(v.id, -1)}
              onMoveDown={() => move(v.id, 1)}
              disableUp={i === 0}
              disableDown={i === videos.length - 1}
            >
              <Field label="Title">
                <TextInput
                  value={v.title}
                  onChange={(e) => patch(v.id, { title: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <TextArea
                  rows={4}
                  value={v.description}
                  onChange={(e) =>
                    patch(v.id, { description: e.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Thumbnail image">
                  <ImageInput
                    value={v.thumbnail_url}
                    onChange={(url) => patch(v.id, { thumbnail_url: url })}
                    preferredSize="1600×900px"
                    aspect="16:9"
                    maxKb={400}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Video or GIF">
                  <VideoInput
                    value={v.video_url === "#" ? "" : v.video_url}
                    onChange={(url) => patch(v.id, { video_url: url })}
                  />
                </Field>
              </div>
            </ItemCard>
          ))}
        </div>

        <AddButton label="Add video" onClick={add} />
      </Section>
    </div>
  );
}
