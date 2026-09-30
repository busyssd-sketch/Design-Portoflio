"use client";

import { useDraft } from "@/lib/cms-store";
import { Field, Section, TextInput, TextArea, NumberInput } from "@/components/cms/fields";

export default function SiteSettingsPage() {
  const [content, setContent] = useDraft();
  const s = content.site;
  const set = (patch: Partial<typeof s>) =>
    setContent((c) => ({ ...c, site: { ...c.site, ...patch } }));

  return (
    <div>
      {/* Renovation toggle — most prominent, top of page */}
      <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-amber-900">
              Page renovation mode
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-amber-800">
              While on, every public route (<code>/</code>, <code>/videos</code>,{" "}
              <code>/about</code>, <code>/appreciations</code>) is replaced with
              a friendly &ldquo;be back soon&rdquo; page. The CMS itself stays
              accessible. Great for when you&rsquo;re editing content and
              don&rsquo;t want visitors to see the site mid-change.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={s.renovation_mode}
            onClick={() => set({ renovation_mode: !s.renovation_mode })}
            className={`ios-switch shrink-0 ${
              s.renovation_mode ? "ios-switch--on" : ""
            }`}
            aria-label="Toggle renovation mode"
          >
            <span className="ios-switch__knob" />
          </button>
        </div>

        {s.renovation_mode && (
          <div className="mt-4 flex flex-col gap-3 border-t border-amber-200 pt-4">
            <Field
              label="Headline"
              hint="Big bold line under the illustration."
            >
              <TextInput
                value={s.renovation_heading ?? ""}
                onChange={(e) => set({ renovation_heading: e.target.value })}
              />
            </Field>
            <Field
              label="Body"
              hint="Short reassuring paragraph beneath the headline."
            >
              <TextArea
                rows={3}
                value={s.renovation_body ?? ""}
                onChange={(e) => set({ renovation_body: e.target.value })}
              />
            </Field>
            <p className="text-[11px] text-amber-800">
              Contact pills use your Email + Telegram from{" "}
              <strong>About &rarr; Side panel &rarr; Contact</strong>.
            </p>
          </div>
        )}
      </section>

      <Section
        title="SEO / Metadata"
        description="Shown in browser tabs, search results, and when the URL is shared."
      >
        <Field label="Page title">
          <TextInput
            value={s.seo_title}
            onChange={(e) => set({ seo_title: e.target.value })}
          />
        </Field>
        <Field
          label="Meta description"
          hint="Aim for 140–160 characters."
        >
          <TextArea
            rows={3}
            value={s.seo_description}
            onChange={(e) => set({ seo_description: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        title="Live status widget (top-nav)"
        description="The pill in the header shows local time, sun/moon glyph, and current temperature for these coordinates."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City">
            <TextInput
              value={s.location_city}
              onChange={(e) => set({ location_city: e.target.value })}
            />
          </Field>
          <Field label="Country">
            <TextInput
              value={s.location_country}
              onChange={(e) => set({ location_country: e.target.value })}
            />
          </Field>
          <Field
            label="Timezone label"
            hint='Short code shown in the pill, e.g. "IST", "PST".'
          >
            <TextInput
              value={s.location_label}
              onChange={(e) => set({ location_label: e.target.value })}
            />
          </Field>
          <Field
            label="IANA timezone"
            hint='Used for the live clock. Examples: "Asia/Kolkata", "America/Los_Angeles".'
          >
            <TextInput
              value={s.timezone}
              onChange={(e) => set({ timezone: e.target.value })}
            />
          </Field>
          <Field
            label="Latitude"
            hint="Decimal degrees. Used for the weather API (Open-Meteo)."
          >
            <NumberInput
              step="0.0001"
              value={s.location_lat}
              onChange={(e) =>
                set({ location_lat: parseFloat(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Longitude" hint="Decimal degrees.">
            <NumberInput
              step="0.0001"
              value={s.location_lng}
              onChange={(e) =>
                set({ location_lng: parseFloat(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
        <Field
          label="Google Maps link"
          hint="Opens when someone clicks the location card on About."
        >
          <TextInput
            value={s.maps_url}
            onChange={(e) => set({ maps_url: e.target.value })}
          />
        </Field>
      </Section>
    </div>
  );
}
