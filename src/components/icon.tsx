import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5",
  moon: "M20.5 13A8.7 8.7 0 0 1 11 3.5 8.7 8.7 0 1 0 20.5 13Z",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  truck:
    "M3 6h11v11H3z M14 10h4l3 4v3h-7 M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M17 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
  activity: "M2 12h4l3-8 5 16 3-8h5",
  shield: "M12 3l8 3v6c0 5-8 9-8 9S4 17 4 12V6z M8 12l3 3 5-6",
  wallet: "M4 5h15v15H4z M4 5V3h13 M15 11h6v5h-6z",
  file: "M5 3h9l5 5v13H5z M14 3v6h5 M8 13h8 M8 17h6",
  cpu: "M6 6h12v12H6z M9 9h6v6H9z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
  search: "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15 M16 16l5 5",
  bell: "M5 17h14l-2-4V8a5 5 0 0 0-10 0v5z M10 21h4",
  arrow: "M5 19L19 5 M5 5h14v14",
  chevron: "M9 5l7 7-7 7",
  plus: "M12 5v14 M5 12h14",
  download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  check: "M5 12l4 4L19 6",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
  thermometer: "M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0 M12 8v9",
  leaf: "M20 3C10 2 3 7 5 15s15 7 15-12z M5 20L16 9",
  help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5 M12 17v1",
  logout: "M10 4H4v16h6 M9 12h12 M17 8l4 4-4 4",
  close: "M5 5l14 14 M5 19L19 5",
  calendar: "M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16",
  pin: "M12 22s8-8 8-14a8 8 0 0 0-16 0c0 6 8 14 8 14 M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  alert: "M12 3l10 18H2z M12 9v5 M12 17v1",
  lock: "M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4",
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.grid} />
    </svg>
  );
}
