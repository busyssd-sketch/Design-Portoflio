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
import type { DesignItem } from "@/lib/types";

export default function DesignsPage() {
  const [content, setContent] = useDraft();
  const designs = content.designs;

  const update = (updater: (list: DesignItem[]) => DesignItem[]) =>
    setContent((c) => {
      const next = updater(c.designs).map((d, i) => ({
        ...d,
        order_index: i + 1,
      }));
      return { ...c, designs: next };
    });

  const patch = (id: string, changes: Partial<DesignItem>) =>
    update((list) => list.map((d) => (d.id === id ? { ...d, ...changes } : d)));

  const add = () =>
    update((list) => [
      ...list,
      {
        id: makeId("d"),
        title: "New design",
        description: "",
        image_url: "",
        order_index: list.length + 1,
      },
    ]);

  const remove = (id: string) =>
    update((list) => list.filter((d) => d.id !== id));

  const move = (id: string, dir: -1 | 1) =>
    update((list) => {
      const idx = list.findIndex((d) => d.id === id);
      const next = [...list];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  return (
    <div>
      <Section
        title="Designs gallery"
        description="These populate the Designs tab (3 columns × 3+ rows). Order below is the order on the site."
      >
        <p className="text-[12px] text-slate-500">
          <strong>Image guidance:</strong> square or 4:3, at least 1200px wide,
          under 500KB. PNG or JPG. Cards zoom subtly on hover, so a bit of
          bleed on all sides looks best.
        </p>

        <div className="flex flex-col gap-2">
          {designs.map((d, i) => (
            <ItemCard
              key={d.id}
              title={d.title}
              subtitle={d.description.slice(0, 80)}
              onDelete={() => remove(d.id)}
              onMoveUp={() => move(d.id, -1)}
              onMoveDown={() => move(d.id, 1)}
              disableUp={i === 0}
              disableDown={i === designs.length - 1}
            >
              <Field label="Title">
                <TextInput
                  value={d.title}
                  onChange={(e) => patch(d.id, { title: e.target.value })}
                />
              </Field>
              <Field
                label="Description"
                hint="Shown in the lightbox modal on the right side."
              >
                <TextArea
                  rows={4}
                  value={d.description}
                  onChange={(e) =>
                    patch(d.id, { description: e.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Image">
                  <ImageInput
                    value={d.image_url}
                    onChange={(url) => patch(d.id, { image_url: url })}
                    preferredSize="1200×1200px"
                    aspect="1:1 square"
                    maxKb={500}
                  />
                </Field>
              </div>
            </ItemCard>
          ))}
        </div>

        <AddButton label="Add design" onClick={add} />
      </Section>
    </div>
  );
}
