"use client";

import { useVideos } from "@/lib/content";
import { MediaGallery, type MediaItem } from "@/components/media-gallery";

export default function VideosPage() {
  const videos = useVideos();
  const items: MediaItem[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    image_url: v.thumbnail_url,
    video_url: v.video_url && v.video_url !== "#" ? v.video_url : undefined,
    kind: "video",
  }));
  return <MediaGallery items={items} layout="videos" />;
}
