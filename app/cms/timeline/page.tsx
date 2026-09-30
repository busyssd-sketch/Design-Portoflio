"use client";

import { useDraft } from "@/lib/cms-store";
import {
  Field,
  Section,
  TextInput,
  Checkbox,
  ItemCard,
  AddButton,
  makeId,
} from "@/components/cms/fields";
import type { TimelineEntry } from "@/lib/types";

export default function TimelinePage() {
  const [content, setContent] = useDraft();
  const list = content.timeline;

  const update = (updater: (l: TimelineEntry[]) => TimelineEntry[]) =>
    setContent((c) => {
      const next = updater(c.timeline).map((t, i) => ({
        ...t,
        order_index: i + 1,
      }));
      return { ...c, timeline: next };
    });

  const patch = (id: string, changes: Partial<TimelineEntry>) =>
    update((l) => l.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const add = () =>
    update((l) => [
      ...l,
      {
        id: makeId("t"),
        year: new Date().getFullYear().toString(),
        title: "Role",
        company: "Company",
        is_current: false,
        order_index: l.length + 1,
      },
    ]);

  const remove = (id: string) => update((l) => l.filter((t) => t.id !== id));

  const move = (id: string, dir: -1 | 1) =>
    update((l) => {
      const idx = l.findIndex((t) => t.id === id);
      const next = [...l];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  return (
    <div>
      <Section
        title="Career timeline"
        description="Rendered as a vertical line on the About → Timeline tab. Ordered top-to-bottom, most recent first."
      >
        <p className="text-[12px] text-slate-500">
          Set <em>Current role</em> on your latest job to show a pulsing green
          dot and “&amp; present” label.
        </p>

        <div className="flex flex-col gap-2">
          {list.map((t, i) => (
            <ItemCard
              key={t.id}
              title={`${t.title} — ${t.company}`}
              subtitle={`${t.year}${t.is_current ? " · current" : ""}`}
              onDelete={() => remove(t.id)}
              onMoveUp={() => move(t.id, -1)}
              onMoveDown={() => move(t.id, 1)}
              disableUp={i === 0}
              disableDown={i === list.length - 1}
            >
              <Field label="Year">
                <TextInput
                  value={t.year}
                  onChange={(e) => patch(t.id, { year: e.target.value })}
                  placeholder="2025"
                />
              </Field>
              <Field label="Role / title">
                <TextInput
                  value={t.title}
                  onChange={(e) => patch(t.id, { title: e.target.value })}
                />
              </Field>
              <Field label="Company">
                <TextInput
                  value={t.company}
                  onChange={(e) => patch(t.id, { company: e.target.value })}
                />
              </Field>
              <div className="flex items-end">
                <Checkbox
                  label="Current role"
                  checked={t.is_current}
                  onChange={(v) => patch(t.id, { is_current: v })}
                />
              </div>
            </ItemCard>
          ))}
        </div>

        <AddButton label="Add entry" onClick={add} />
      </Section>
    </div>
  );
}
