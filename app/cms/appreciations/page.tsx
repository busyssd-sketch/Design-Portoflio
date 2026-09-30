"use client";

import { useDraft } from "@/lib/cms-store";
import {
  Field,
  Section,
  TextInput,
  TextArea,
  ItemCard,
  AddButton,
  makeId,
} from "@/components/cms/fields";
import type { Appreciation } from "@/lib/types";

export default function AppreciationsPage() {
  const [content, setContent] = useDraft();
  const list = content.appreciations;

  const update = (updater: (l: Appreciation[]) => Appreciation[]) =>
    setContent((c) => {
      const next = updater(c.appreciations).map((a, i) => ({
        ...a,
        order_index: i + 1,
      }));
      return { ...c, appreciations: next };
    });

  const patch = (id: string, changes: Partial<Appreciation>) =>
    update((l) => l.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const add = () =>
    update((l) => [
      ...l,
      {
        id: makeId("a"),
        quote: "",
        author: "New author",
        role: "",
        order_index: l.length + 1,
      },
    ]);

  const remove = (id: string) => update((l) => l.filter((a) => a.id !== id));

  const move = (id: string, dir: -1 | 1) =>
    update((l) => {
      const idx = l.findIndex((a) => a.id === id);
      const next = [...l];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  return (
    <div>
      <Section
        title="Appreciations"
        description="Testimonials laid out as two columns. Longer quotes span taller cards automatically."
      >
        <p className="text-[12px] text-slate-500">
          Quotes can be short (10 words) or long (60+). Mix lengths for a
          natural cadence. No quotation marks needed — the site adds them.
        </p>

        <div className="flex flex-col gap-2">
          {list.map((a, i) => (
            <ItemCard
              key={a.id}
              title={a.author || "untitled"}
              subtitle={a.quote.slice(0, 100)}
              onDelete={() => remove(a.id)}
              onMoveUp={() => move(a.id, -1)}
              onMoveDown={() => move(a.id, 1)}
              disableUp={i === 0}
              disableDown={i === list.length - 1}
            >
              <Field label="Author name">
                <TextInput
                  value={a.author}
                  onChange={(e) => patch(a.id, { author: e.target.value })}
                />
              </Field>
              <Field label="Role / company">
                <TextInput
                  value={a.role}
                  onChange={(e) => patch(a.id, { role: e.target.value })}
                  placeholder="Creative Director, ArchViz Studio"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Quote">
                  <TextArea
                    rows={4}
                    value={a.quote}
                    onChange={(e) => patch(a.id, { quote: e.target.value })}
                  />
                </Field>
              </div>
            </ItemCard>
          ))}
        </div>

        <AddButton label="Add appreciation" onClick={add} />
      </Section>
    </div>
  );
}
