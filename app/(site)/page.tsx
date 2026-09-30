"use client";

import { useDesigns } from "@/lib/content";
import { MediaGallery, type MediaItem } from "@/components/media-gallery";

export default function DesignsPage() {
  const designs = useDesigns();
  const items: MediaItem[] = designs.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    image_url: d.image_url,
    kind: "design",
  }));
  return <MediaGallery items={items} layout="designs" />;
}
