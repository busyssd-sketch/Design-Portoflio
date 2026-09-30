import type {
  AboutContent,
  Appreciation,
  DesignItem,
  FooterContent,
  ProfileContent,
  SiteContent,
  SiteSettings,
  TimelineEntry,
  VideoItem,
} from "./types";

const designMeta: Array<{ title: string; description: string }> = [
  {
    title: "Desert Pavilion",
    description:
      "A single-storey retreat set against arid mountains. The composition explores how a horizontal roofline can dissolve into landscape when framing is disciplined and materials are honest.",
  },
  {
    title: "Concrete Study",
    description:
      "Late-afternoon light falling across a poured wall and a lone chair. An exercise in restraint — one object, one shadow, one texture doing all of the work.",
  },
  {
    title: "Octagon Oculus",
    description:
      "Looking straight up through an octagonal skylight. Wood struts against pure blue create a moment of pause, geometry, and quiet awe.",
  },
  {
    title: "Linen Breeze",
    description:
      "Curtain caught mid-drift over an urban skyline. A studio composition made real — soft against hard, private against public.",
  },
  {
    title: "Spiral Void",
    description:
      "A modern staircase spiralling through a glass and steel void. Movement, sequence, and the pleasure of taking the long way down.",
  },
  {
    title: "Dry Grass Vase",
    description:
      "Studio still life. Dried pampas grass against a warm plaster wall — negative space carrying more weight than the subject.",
  },
  {
    title: "Sand Macro",
    description:
      "A close-up study of sand grains. Reminded me that composition scales infinitely — this could be a landscape or a texture map.",
  },
  {
    title: "Working Desk",
    description:
      "Documentation of a real working desk mid-project — rolled drawings, a scale ruler, and the mess that precedes any finished thing.",
  },
  {
    title: "Forest Cabin",
    description:
      "A blackened-timber cabin at the end of a birch path. Small footprint, quiet doorway, and everything the site needed — nothing more.",
  },
];

export const fallbackDesigns: DesignItem[] = designMeta.map((m, i) => {
  const idx = String(i + 1).padStart(2, "0");
  return {
    id: `d${i + 1}`,
    title: m.title,
    description: m.description,
    order_index: i + 1,
    image_url: `/gallery/${idx}.png`,
  };
});

const videoMeta: Array<{ title: string; description: string }> = [
  {
    title: "Nordic Light Study",
    description:
      "Fifteen minutes of morning sun crossing a still living room, cut to feel like fifteen seconds. Shot on a fixed lens, no camera moves.",
  },
  {
    title: "Concrete Season",
    description:
      "A month with a building — same frame, seven visits. Watching how weather rewrites a facade one storm at a time.",
  },
  {
    title: "Slow Rooms",
    description:
      "A short essay on empty rooms and what they say when you leave them alone. Ambient sound, minimal edit.",
  },
  {
    title: "Grain & Weft",
    description:
      "Textures loop — pine, linen, hand-woven rug, patinated brass. Textile as timekeeping.",
  },
  {
    title: "Interior at Dusk",
    description:
      "The last usable light of the day. Practical lamps switch on one by one. A quiet love letter to golden hour indoors.",
  },
  {
    title: "First Snow",
    description:
      "Winter arrives on a working desk. Windows white out, the room warms up, the pen keeps moving.",
  },
];

export const fallbackVideos: VideoItem[] = videoMeta.map((m, i) => ({
  id: `v${i + 1}`,
  title: m.title,
  description: m.description,
  order_index: i + 1,
  thumbnail_url: "/gallery/video-thumb.png",
  video_url: "#",
}));

export const fallbackAppreciations: Appreciation[] = [
  {
    id: "a1",
    quote:
      "Your spatial compositions are breathtaking. The way you frame negative space transforms ordinary structures into meditative experiences.",
    author: "Sarah Chen",
    role: "Creative Director, ArchViz Studio",
    order_index: 1,
  },
  {
    id: "a2",
    quote:
      "Working with Sandeep was a revelation. Every detail considered, every angle intentional.",
    author: "Marcus Webb",
    role: "Editor, Dezeen",
    order_index: 2,
  },
  {
    id: "a3",
    quote:
      "The Nordic light series changed how I think about architectural photography entirely. The interplay between shadow and warmth, the patience in waiting for the perfect moment — it's not just photography, it's poetry in built form. I've recommended this work to every architect I know.",
    author: "Elena Petrova",
    role: "Principal Architect, Studio Bjarke",
    order_index: 3,
  },
  {
    id: "a4",
    quote: "Pure visual poetry. Nothing else comes close.",
    author: "James Liu",
    role: "Art Director, Monocle",
    order_index: 4,
  },
  {
    id: "a5",
    quote: "The quiet confidence in every frame. Masterful restraint.",
    author: "Anika Patel",
    role: "Gallery Curator, Whitespace London",
    order_index: 5,
  },
  {
    id: "a6",
    quote:
      "Sandeep brings a rare sensitivity to the relationship between light, material, and human experience. His documentation of our Copenhagen headquarters captured something we couldn't articulate ourselves — the soul of the building.",
    author: "Henrik Larsen",
    role: "CEO, Nordic Design Collective",
    order_index: 6,
  },
];

export const fallbackSite: SiteSettings = {
  seo_title: "Sandeep Sathivada — designer. creator.",
  seo_description:
    "Somewhere between watching frames and breaking them apart, I started creating my own.",
  location_label: "IST",
  location_city: "Hyderabad",
  location_country: "India",
  location_lat: 17.385,
  location_lng: 78.4867,
  timezone: "Asia/Kolkata",
  maps_url:
    "https://www.google.com/maps/place/Hyderabad,+Telangana,+India",
  renovation_mode: false,
  renovation_heading:
    "Sandeep will be back, hold on for a few more minutes.",
  renovation_body:
    "Some behind-the-scenes magic is happening. The website is getting a fresh coat of pixels. In the meantime, feel free to reach out.",
};

export const fallbackProfile: ProfileContent = {
  full_name: "Sandeep Sathivada.",
  tagline: "designer. creator.",
  bio: "Somewhere between watching frames and breaking them apart, I started creating my own. Still chasing the next great visual.",
  experience_line_bold: "8+ years of experience ",
  experience_line_rest: "& still counting…",
  avatar_default_url: "/avatar.png",
  avatar_portrait_url: "/avatar-portrait.png",
  socials: {
    instagram_url: "https://instagram.com",
    linkedin_url: "https://linkedin.com",
    email: "busyssd@gmail.com",
  },
};

export const fallbackAbout: AboutContent = {
  paragraphs: [
    "Hi, I'm Sandeep: a graphic designer, UI/UX guy, and motion graphics enthusiast who probably watches way too many films for it to be \"just a hobby.\" Honestly, my obsession with cinema is the reason I fell into motion graphics and animation. One day I was analyzing a Kubrick frame, the next I was keyframing transitions at 3 AM. No regrets.",
    "I get how business works, and I know how to translate a brief into something that makes people stop scrolling. Delivering eye-feast quality work? That's my cup of tea: strong, no sugar. I also have this thing where I can't stop taking candid photos of people. Friends have learned to just accept it. You'll look great, I promise.",
    "All of this: design, motion, film, photography; has wired my brain to think sideways. I love poking around every creative corner of tech: editing, sound design, animation, you name it. I'm not chasing perfection. I'm chasing understanding; figuring out how things work, then making them work beautifully.",
  ],
  quote:
    "\"Design is just organized chaos with better fonts. The real skill isn't making things look good; it's making people feel something before they realize they're looking at all.\"",
  signature: "- Sandeep Sathivada",
  side_tools_text:
    "Figma, UI/UX Design, Video & Motion Editing, Premier Pro, After Effects, Photoshop, FinalCut Pro, Davinci Resolve, UX Writing…",
  side_contact_email: "busyssd@gmail.com",
  side_contact_telegram_url: "https://t.me/",
};

export const fallbackFooter: FooterContent = {
  language_label: "English",
  copyright_text: "© ssdcreatives.ltd",
};

export const fallbackTimeline: TimelineEntry[] = [
  {
    id: "t1",
    year: "2025",
    title: "Senior Demo Experience Designer",
    company: "Salesforce",
    is_current: true,
    order_index: 1,
  },
  {
    id: "t2",
    year: "2021",
    title: "Demo Experience Designer",
    company: "Salesforce",
    is_current: false,
    order_index: 2,
  },
  {
    id: "t3",
    year: "2020",
    title: "User Experience Designer",
    company: "NowFloats",
    is_current: false,
    order_index: 3,
  },
  {
    id: "t4",
    year: "2019",
    title: "UI/UX Designer",
    company: "RandomTrees",
    is_current: false,
    order_index: 4,
  },
  {
    id: "t5",
    year: "2017",
    title: "UI/UX Designer",
    company: "My Ally",
    is_current: false,
    order_index: 5,
  },
  {
    id: "t6",
    year: "2015",
    title: "Internship",
    company: "DRDO",
    is_current: false,
    order_index: 6,
  },
  {
    id: "t7",
    year: "2015",
    title: "Industrial Training",
    company: "Mazagon Dock",
    is_current: false,
    order_index: 7,
  },
];

export function defaultSiteContent(): SiteContent {
  return {
    version: 1,
    site: { ...fallbackSite },
    profile: {
      ...fallbackProfile,
      socials: { ...fallbackProfile.socials },
    },
    designs: fallbackDesigns.map((d) => ({ ...d })),
    videos: fallbackVideos.map((v) => ({ ...v })),
    appreciations: fallbackAppreciations.map((a) => ({ ...a })),
    about: {
      ...fallbackAbout,
      paragraphs: [...fallbackAbout.paragraphs],
    },
    timeline: fallbackTimeline.map((t) => ({ ...t })),
    footer: { ...fallbackFooter },
  };
}
