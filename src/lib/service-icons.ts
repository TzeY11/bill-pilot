import type { ServiceCategory, ServiceIcon, ServiceItem } from "@/types/billing";

export type IconPreset = {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
  background: string;
  brandIcon?: string;
  category?: ServiceCategory;
};

export const iconPresets: IconPreset[] = [
  {
    key: "openai",
    label: "ChatGPT / OpenAI",
    shortLabel: "GPT",
    color: "#ffffff",
    background: "#10a37f",
    brandIcon: "openai",
    category: "Subscription",
  },
  {
    key: "dmit",
    label: "DMIT",
    shortLabel: "DM",
    color: "#ffffff",
    background: "#111827",
    category: "VPS",
  },
  {
    key: "cloudflare",
    label: "Cloudflare",
    shortLabel: "CF",
    color: "#ffffff",
    background: "#f38020",
    brandIcon: "cloudflare",
    category: "Domain",
  },
  {
    key: "apple",
    label: "Apple",
    shortLabel: "iC",
    color: "#ffffff",
    background: "#1f2937",
    brandIcon: "apple",
    category: "Software",
  },
  {
    key: "icloud",
    label: "iCloud",
    shortLabel: "iC",
    color: "#ffffff",
    background: "#0a84ff",
    brandIcon: "icloud",
    category: "Software",
  },
  {
    key: "applemusic",
    label: "Apple Music",
    shortLabel: "AM",
    color: "#ffffff",
    background: "#fa243c",
    brandIcon: "applemusic",
    category: "Subscription",
  },
  {
    key: "appletv",
    label: "Apple TV",
    shortLabel: "TV",
    color: "#ffffff",
    background: "#111827",
    brandIcon: "appletv",
    category: "Subscription",
  },
  {
    key: "applepay",
    label: "Apple Pay",
    shortLabel: "AP",
    color: "#ffffff",
    background: "#111827",
    brandIcon: "applepay",
    category: "Other",
  },
  {
    key: "applearcade",
    label: "Apple Arcade",
    shortLabel: "AA",
    color: "#ffffff",
    background: "#ef4444",
    brandIcon: "applearcade",
    category: "Game",
  },
  {
    key: "minecraft",
    label: "Minecraft",
    shortLabel: "MC",
    color: "#ffffff",
    background: "#3b7f2f",
    category: "Game",
  },
  {
    key: "paypal",
    label: "PayPal",
    shortLabel: "PP",
    color: "#ffffff",
    background: "#0070ba",
    brandIcon: "paypal",
    category: "Subscription",
  },
  {
    key: "netflix",
    label: "Netflix",
    shortLabel: "N",
    color: "#ffffff",
    background: "#e50914",
    brandIcon: "netflix",
    category: "Subscription",
  },
  {
    key: "github",
    label: "GitHub",
    shortLabel: "GH",
    color: "#ffffff",
    background: "#24292f",
    brandIcon: "github",
    category: "Software",
  },
  {
    key: "google",
    label: "Google",
    shortLabel: "G",
    color: "#ffffff",
    background: "#4285f4",
    brandIcon: "google",
    category: "Subscription",
  },
  {
    key: "microsoft",
    label: "Microsoft",
    shortLabel: "MS",
    color: "#ffffff",
    background: "#5e5e5e",
    category: "Software",
  },
  {
    key: "aws",
    label: "AWS",
    shortLabel: "AWS",
    color: "#111827",
    background: "#ff9900",
    category: "VPS",
  },
  {
    key: "docker",
    label: "Docker",
    shortLabel: "DK",
    color: "#ffffff",
    background: "#2496ed",
    brandIcon: "docker",
    category: "Software",
  },
  {
    key: "notion",
    label: "Notion",
    shortLabel: "NO",
    color: "#ffffff",
    background: "#000000",
    brandIcon: "notion",
    category: "Software",
  },
  {
    key: "spotify",
    label: "Spotify",
    shortLabel: "SP",
    color: "#ffffff",
    background: "#1db954",
    brandIcon: "spotify",
    category: "Subscription",
  },
  {
    key: "youtube",
    label: "YouTube",
    shortLabel: "YT",
    color: "#ffffff",
    background: "#ff0000",
    brandIcon: "youtube",
    category: "Subscription",
  },
  {
    key: "discord",
    label: "Discord",
    shortLabel: "DC",
    color: "#ffffff",
    background: "#5865f2",
    brandIcon: "discord",
    category: "Subscription",
  },
  {
    key: "telegram",
    label: "Telegram",
    shortLabel: "TG",
    color: "#ffffff",
    background: "#26a5e4",
    brandIcon: "telegram",
    category: "Software",
  },
  {
    key: "slack",
    label: "Slack",
    shortLabel: "SL",
    color: "#ffffff",
    background: "#4a154b",
    brandIcon: "slack",
    category: "Software",
  },
  {
    key: "dropbox",
    label: "Dropbox",
    shortLabel: "DB",
    color: "#ffffff",
    background: "#0061ff",
    brandIcon: "dropbox",
    category: "Software",
  },
  {
    key: "digitalocean",
    label: "DigitalOcean",
    shortLabel: "DO",
    color: "#ffffff",
    background: "#0080ff",
    brandIcon: "digitalocean",
    category: "VPS",
  },
  {
    key: "googlecloud",
    label: "Google Cloud",
    shortLabel: "GC",
    color: "#ffffff",
    background: "#4285f4",
    brandIcon: "googlecloud",
    category: "VPS",
  },
  {
    key: "alibabacloud",
    label: "Alibaba Cloud",
    shortLabel: "AC",
    color: "#ffffff",
    background: "#ff6a00",
    brandIcon: "alibabacloud",
    category: "VPS",
  },
  {
    key: "upcloud",
    label: "UpCloud",
    shortLabel: "UC",
    color: "#ffffff",
    background: "#7b00ff",
    brandIcon: "upcloud",
    category: "VPS",
  },
  {
    key: "nextcloud",
    label: "Nextcloud",
    shortLabel: "NC",
    color: "#ffffff",
    background: "#0082c9",
    brandIcon: "nextcloud",
    category: "Software",
  },
  {
    key: "owncloud",
    label: "ownCloud",
    shortLabel: "OC",
    color: "#ffffff",
    background: "#041e42",
    brandIcon: "owncloud",
    category: "Software",
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    shortLabel: "SC",
    color: "#ffffff",
    background: "#ff5500",
    brandIcon: "soundcloud",
    category: "Subscription",
  },
  {
    key: "vercel",
    label: "Vercel",
    shortLabel: "VC",
    color: "#ffffff",
    background: "#000000",
    brandIcon: "vercel",
    category: "VPS",
  },
  {
    key: "netlify",
    label: "Netlify",
    shortLabel: "NL",
    color: "#ffffff",
    background: "#00c7b7",
    brandIcon: "netlify",
    category: "VPS",
  },
  {
    key: "heroku",
    label: "Heroku",
    shortLabel: "HK",
    color: "#ffffff",
    background: "#430098",
    brandIcon: "heroku",
    category: "VPS",
  },
  {
    key: "vultr",
    label: "Vultr",
    shortLabel: "VU",
    color: "#ffffff",
    background: "#007bfc",
    brandIcon: "vultr",
    category: "VPS",
  },
  {
    key: "firebase",
    label: "Firebase",
    shortLabel: "FB",
    color: "#111827",
    background: "#ffca28",
    brandIcon: "firebase",
    category: "Software",
  },
  {
    key: "supabase",
    label: "Supabase",
    shortLabel: "SB",
    color: "#ffffff",
    background: "#3ecf8e",
    brandIcon: "supabase",
    category: "Software",
  },
  {
    key: "stripe",
    label: "Stripe",
    shortLabel: "ST",
    color: "#ffffff",
    background: "#635bff",
    brandIcon: "stripe",
    category: "Subscription",
  },
  {
    key: "patreon",
    label: "Patreon",
    shortLabel: "PT",
    color: "#ffffff",
    background: "#ff424d",
    brandIcon: "patreon",
    category: "Subscription",
  },
  {
    key: "steam",
    label: "Steam",
    shortLabel: "ST",
    color: "#ffffff",
    background: "#171a21",
    brandIcon: "steam",
    category: "Game",
  },
  {
    key: "twitch",
    label: "Twitch",
    shortLabel: "TW",
    color: "#ffffff",
    background: "#9146ff",
    brandIcon: "twitch",
    category: "Subscription",
  },
  {
    key: "figma",
    label: "Figma",
    shortLabel: "FG",
    color: "#ffffff",
    background: "#a259ff",
    brandIcon: "figma",
    category: "Software",
  },
  {
    key: "canva",
    label: "Canva",
    shortLabel: "CV",
    color: "#ffffff",
    background: "#00c4cc",
    brandIcon: "canva",
    category: "Software",
  },
  {
    key: "zoom",
    label: "Zoom",
    shortLabel: "ZM",
    color: "#ffffff",
    background: "#0b5cff",
    brandIcon: "zoom",
    category: "Software",
  },
  {
    key: "claude",
    label: "Claude",
    shortLabel: "CL",
    color: "#ffffff",
    background: "#d97757",
    brandIcon: "claude",
    category: "Subscription",
  },
  {
    key: "anthropic",
    label: "Anthropic",
    shortLabel: "AI",
    color: "#ffffff",
    background: "#111827",
    brandIcon: "anthropic",
    category: "Subscription",
  },
  {
    key: "obsidian",
    label: "Obsidian",
    shortLabel: "OB",
    color: "#ffffff",
    background: "#7c3aed",
    brandIcon: "obsidian",
    category: "Software",
  },
  {
    key: "proton",
    label: "Proton",
    shortLabel: "PR",
    color: "#ffffff",
    background: "#6d4aff",
    brandIcon: "proton",
    category: "Subscription",
  },
  {
    key: "namecheap",
    label: "Namecheap",
    shortLabel: "NC",
    color: "#ffffff",
    background: "#de3723",
    brandIcon: "namecheap",
    category: "Domain",
  },
  {
    key: "godaddy",
    label: "GoDaddy",
    shortLabel: "GD",
    color: "#ffffff",
    background: "#00a4a6",
    brandIcon: "godaddy",
    category: "Domain",
  },
  {
    key: "porkbun",
    label: "Porkbun",
    shortLabel: "PB",
    color: "#ffffff",
    background: "#ef7878",
    brandIcon: "porkbun",
    category: "Domain",
  },
  {
    key: "hetzner",
    label: "Hetzner",
    shortLabel: "HZ",
    color: "#ffffff",
    background: "#d50c2d",
    brandIcon: "hetzner",
    category: "VPS",
  },
  {
    key: "ubuntu",
    label: "Ubuntu",
    shortLabel: "UB",
    color: "#ffffff",
    background: "#e95420",
    brandIcon: "ubuntu",
    category: "Software",
  },
  {
    key: "debian",
    label: "Debian",
    shortLabel: "DE",
    color: "#ffffff",
    background: "#a81d33",
    brandIcon: "debian",
    category: "Software",
  },
  {
    key: "vps",
    label: "Generic VPS",
    shortLabel: "VPS",
    color: "#ffffff",
    background: "#2563eb",
    category: "VPS",
  },
  {
    key: "domain",
    label: "Generic Domain",
    shortLabel: "DNS",
    color: "#ffffff",
    background: "#7c3aed",
    category: "Domain",
  },
  {
    key: "software",
    label: "Generic Software",
    shortLabel: "APP",
    color: "#ffffff",
    background: "#0891b2",
    category: "Software",
  },
  {
    key: "subscription",
    label: "Generic Subscription",
    shortLabel: "SUB",
    color: "#ffffff",
    background: "#0f766e",
    category: "Subscription",
  },
  {
    key: "game",
    label: "Generic Game",
    shortLabel: "GM",
    color: "#ffffff",
    background: "#16a34a",
    category: "Game",
  },
  {
    key: "other",
    label: "Other",
    shortLabel: "BP",
    color: "#ffffff",
    background: "#64748b",
    category: "Other",
  },
];

const presetByKey = new Map(iconPresets.map((preset) => [preset.key, preset]));

export const getIconPreset = (key?: string) =>
  presetByKey.get(key ?? "") ?? presetByKey.get("other")!;

export const inferServiceIcon = (
  service: Pick<ServiceItem, "name" | "category">,
): ServiceIcon => {
  const name = service.name.toLowerCase();
  if (name.includes("chatgpt") || name.includes("openai")) {
    return { type: "preset", key: "openai" };
  }
  if (name.includes("dmit")) return { type: "preset", key: "dmit" };
  if (name.includes("cloudflare")) return { type: "preset", key: "cloudflare" };
  if (name.includes("icloud")) return { type: "preset", key: "icloud" };
  if (name.includes("apple music")) return { type: "preset", key: "applemusic" };
  if (name.includes("apple tv")) return { type: "preset", key: "appletv" };
  if (name.includes("apple pay")) return { type: "preset", key: "applepay" };
  if (name.includes("apple arcade")) return { type: "preset", key: "applearcade" };
  if (name.includes("apple")) return { type: "preset", key: "apple" };
  if (name.includes("minecraft")) return { type: "preset", key: "minecraft" };
  if (name.includes("paypal")) return { type: "preset", key: "paypal" };
  if (name.includes("netflix")) return { type: "preset", key: "netflix" };
  if (name.includes("github")) return { type: "preset", key: "github" };
  if (name.includes("google")) return { type: "preset", key: "google" };
  if (name.includes("microsoft") || name.includes("office")) {
    return { type: "preset", key: "microsoft" };
  }
  if (name.includes("aws") || name.includes("amazon")) {
    return { type: "preset", key: "aws" };
  }
  if (name.includes("docker")) return { type: "preset", key: "docker" };
  if (name.includes("notion")) return { type: "preset", key: "notion" };
  if (name.includes("spotify")) return { type: "preset", key: "spotify" };
  if (name.includes("youtube")) return { type: "preset", key: "youtube" };
  if (name.includes("discord")) return { type: "preset", key: "discord" };
  if (name.includes("telegram")) return { type: "preset", key: "telegram" };
  if (name.includes("slack")) return { type: "preset", key: "slack" };
  if (name.includes("dropbox")) return { type: "preset", key: "dropbox" };
  if (name.includes("digitalocean")) {
    return { type: "preset", key: "digitalocean" };
  }
  if (name.includes("google cloud") || name.includes("gcp")) {
    return { type: "preset", key: "googlecloud" };
  }
  if (name.includes("alibaba cloud") || name.includes("aliyun")) {
    return { type: "preset", key: "alibabacloud" };
  }
  if (name.includes("upcloud")) return { type: "preset", key: "upcloud" };
  if (name.includes("nextcloud")) return { type: "preset", key: "nextcloud" };
  if (name.includes("owncloud")) return { type: "preset", key: "owncloud" };
  if (name.includes("soundcloud")) return { type: "preset", key: "soundcloud" };
  if (name.includes("vercel")) return { type: "preset", key: "vercel" };
  if (name.includes("netlify")) return { type: "preset", key: "netlify" };
  if (name.includes("heroku")) return { type: "preset", key: "heroku" };
  if (name.includes("vultr")) return { type: "preset", key: "vultr" };
  if (name.includes("firebase")) return { type: "preset", key: "firebase" };
  if (name.includes("supabase")) return { type: "preset", key: "supabase" };
  if (name.includes("stripe")) return { type: "preset", key: "stripe" };
  if (name.includes("patreon")) return { type: "preset", key: "patreon" };
  if (name.includes("steam")) return { type: "preset", key: "steam" };
  if (name.includes("twitch")) return { type: "preset", key: "twitch" };
  if (name.includes("figma")) return { type: "preset", key: "figma" };
  if (name.includes("canva")) return { type: "preset", key: "canva" };
  if (name.includes("zoom")) return { type: "preset", key: "zoom" };
  if (name.includes("claude")) return { type: "preset", key: "claude" };
  if (name.includes("anthropic")) return { type: "preset", key: "anthropic" };
  if (name.includes("obsidian")) return { type: "preset", key: "obsidian" };
  if (name.includes("proton")) return { type: "preset", key: "proton" };
  if (name.includes("namecheap")) return { type: "preset", key: "namecheap" };
  if (name.includes("godaddy") || name.includes("go daddy")) {
    return { type: "preset", key: "godaddy" };
  }
  if (name.includes("porkbun")) return { type: "preset", key: "porkbun" };
  if (name.includes("hetzner")) return { type: "preset", key: "hetzner" };
  if (name.includes("ubuntu")) return { type: "preset", key: "ubuntu" };
  if (name.includes("debian")) return { type: "preset", key: "debian" };

  const byCategory: Record<ServiceCategory, string> = {
    VPS: "vps",
    Domain: "domain",
    Subscription: "subscription",
    Software: "software",
    Game: "game",
    Other: "other",
  };

  return { type: "preset", key: byCategory[service.category] };
};
