const base = { width: 36, height: 36, fill: "none", stroke: "#915EFF", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export const HeadsetIcon = () => (
  <svg {...base} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 10c0-3.3 4.5-5 10-5s10 1.7 10 5v4c0 2-1.5 3.5-3.5 3.5h-1c-1 0-1.8-.5-2.5-1.5l-1.2-1.7a2.2 2.2 0 0 0-3.6 0L9 16c-.7 1-1.5 1.5-2.5 1.5h-1C3.5 17.5 2 16 2 14v-4Z" />
    <circle cx="7.5" cy="12" r="1" fill="#915EFF" stroke="none" />
    <circle cx="16.5" cy="12" r="1" fill="#915EFF" stroke="none" />
  </svg>
);

export const GamepadIcon = () => (
  <svg {...base} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 9h12a4 4 0 0 1 4 4l-1 5a2.5 2.5 0 0 1-4.3 1.2L14.5 17h-5l-2.2 2.2A2.5 2.5 0 0 1 3 18l-1-5a4 4 0 0 1 4-4Z" />
    <path d="M8 12v3M6.5 13.5h3" />
    <circle cx="16" cy="12.5" r="0.9" fill="#915EFF" stroke="none" />
    <circle cx="18.5" cy="14.5" r="0.9" fill="#915EFF" stroke="none" />
  </svg>
);

export const ChipIcon = () => (
  <svg {...base} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="10" y="10" width="4" height="4" rx="1" fill="#915EFF" stroke="none" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
);

export const GlobeIcon = () => (
  <svg {...base} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
  </svg>
);

const linkBase = { width: 22, height: 22, fill: "#aaa6c3", "aria-hidden": true };

export const MailIcon = () => (
  <svg {...linkBase} viewBox="0 0 24 24" fill="none" stroke="#aaa6c3" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const LinkedInIcon = () => (
  <svg {...linkBase} viewBox="0 0 24 24">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

export const GitHubIcon = () => (
  <svg {...linkBase} viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

export const MediumIcon = () => (
  <svg {...linkBase} viewBox="0 0 24 24">
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z" />
  </svg>
);

export const XIcon = () => (
  <svg {...linkBase} viewBox="0 0 24 24">
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4Z" />
  </svg>
);
