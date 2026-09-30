"use client";

import { useEffect } from "react";
import { useSiteContent } from "@/lib/content";

/**
 * Reflects the current published SEO title + description into <head>.
 * Runs client-side because CMS content lives in localStorage today.
 */
export function SiteMetadata() {
  const site = useSiteContent().site;

  useEffect(() => {
    if (site.seo_title) document.title = site.seo_title;
    if (site.seo_description) {
      let tag = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = site.seo_description;
    }
  }, [site.seo_title, site.seo_description]);

  return null;
}
