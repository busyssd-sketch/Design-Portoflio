"use client";

import { useDraft } from "@/lib/cms-store";
import { Field, Section, TextInput } from "@/components/cms/fields";

export default function FooterCmsPage() {
  const [content, setContent] = useDraft();
  const f = content.footer;
  const set = (patch: Partial<typeof f>) =>
    setContent((c) => ({ ...c, footer: { ...c.footer, ...patch } }));

  return (
    <div>
      <Section
        title="Footer"
        description="The thin bar at the bottom of every page."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Language label" hint='Placeholder currently shows "English".'>
            <TextInput
              value={f.language_label}
              onChange={(e) => set({ language_label: e.target.value })}
            />
          </Field>
          <Field
            label="Copyright text"
            hint='Include the © symbol yourself, e.g. "© ssdcreatives.ltd"'
          >
            <TextInput
              value={f.copyright_text}
              onChange={(e) => set({ copyright_text: e.target.value })}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
