import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type ToggleIconProps = IconProps & {
  filled?: boolean;
};

export function HeartIcon({ filled = false, ...props }: ToggleIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 20.4 4.95 13.7a4.9 4.9 0 0 1 6.93-6.93L12 7.9l.12-.12a4.9 4.9 0 0 1 6.93 6.93L12 20.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function BookmarkIcon({ filled = false, ...props }: ToggleIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M6.5 4.75h11a1 1 0 0 1 1 1v13.5l-6.5-3.9-6.5 3.9V5.75a1 1 0 0 1 1-1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M15.5 8.25 20 12m0 0-4.5 3.75M20 12H9.75a4.75 4.75 0 1 0 0 9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M8.5 6.75v10.5L17.25 12 8.5 6.75Z" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M2.75 12s3.25-6 9.25-6 9.25 6 9.25 6-3.25 6-9.25 6-9.25-6-9.25-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M4.75 10.75 12 4.75l7.25 6v8a1 1 0 0 1-1 1h-4.5v-5h-3.5v5h-4.5a1 1 0 0 1-1-1v-8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M6.25 5.25h10.5a1 1 0 0 1 1 1v11.5a1 1 0 0 1-1 1H6.25a1 1 0 0 1-1-1V6.25a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8.75 9h6.5M8.75 12h6.5M8.75 15h4.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

export function ReelsIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M5.25 6.25h13.5a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H5.25a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="m9 6.25 3 4M14.25 6.25l3 4M4.25 10.25h15.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

export function CreatorIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="8.25" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="5.25" y="7.25" width="13.5" height="11.5" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3.75v3.5M8.75 12h.01M15.25 12h.01M9 15.75h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      <circle cx="8.75" cy="12" r="0.75" fill="currentColor" />
      <circle cx="15.25" cy="12" r="0.75" fill="currentColor" />
    </svg>
  );
}
