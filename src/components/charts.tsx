"use client";

import { m, useReducedMotion } from "motion/react";
import { fadeTransition } from "@/lib/motion";
import { crops, type Crop } from "@/lib/auditor";

export function Sparkline({
  variant = 0,
  color = "var(--green)",
}: {
  variant?: number;
  color?: string;
}) {
  const values = [
    "0,37 13,33 23,37 36,23 47,29 59,20 71,24 84,11 96,15 109,4 123,8",
    "0,28 14,30 25,19 38,25 50,10 63,15 76,8 88,20 99,13 112,17 123,4",
    "0,35 12,30 25,31 38,25 50,29 63,17 75,19 87,10 99,13 111,4 123,6",
    "0,18 15,20 28,16 40,22 51,12 65,17 77,11 89,14 102,6 113,9 123,4",
  ];
  return (
    <svg className="sparkline" viewBox="0 0 124 44" aria-hidden="true">
      <polyline
        points={values[variant % 4]}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="123" cy={variant % 2 ? 4 : 8} r="3" fill={color} />
    </svg>
  );
}
export function ThermalChart({
  period = "12 hours",
  compact = false,
  temperature = 12.4,
  crop = "Tomato",
  supply = 9.8,
  returnAir = 12.1,
}: {
  period?: string;
  compact?: boolean;
  temperature?: number;
  crop?: Crop;
  supply?: number;
  returnAir?: number;
}) {
  const reduced = useReducedMotion();
  const band = crops[crop];
  const top = Math.max(band.max + 3, temperature + 2, returnAir + 2);
  const bottom = Math.min(band.min - 3, supply - 2);
  const y = (value: number) => 24 + ((top - value) / (top - bottom)) * 145;
  const offset = period === "24 hours" ? 1 : period === "6 hours" ? -1 : 0;
  const points = (value: number, amplitude: number) =>
    Array.from(
      { length: 45 },
      (_, i) =>
        `${48 + i * 13.5},${y(value) + Math.sin(i * 0.75 + offset) * amplitude + Math.cos(i * 1.8) * 1.2}`,
    ).join(" ");
  return (
    <div className="thermal-chart">
      <svg
        viewBox="0 0 680 220"
        role="img"
        aria-label={`Illustrative tri-probe temperature chart over ${period}. Pulp ${temperature} degrees, supply ${supply} degrees and return ${returnAir} degrees. ${crop} target ${band.min} to ${band.max} degrees.`}
        className={compact ? "max-h-48" : ""}
      >
        <rect
          x="47"
          y={y(band.max)}
          width="601"
          height={y(band.min) - y(band.max)}
          fill="var(--soft)"
        />
        <text x="535" y={y(band.max) + 12} fill="var(--muted)" fontSize="9">
          {band.min}–{band.max}°C TARGET BAND
        </text>
        {[0, 1, 2, 3].map((i) => {
          const value = top - (i * (top - bottom)) / 3;
          return (
            <g key={i}>
              <line
                x1="47"
                x2="649"
                y1={y(value)}
                y2={y(value)}
                stroke="var(--line)"
                strokeDasharray="3 4"
              />
              <text x="7" y={y(value) + 4} fill="var(--muted)" fontSize="10">
                {value.toFixed(0)}°
              </text>
            </g>
          );
        })}
        <m.polyline
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          points={points(temperature, 4)}
          animate={{
            points: points(temperature, 4),
            pathLength: 1,
            opacity: 1,
          }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  points: { ...fadeTransition, duration: 0.35 },
                  pathLength: { duration: 0.7, ease: "easeOut" },
                  opacity: fadeTransition,
                }
          }
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
        />
        <m.polyline
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          points={points(returnAir, 6)}
          animate={{ points: points(returnAir, 6), pathLength: 1, opacity: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  points: { ...fadeTransition, duration: 0.35 },
                  pathLength: { duration: 0.7, ease: "easeOut" },
                  opacity: fadeTransition,
                }
          }
          fill="none"
          stroke="var(--chart-return)"
          strokeWidth="1.8"
        />
        <m.polyline
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          points={points(supply, 9)}
          animate={{ points: points(supply, 9), pathLength: 1, opacity: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  points: { ...fadeTransition, duration: 0.35 },
                  pathLength: { duration: 0.7, ease: "easeOut" },
                  opacity: fadeTransition,
                }
          }
          fill="none"
          stroke="var(--chart-supply)"
          strokeWidth="1.8"
        />
        {Array.from({ length: 6 }, (_, i) => {
          const end = 18;
          const span = Number(period.split(" ")[0]);
          const hour = (end - span + (i * span) / 5 + 24) % 24;
          return (
            <text
              key={i}
              x={47 + i * 116}
              y="198"
              fill="var(--muted)"
              fontSize="10"
            >
              {String(Math.floor(hour)).padStart(2, "0")}:
              {String(Math.round((hour % 1) * 60)).padStart(2, "0")}
            </text>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-muted">
        <span className="legend-dot before:bg-green">Pulp temperature</span>
        <span className="legend-dot before:bg-[var(--chart-supply)]">
          Supply air
        </span>
        <span className="legend-dot before:bg-[var(--chart-return)]">
          Return air
        </span>
      </div>
    </div>
  );
}
export function HealthGauge({ score = 98 }: { score?: number }) {
  const reduced = useReducedMotion();
  const arcLength = Math.PI * 92;
  return (
    <div className="gauge">
      <svg
        viewBox="0 0 240 145"
        role="img"
        aria-label={`Fleet trust score ${score} out of 100`}
      >
        <path
          d="M28 116a92 92 0 0 1 184 0"
          fill="none"
          stroke="var(--soft)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <m.path
          initial={reduced ? false : { strokeDasharray: `0 ${arcLength}` }}
          animate={{
            strokeDasharray: `${(score / 100) * arcLength} ${arcLength}`,
          }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
          }
          d="M28 116a92 92 0 0 1 184 0"
          fill="none"
          stroke="var(--green)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <text
          x="120"
          y="102"
          textAnchor="middle"
          fontSize="40"
          fontWeight="600"
          fill="var(--ink)"
        >
          {score}
          <tspan fontSize="22">%</tspan>
        </text>
        <text
          x="120"
          y="127"
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted)"
        >
          Fleet trust score
        </text>
      </svg>
    </div>
  );
}
