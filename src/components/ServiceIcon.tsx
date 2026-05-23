import Image from "next/image";
import clsx from "clsx";
import {
  SiAnthropic,
  SiAlibabacloud,
  SiApple,
  SiApplearcade,
  SiApplemusic,
  SiApplepay,
  SiAppletv,
  SiCanva,
  SiClaude,
  SiCloudflare,
  SiDebian,
  SiDigitalocean,
  SiDiscord,
  SiDocker,
  SiDropbox,
  SiFigma,
  SiFirebase,
  SiGithub,
  SiGodaddy,
  SiGoogle,
  SiGooglecloud,
  SiHeroku,
  SiHetzner,
  SiIcloud,
  SiNetflix,
  SiNetlify,
  SiNextcloud,
  SiNamecheap,
  SiNotion,
  SiObsidian,
  SiOpenai,
  SiOwncloud,
  SiPatreon,
  SiPaypal,
  SiPorkbun,
  SiProton,
  SiSlack,
  SiSpotify,
  SiSoundcloud,
  SiSteam,
  SiStripe,
  SiSupabase,
  SiTelegram,
  SiTwitch,
  SiUbuntu,
  SiUpcloud,
  SiVercel,
  SiVultr,
  SiYoutube,
  SiZoom,
} from "react-icons/si";
import { getIconPreset } from "@/lib/service-icons";
import type { ServiceIcon as ServiceIconType } from "@/types/billing";

type ServiceIconProps = {
  icon?: ServiceIconType;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

const iconSizes = {
  sm: 17,
  md: 21,
  lg: 25,
};

const brandIcons = {
  alibabacloud: SiAlibabacloud,
  anthropic: SiAnthropic,
  apple: SiApple,
  applearcade: SiApplearcade,
  applemusic: SiApplemusic,
  applepay: SiApplepay,
  appletv: SiAppletv,
  canva: SiCanva,
  claude: SiClaude,
  cloudflare: SiCloudflare,
  debian: SiDebian,
  digitalocean: SiDigitalocean,
  discord: SiDiscord,
  docker: SiDocker,
  dropbox: SiDropbox,
  figma: SiFigma,
  firebase: SiFirebase,
  github: SiGithub,
  godaddy: SiGodaddy,
  google: SiGoogle,
  googlecloud: SiGooglecloud,
  heroku: SiHeroku,
  hetzner: SiHetzner,
  icloud: SiIcloud,
  namecheap: SiNamecheap,
  netflix: SiNetflix,
  netlify: SiNetlify,
  nextcloud: SiNextcloud,
  notion: SiNotion,
  obsidian: SiObsidian,
  openai: SiOpenai,
  owncloud: SiOwncloud,
  patreon: SiPatreon,
  paypal: SiPaypal,
  porkbun: SiPorkbun,
  proton: SiProton,
  slack: SiSlack,
  soundcloud: SiSoundcloud,
  spotify: SiSpotify,
  steam: SiSteam,
  stripe: SiStripe,
  supabase: SiSupabase,
  telegram: SiTelegram,
  twitch: SiTwitch,
  ubuntu: SiUbuntu,
  upcloud: SiUpcloud,
  vercel: SiVercel,
  vultr: SiVultr,
  youtube: SiYoutube,
  zoom: SiZoom,
};

export function ServiceIcon({ icon, name, size = "md" }: ServiceIconProps) {
  if (icon?.type === "upload" && icon.dataUrl) {
    return (
      <span
        className={clsx(
          "inline-flex shrink-0 overflow-hidden rounded-lg border border-line bg-white",
          sizes[size],
        )}
      >
        <Image
          src={icon.dataUrl}
          alt={`${name} icon`}
          width={48}
          height={48}
          unoptimized
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  const preset = getIconPreset(icon?.type === "preset" ? icon.key : undefined);
  const BrandIcon = preset.brandIcon
    ? brandIcons[preset.brandIcon as keyof typeof brandIcons]
    : undefined;

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-bold shadow-sm ring-1 ring-black/5",
        sizes[size],
      )}
      style={{ backgroundColor: preset.background, color: preset.color }}
      aria-label={`${preset.label} icon`}
      title={preset.label}
    >
      {BrandIcon ? (
        <BrandIcon size={iconSizes[size]} aria-hidden="true" />
      ) : (
        preset.shortLabel
      )}
    </span>
  );
}
