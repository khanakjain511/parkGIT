"use client";

import { m } from "motion/react";
import { fadeTransition } from "@/lib/motion";
import { CandyButton } from "./motion";

import { useState } from "react";
import {
  assessTrust,
  classify,
  crops,
  degradation,
  scenarios,
  type Crop,
  type Readings,
  type Scenario,
  type Shipment,
} from "@/lib/auditor";
import { Icon } from "./icon";
import { ThermalChart } from "./charts";
import { Badge, Panel } from "./ui";

const vectors: Record<Scenario, Readings> = {
  S1: {
    pulp: 12.4,
    supply: 9.8,
    returnAir: 12.1,
    current: 7.4,
    originPulp: 12,
    doorMinutes: 0,
    coolingCommand: true,
    shortCycling: false,
    lockedRotor: false,
  },
  S2: {
    pulp: 24.1,
    supply: 8,
    returnAir: 20,
    current: 28,
    originPulp: 26,
    doorMinutes: 0,
    coolingCommand: true,
    shortCycling: false,
    lockedRotor: false,
  },
  S3: {
    pulp: 19,
    supply: 19,
    returnAir: 19,
    current: 0,
    originPulp: 12,
    doorMinutes: 0,
    coolingCommand: false,
    shortCycling: false,
    lockedRotor: false,
  },
  S4: {
    pulp: 21,
    supply: 8,
    returnAir: 10,
    current: 7,
    originPulp: 12,
    doorMinutes: 0,
    coolingCommand: true,
    shortCycling: true,
    lockedRotor: false,
  },
  S5: {
    pulp: 17,
    supply: 11,
    returnAir: 17,
    current: 8,
    originPulp: 12,
    doorMinutes: 22,
    coolingCommand: true,
    shortCycling: false,
    lockedRotor: false,
  },
  S6: {
    pulp: 20,
    supply: 19,
    returnAir: 20,
    current: 0,
    originPulp: 12,
    doorMinutes: 0,
    coolingCommand: true,
    shortCycling: false,
    lockedRotor: false,
  },
};
export function Monitoring({
  shipments,
  diagnostics = false,
  onQueue,
  initialId,
}: {
  initialId?: string;
  shipments: Shipment[];
  diagnostics?: boolean;
  onQueue: (id: string) => void;
}) {
  const [selected, setSelected] = useState(initialId ?? shipments[0].id);
  const [period, setPeriod] = useState("12 hours");
  const [scenario, setScenario] = useState<Scenario>("S1");
  const [tamper, setTamper] = useState(false);
  const [crop, setCrop] = useState<Crop>("Tomato");
  const [temperature, setTemperature] = useState(20);
  const [hours, setHours] = useState(6);
  const shipment = shipments.find((s) => s.id === selected) ?? shipments[0];
  const currentScenario = diagnostics ? scenario : (shipment.scenario ?? "S1");
  const base = vectors[currentScenario];
  const readings = diagnostics
    ? base
    : {
        ...base,
        pulp: shipment.temperature,
        ...(currentScenario === "S1"
          ? {
              supply: shipment.temperature - 2.6,
              returnAir: shipment.temperature - 0.3,
              originPulp: shipment.temperature,
            }
          : {}),
      };
  const result = classify(readings, diagnostics ? "Tomato" : shipment.crop);
  const loss = degradation(crop, temperature, hours);
  const trust = assessTrust(
    { ...readings, pulp: tamper ? 2 : readings.pulp },
    tamper ? 24 : null,
  );
  if (!diagnostics && shipment.scenario === null)
    return (
      <Panel title="Awaiting six-channel telemetry">
        <p className="p-5 text-sm leading-6 text-muted">
          {shipment.id} has an origin record. A complete sensor history is
          required before thermal classification. No compliant status has been
          inferred.
        </p>
        <select
          className="input m-5 max-w-xs"
          aria-label="Select monitored shipment"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {shipments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} · {s.crop}
            </option>
          ))}
        </select>
      </Panel>
    );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {diagnostics
            ? "Transparent rules. Traceable causes. Human-reviewed outcomes."
            : "Inspect the six channels that tell the full story of a shipment."}
        </p>
        <select
          className="input w-auto!"
          aria-label="Select monitored shipment"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {shipments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} · {s.crop}
            </option>
          ))}
        </select>
      </div>
      {diagnostics && (
        <Panel
          title="Fault-injection workbench"
          subtitle="Select a simulated scenario to inspect the deterministic truth table"
        >
          <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-3">
            {(
              Object.entries(scenarios) as [Scenario, typeof scenarios.S1][]
            ).map(([code, s]) => (
              <CandyButton
                key={code}
                onClick={() => {
                  setScenario(code);
                  setTamper(false);
                }}
                className={`scenario-button ${scenario === code ? "selected" : ""}`}
                animate={{
                  backgroundColor:
                    scenario === code ? "var(--soft)" : "var(--panel)",
                  borderColor:
                    scenario === code ? "var(--accent-line)" : "var(--line)",
                }}
                transition={fadeTransition}
              >
                <span>{code}</span>
                <strong>{s.name}</strong>
                <small>{s.party}</small>
              </CandyButton>
            ))}
          </div>
        </Panel>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {[
          [
            "Pulp temperature",
            `${tamper ? 2 : readings.pulp}°C`,
            "thermometer",
          ],
          ["Supply air", `${readings.supply}°C`, "thermometer"],
          ["Return air", `${readings.returnAir}°C`, "thermometer"],
          ["Compressor current", `${readings.current} A`, "activity"],
          ["Ignition voltage", "13.8 V", "cpu"],
          ["Cargo door", readings.doorMinutes ? "Open" : "Closed", "lock"],
        ].map(([label, value, icon]) => (
          <div className="panel p-4" key={label}>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px]">{label}</span>
              <Icon name={icon} size={14} />
            </div>
            <strong className="mt-4 block text-2xl font-medium">{value}</strong>
            <span className="mt-2 block text-[10px] text-muted">
              Simulated · 60s cadence
            </span>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title={
            diagnostics
              ? "Diagnostic sensor profile"
              : "Tri-probe temperature history"
          }
          subtitle="Illustrative trace · core thermal mass separates air spikes from cargo exposure"
          action={
            <select
              className="select-small"
              aria-label="Monitoring chart time range"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {["6 hours", "12 hours", "24 hours"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          }
        >
          <ThermalChart
            period={period}
            temperature={readings.pulp}
            supply={readings.supply}
            returnAir={readings.returnAir}
            crop={diagnostics ? "Tomato" : shipment.crop}
          />
        </Panel>
        <Panel
          title="Diagnostic recommendation"
          action={
            <Badge
              tone={
                tamper ? "red" : currentScenario === "S1" ? "green" : "amber"
              }
            >
              {tamper ? "LOW TRUST" : (result ?? "Unclassified")}
            </Badge>
          }
        >
          <div className="space-y-4 px-5 pb-5">
            <h3 className="text-xl font-semibold">
              {tamper
                ? "Potential ice-pack spoof"
                : scenarios[currentScenario].name}
            </h3>
            <p className="text-sm leading-6 text-muted">
              {tamper
                ? "Pulp reading drops to 2°C while supply and return remain warm. Cross-probe disagreement requires human arbitration. Automatic settlement is blocked."
                : scenarios[currentScenario].description}
            </p>
            <div className="rounded-lg bg-surface p-3 text-xs">
              <span className="text-muted">Liability recommendation</span>
              <strong className="mt-1 block">
                {tamper
                  ? "Hold for independent review"
                  : scenarios[currentScenario].party}
              </strong>
            </div>
            <p className="text-[11px] leading-5 text-muted">
              Advisory classification. Field accuracy and actual causation
              require a validated sensor history.
            </p>
            <CandyButton
              className="button-primary w-full"
              onClick={() => onQueue(shipment.id)}
            >
              <Icon name="file" size={16} />
              Add to arbitration queue
            </CandyButton>
          </div>
        </Panel>
      </div>
      {diagnostics && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel
            title="Bio-kinetic shelf-life calculator"
            subtitle="Q₁₀ advisory range · crop-specific temperature bands"
          >
            <div className="space-y-4 p-5 pt-1">
              <div className="grid grid-cols-3 gap-3">
                <label className="field-label">
                  Crop
                  <select
                    className="input"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value as Crop)}
                  >
                    {Object.keys(crops).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="field-label">
                  Pulp temperature (°C)
                  <input
                    className="input"
                    type="number"
                    min="-20"
                    max="60"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                </label>
                <label className="field-label">
                  Exposure (hours)
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="720"
                    value={hours}
                    onChange={(e) =>
                      setHours(Math.max(0, Number(e.target.value)))
                    }
                  />
                </label>
              </div>
              <div className="rounded-xl bg-surface p-5">
                <p className="text-xs text-muted">
                  ESTIMATED SHELF LIFE CONSUMED
                </p>
                <div className="mt-2 text-3xl font-semibold text-green">
                  {loss.low.toFixed(1)}–{loss.high.toFixed(1)}
                  <span className="text-lg">%</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Target band: {crops[crop].min}–{crops[crop].max}°C · Q₁₀:
                  1.5–3.0
                </p>
              </div>
              {loss.chilling && (
                <p className="rounded-lg bg-warning-soft p-3 text-xs text-amber">
                  Below the crop minimum. Chilling injury is not quantified by
                  Q₁₀; expert review is required.
                </p>
              )}
              <p className="text-[11px] leading-5 text-muted">
                Assumes constant pulp temperature, a reference shelf life of{" "}
                {crops[crop].life} hours at {crops[crop].max}°C, and no
                non-thermal damage. These are uncalibrated demo parameters; this
                range is not a quality verdict.
              </p>
            </div>
          </Panel>
          <Panel
            title="Trust & anti-tamper simulation"
            subtitle="Cross-probe disagreement should never release funds"
          >
            <div className="space-y-5 p-5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Oracle trust score</span>
                <strong
                  className={`text-3xl ${tamper ? "text-red" : "text-green"}`}
                >
                  {Math.round(trust.score * 100)}
                  <span className="text-base">/100</span>
                </strong>
              </div>
              <div className="progress-track">
                <m.div
                  style={{ originX: 0, width: "100%" }}
                  animate={{
                    scaleX: trust.score,
                    backgroundColor: tamper ? "var(--danger)" : "var(--green)",
                  }}
                />
              </div>
              <div className="space-y-3 text-xs">
                {[
                  "Probe reliability",
                  "Cross-probe consistency",
                  "Historical continuity",
                ].map((p, i) => (
                  <div className="flex justify-between" key={p}>
                    <span className="text-muted">{p}</span>
                    <span>
                      {tamper && i === 1 ? "Divergence detected" : "Nominal"}
                    </span>
                  </div>
                ))}
              </div>
              <CandyButton
                className="button-secondary w-full"
                onClick={() => setTamper(!tamper)}
              >
                <Icon name={tamper ? "check" : "alert"} size={16} />
                {tamper
                  ? "Restore normal probe readings"
                  : "Simulate ice-pack tampering"}
              </CandyButton>
              <p className="text-[11px] leading-5 text-muted">
                Demonstration of a trust gate, not validated DTW-OC firmware. A
                low-trust record is always held for human review.
              </p>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
