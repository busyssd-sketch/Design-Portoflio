export type DesignItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  order_index: number;
};

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  order_index: number;
};

export type Appreciation = {
  id: string;
  quote: string;
  author: string;
  role: string;
  order_index: number;
};

export type TimelineEntry = {
  id: string;
  year: string;
  title: string;
  company: string;
  is_current: boolean;
  order_index: number;
};

/* ---------- Site-wide editable content ---------- */

export type SiteSettings = {
  seo_title: string;
  seo_description: string;
  location_label: string;         // "IST"
  location_city: string;          // "Hyderabad"
  location_country: string;       // "India"
  location_lat: number;           // 17.385
  location_lng: number;           // 78.4867
  timezone: string;               // "Asia/Kolkata"
  maps_url: string;
  renovation_mode: boolean;
  renovation_heading: string;
  renovation_body: string;
};

export type ProfileContent = {
  full_name: string;              // "Sandeep Sathivada."
  tagline: string;                // "designer. creator."
  bio: string;
  experience_line_bold: string;   // "8+ years of experience "
  experience_line_rest: string;   // "& still counting…"
  avatar_default_url: string;     // SS logo
  avatar_portrait_url: string;    // cartoon
  socials: {
    instagram_url: string;
    linkedin_url: string;
    email: string;                // renders as mailto:
  };
};

export type AboutContent = {
  paragraphs: string[];           // three paragraphs
  quote: string;                  // with surrounding quotes
  signature: string;              // "- Sandeep Sathivada"
  side_tools_text: string;        // long comma-separated list
  side_contact_email: string;
  side_contact_telegram_url: string;
};

export type FooterContent = {
  language_label: string;         // "English"
  copyright_text: string;         // "© ssdcreatives.ltd"
};

export type SiteContent = {
  version: number;
  site: SiteSettings;
  profile: ProfileContent;
  designs: DesignItem[];
  videos: VideoItem[];
  appreciations: Appreciation[];
  about: AboutContent;
  timeline: TimelineEntry[];
  footer: FooterContent;
};

export type Snapshot = {
  data: SiteContent;
  updated_at: string;             // ISO
};
