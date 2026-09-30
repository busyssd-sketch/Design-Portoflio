"use client";

import { useDraft } from "@/lib/cms-store";
import {
  Field,
  Section,
  TextInput,
  TextArea,
} from "@/components/cms/fields";

export default function AboutCmsPage() {
  const [content, setContent] = useDraft();
  const a = content.about;
  const set = (patch: Partial<typeof a>) =>
    setContent((c) => ({ ...c, about: { ...c.about, ...patch } }));
  const setPara = (idx: number, value: string) =>
    set({
      paragraphs: a.paragraphs.map((p, i) => (i === idx ? value : p)),
    });

  const addPara = () =>
    set({ paragraphs: [...a.paragraphs, "New paragraph..."] });

  const removePara = (idx: number) =>
    set({ paragraphs: a.paragraphs.filter((_, i) => i !== idx) });

  return (
    <div>
      <Section
        title="About typewriter"
        description="These paragraphs animate character-by-character. Keep them casual and short-ish — long paragraphs stall the reveal."
      >
        {a.paragraphs.map((p, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Paragraph {i + 1}</span>
              {a.paragraphs.length > 1 && (
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => removePara(i)}
                >
                  remove
                </button>
              )}
            </div>
            <TextArea
              rows={5}
              value={p}
              onChange={(e) => setPara(i, e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addPara}
          className="self-start rounded-md border border-dashed border-slate-400 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:border-slate-600 hover:bg-slate-50"
        >
          + Add paragraph
        </button>

        <Field
          label="Blockquote"
          hint="Rendered center-aligned in italic. Include the surrounding quotation marks if you want them."
        >
          <TextArea
            rows={3}
            value={a.quote}
            onChange={(e) => set({ quote: e.target.value })}
          />
        </Field>

        <Field
          label="Signature"
          hint='Right-aligned in a script font. Traditional format: "- Sandeep Sathivada"'
        >
          <TextInput
            value={a.signature}
            onChange={(e) => set({ signature: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        title="Side panel — Tools & Tech"
        description="Comma-separated list shown in the right-hand card on the About page."
      >
        <Field label="Tools text">
          <TextArea
            rows={3}
            value={a.side_tools_text}
            onChange={(e) => set({ side_tools_text: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        title="Side panel — Contact"
        description="Two small icon buttons on the Contact card."
      >
        <Field label="Email">
          <TextInput
            type="email"
            value={a.side_contact_email}
            onChange={(e) => set({ side_contact_email: e.target.value })}
          />
        </Field>
        <Field
          label="Telegram URL"
          hint='Full URL, e.g. "https://t.me/yourhandle".'
        >
          <TextInput
            value={a.side_contact_telegram_url}
            onChange={(e) =>
              set({ side_contact_telegram_url: e.target.value })
            }
          />
        </Field>
      </Section>
    </div>
  );
}
