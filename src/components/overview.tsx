"use client";

import { FieldLandscape } from "./field-landscape";
import { CandyButton } from "./motion";
import { m } from "motion/react";
import { revealVariants } from "@/lib/motion";

import { useState } from "react";
import { type Shipment, rupees } from "@/lib/auditor";
import { Icon } from "./icon";
import { Badge, Panel } from "./ui";
import { Sparkline, ThermalChart, HealthGauge } from "./charts";
import { ShipmentTable } from "./shipment-table";

export const alerts = [
  {
    id: "a1",
    title: "Cooling interruption detected",
    detail: "PB-0942 · Jalgaon → Mumbai",
    time: "12 min ago",
    tone: "red" as const,
    icon: "thermometer",
    action: "Inspect shipment",
  },
  {
    id: "a2",
    title: "Origin pre-cool gate not met",
    detail: "PB-0945 · Pulp temperature 24.1°C",
    time: "28 min ago",
    tone: "amber" as const,
    icon: "alert",
    action: "Review origin record",
  },
  {
    id: "a3",
    title: "Delivery evidence ready",
    detail: "PB-0944 · Nashik → Pune",
    time: "42 min ago",
    tone: "green" as const,
    icon: "file",
    action: "Open evidence",
  },
];
export function Overview({
  shipments,
  onSelect,
  navigate,
  onNew,
  acknowledged,
}: {
  shipments: Shipment[];
  onSelect: (s: Shipment) => void;
  navigate: (view: string) => void;
  onNew: () => void;
  acknowledged: string[];
}) {
  const [period, setPeriod] = useState("12 hours");
  const active = shipments.filter((s) => s.status !== "Delivered");
  const metrics = [
    {
      label: "Active shipments",
      value: String(active.length).padStart(2, "0"),
      detail: `Across ${new Set(active.map((s) => `${s.origin}-${s.destination}`)).size} cold-chain corridors`,
      change: "All cargo accounted for",
      icon: "truck",
    },
    {
      label: "Cargo under audit",
      value: rupees(active.reduce((n, s) => n + s.value, 0)),
      detail: "Protected by an evidence trail",
      change: "Origin to destination",
      icon: "shield",
    },
    {
      label: "Thermal compliance",
      value: `${Math.round((shipments.filter((s) => s.scenario === "S1").length / shipments.length) * 100)}%`,
      detail: "Shipments within their crop band",
      change: "Crop-specific monitoring",
      icon: "thermometer",
    },
    {
      label: "Pending reviews",
      value: String(
        shipments.filter((s) => s.scenario !== "S1").length,
      ).padStart(2, "0"),
      detail: "Human review before settlement",
      change: "No automatic deductions",
      icon: "wallet",
    },
  ];
  return (
    <>
      <m.div variants={revealVariants} className="page-intro">
        <div>
          <div className="eyebrow">YOUR COLD CHAIN, ACCOUNTED FOR</div>
          <h1>Every shipment. Every degree.</h1>
          <p>
            A clear view of your cargo, its condition, and the evidence behind
            it.
          </p>
        </div>
        <CandyButton className="button-primary" onClick={onNew}>
          <Icon name="plus" size={17} />
          New shipment
        </CandyButton>
      </m.div>
      <div className="metrics-grid">
        {metrics.map((metric, i) => (
          <m.section
            variants={revealVariants}
            className="metric"
            key={metric.label}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{metric.label}</span>
              <span className="metric-icon">
                <Icon name={metric.icon} size={17} />
              </span>
            </div>
            <div className="metric-value">{metric.value}</div>
            <p className="text-[10px] text-muted">{metric.detail}</p>
            <div className="metric-bottom">
              <span>
                <span className="mr-1.5 text-green">↗</span>
                {metric.change}
              </span>
              <Sparkline
                variant={i}
                color={i === 3 ? "var(--chart-return)" : "var(--green)"}
              />
            </div>
          </m.section>
        ))}
      </div>
      <div className="overview-columns">
        <div className="min-w-0 space-y-5">
          <m.div variants={revealVariants} className="assurance-banner">
            <div className="relative z-10">
              <span className="banner-tag">
                <Icon name="shield" size={13} />
                EVIDENCE BEFORE ASSUMPTIONS
              </span>
              <h2>
                Good produce deserves
                <br />a fair journey.
              </h2>
              <p>
                From the first pre-cool check to the final handover,
                <br className="hidden xl:block" /> protect every stakeholder
                with a verifiable record.
              </p>
              <CandyButton onClick={() => navigate("Evidence & reports")}>
                Explore the evidence trail <Icon name="arrow" size={15} />
              </CandyButton>
            </div>
            <div className="field-art" aria-hidden="true">
              <FieldLandscape />
            </div>
          </m.div>
          <Panel
            title="Cold-chain telemetry"
            subtitle="PB-0941 · Sonipat → Azadpur Mandi"
            action={
              <select
                aria-label="Telemetry time range"
                className="select-small"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {["6 hours", "12 hours", "24 hours"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            }
          >
            <div className="flex items-center justify-between px-5 pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[27px] font-semibold tracking-tight">
                  12.4
                  <span className="text-base font-normal text-muted"> °C</span>
                </span>
                <span className="text-[10px] text-muted">
                  Core pulp temperature
                </span>
              </div>
              <Badge>Within range</Badge>
            </div>
            <ThermalChart period={period} />
            <div className="chart-foot">
              <span>
                <span className="status-dot" />
                Simulated telemetry · 60s sampling
              </span>
              <CandyButton onClick={() => navigate("Live monitoring")}>
                Open monitoring <Icon name="arrow" size={12} />
              </CandyButton>
            </div>
          </Panel>
          <Panel
            title="Recent shipments"
            subtitle="Your latest cargo movements, at a glance"
            action={
              <CandyButton
                className="text-action"
                onClick={() => navigate("Shipments")}
              >
                View all <Icon name="chevron" size={14} />
              </CandyButton>
            }
          >
            <ShipmentTable
              shipments={shipments.slice(0, 4)}
              onSelect={onSelect}
            />
          </Panel>
        </div>
        <div className="min-w-0 space-y-5">
          <Panel
            title="Chain health"
            action={<span className="text-[10px] text-muted">DEMO FLEET</span>}
          >
            <HealthGauge />
            <div className="text-center">
              <span className="rounded-full bg-soft px-3 py-1.5 text-[10px] font-medium text-green">
                High-confidence records
              </span>
            </div>
            <div className="health-stats">
              <div>
                <span>Data completeness</span>
                <strong>
                  99.9<span>%</span>
                </strong>
              </div>
              <div>
                <span>Active edge devices</span>
                <strong>
                  05<span>/05</span>
                </strong>
              </div>
            </div>
            <div className="panel-note">
              <Icon name="lock" size={12} />
              Hardware attestation pending connection
            </div>
          </Panel>
          <Panel
            title="Needs your attention"
            action={
              <span className="count-badge">
                {alerts.filter((a) => !acknowledged.includes(a.id)).length}
              </span>
            }
          >
            <div className="alert-list">
              {alerts
                .filter((a) => !acknowledged.includes(a.id))
                .map((a, i) => (
                  <CandyButton
                    className="alert-row"
                    key={a.id}
                    onClick={() =>
                      onSelect(
                        shipments.find(
                          (s) =>
                            s.id ===
                            ["PB-0942", "PB-0945", "PB-0944"][
                              alerts.indexOf(a)
                            ],
                        ) ?? shipments[0],
                      )
                    }
                  >
                    <span className={`alert-icon tone-${a.tone}`}>
                      <Icon name={a.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <strong>{a.title}</strong>
                      <span>{a.detail}</span>
                      <small>{a.time}</small>
                    </span>
                    <Icon name="chevron" size={13} />
                    <span className="sr-only">
                      {i + 1}: {a.action}
                    </span>
                  </CandyButton>
                ))}
              {alerts.every((a) => acknowledged.includes(a.id)) && (
                <p className="p-5 text-sm text-muted">All alerts reviewed.</p>
              )}
            </div>
            <CandyButton
              className="panel-footer-link"
              onClick={() => navigate("Alerts & interventions")}
            >
              View all activity <Icon name="chevron" size={13} />
            </CandyButton>
          </Panel>
          <m.section variants={revealVariants} className="driver-card">
            <div className="flex items-center gap-2 text-green">
              <Icon name="shield" size={19} />
              <h2>Fair to the people who move it.</h2>
            </div>
            <p>
              Origin hot-loading? The evidence protects the driver. Every clean
              journey builds trust.
            </p>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <div>
                <span className="block text-[10px] text-muted">
                  DEMO COMPLIANCE BONUS
                </span>
                <strong className="mt-1 block text-xl text-green">
                  ₹2,000
                  <span className="ml-1 text-xs font-normal text-muted">
                    / trip
                  </span>
                </strong>
              </div>
              <CandyButton
                className="icon-button bg-panel!"
                onClick={() => navigate("Driver self-view")}
                aria-label="Open driver self-view"
              >
                <Icon name="arrow" size={18} />
              </CandyButton>
            </div>
          </m.section>
        </div>
      </div>
    </>
  );
}
