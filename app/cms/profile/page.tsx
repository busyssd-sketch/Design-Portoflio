"use client";

import { useDraft } from "@/lib/cms-store";
import {
  Field,
  Section,
  TextInput,
  TextArea,
  ImageInput,
} from "@/components/cms/fields";

export default function ProfilePage() {
  const [content, setContent] = useDraft();
  const p = content.profile;
  const set = (patch: Partial<typeof p>) =>
    setContent((c) => ({ ...c, profile: { ...c.profile, ...patch } }));
  const setSocial = (patch: Partial<typeof p.socials>) =>
    setContent((c) => ({
      ...c,
      profile: {
        ...c.profile,
        socials: { ...c.profile.socials, ...patch },
      },
    }));

  return (
    <div>
      <Section
        title="Identity"
        description="Shown next to your avatar on every page."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full name" hint='Trailing period is optional (e.g. "Sandeep Sathivada.")'>
            <TextInput
              value={p.full_name}
              onChange={(e) => set({ full_name: e.target.value })}
            />
          </Field>
          <Field label="Tagline" hint="Short subtitle under the name.">
            <TextInput
              value={p.tagline}
              onChange={(e) => set({ tagline: e.target.value })}
            />
          </Field>
        </div>
        <Field
          label="Bio"
          hint="One or two sentences, under ~200 characters reads best."
        >
          <TextArea
            rows={3}
            value={p.bio}
            onChange={(e) => set({ bio: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Experience line — bold part"
            hint='e.g. "8+ years of experience "'
          >
            <TextInput
              value={p.experience_line_bold}
              onChange={(e) =>
                set({ experience_line_bold: e.target.value })
              }
            />
          </Field>
          <Field
            label="Experience line — rest"
            hint='e.g. "& still counting…"'
          >
            <TextInput
              value={p.experience_line_rest}
              onChange={(e) =>
                set({ experience_line_rest: e.target.value })
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Avatar (flip card)"
        description="Two square PNGs that alternate on a 10-second loop."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Front — logo / mark">
            <ImageInput
              value={p.avatar_default_url}
              onChange={(url) => set({ avatar_default_url: url })}
              preferredSize="512×512px"
              aspect="1:1 square"
              maxKb={200}
            />
          </Field>
          <Field
            label="Back — portrait"
            hint="Portrait crops from the top, so keep the face in the upper third."
          >
            <ImageInput
              value={p.avatar_portrait_url}
              onChange={(url) => set({ avatar_portrait_url: url })}
              preferredSize="832×1248px"
              aspect="2:3 portrait"
              maxKb={400}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Social links"
        description="Buttons under your bio."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Instagram URL">
            <TextInput
              value={p.socials.instagram_url}
              onChange={(e) => setSocial({ instagram_url: e.target.value })}
              placeholder="https://instagram.com/handle"
            />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput
              value={p.socials.linkedin_url}
              onChange={(e) => setSocial({ linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/handle"
            />
          </Field>
        </div>
        <Field
          label="Contact email"
          hint="Renders as a mailto: link on the envelope button."
        >
          <TextInput
            type="email"
            value={p.socials.email}
            onChange={(e) => setSocial({ email: e.target.value })}
          />
        </Field>
      </Section>
    </div>
  );
}
