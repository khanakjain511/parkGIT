"use client";

import { CandyButton } from "./motion";

import { useState } from "react";
import { type Shipment, crops, rupees } from "@/lib/auditor";
import { exportCertificate, exportEvidence, download } from "@/lib/workspace";
import { alerts } from "./overview";
import { Badge, Empty, Panel } from "./ui";
import { Icon } from "./icon";

export function Evidence({
  shipments,
  queue,
  notify,
}: {
  shipments: Shipment[];
  queue: string[];
  notify: (s: string) => void;
}) {
  const [busy, setBusy] = useState("");
  async function generate(s: Shipment, pdf: boolean) {
    setBusy(s.id);
    try {
      if (pdf) await exportCertificate(s);
      else await exportEvidence(s);
      notify(
        pdf
          ? "Draft PDF certificate downloaded. Custodian and expert signatures are required."
          : "Evidence JSON downloaded with a SHA-256 digest of its exact payload.",
      );
    } catch {
      notify("The export could not be generated. Please try again.");
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-5">
      <div className="notice">
        <Icon name="file" size={19} />
        <div>
          <strong>An evidence record all parties can inspect.</strong>
          <p>
            Draft certificates include Part A, Part B, IST timestamps, device
            ID, and a SHA-256 payload hash. Legal review and signatures remain
            required.
          </p>
        </div>
      </div>
      <Panel
        title="Shipment evidence library"
        subtitle="Download the underlying record or prepare a certificate draft"
        action={<Badge tone="neutral">{shipments.length} records</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="shipment-table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Chain of custody</th>
                <th>Review status</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong className="text-xs">{s.id}</strong>
                    <span className="mt-1 block text-[11px] text-muted">
                      {s.crop} · {s.vehicle}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs">
                      {s.origin} → {s.destination}
                    </span>
                    <span className="mt-1 block text-[10px] text-muted">
                      Origin → carrier → receiver
                    </span>
                  </td>
                  <td>
                    <Badge tone={queue.includes(s.id) ? "amber" : "neutral"}>
                      {queue.includes(s.id)
                        ? "Review queued"
                        : "Draft · unsigned"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <CandyButton
                        className="button-secondary button-small"
                        disabled={busy === s.id}
                        onClick={() => generate(s, false)}
                      >
                        JSON <Icon name="download" size={13} />
                      </CandyButton>
                      <CandyButton
                        className="button-secondary button-small"
                        disabled={busy === s.id}
                        onClick={() => generate(s, true)}
                      >
                        PDF draft <Icon name="download" size={13} />
                      </CandyButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [
            "1",
            "Custodian record",
            "Origin, parties, vehicle, device, and record provenance.",
          ],
          [
            "2",
            "Expert review",
            "Digest verification, diagnostic assumptions, and independent sign-off.",
          ],
          [
            "3",
            "Reproducible evidence",
            "An exported payload and matching SHA-256 digest, with no fabricated hardware signature.",
          ],
        ].map(([n, title, detail]) => (
          <div className="panel p-5" key={n}>
            <span className="step-circle">{n}</span>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
          </div>
        ))}
      </div>
      <CandyButton
        className="button-secondary"
        onClick={() => {
          const csv =
            "Shipment,Crop,Origin,Destination,Status,Pulp C,Scenario,Trust,Invoice INR\n" +
            shipments
              .map((s) =>
                [
                  s.id,
                  s.crop,
                  s.origin,
                  s.destination,
                  s.status,
                  s.temperature,
                  s.scenario,
                  s.trust,
                  s.value,
                ]
                  .map((v) => `"${String(v).replaceAll('"', '""')}"`)
                  .join(","),
              )
              .join("\n");
          download(
            "shipment-audit-register.csv",
            csv,
            "text/csv;charset=utf-8",
          );
          notify("Audit register exported.");
        }}
      >
        <Icon name="download" size={16} />
        Export audit register
      </CandyButton>
    </div>
  );
}
export function Devices({
  shipments,
  notify,
}: {
  shipments: Shipment[];
  notify: (s: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="notice">
        <Icon name="cpu" size={18} />
        <div>
          <strong>Edge fleet simulator</strong>
          <p>
            Devices below are simulated. Connect ESP32 telemetry and hardware
            attestation before using field data.
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shipments.map((s, i) => (
          <Panel
            key={s.id}
            title={`PBB-EDGE-${String(i + 1).padStart(3, "0")}`}
            action={<Badge>Simulated</Badge>}
          >
            <div className="space-y-4 p-5 pt-1">
              <div className="flex gap-4">
                <div className="device-illustration">
                  <Icon name="cpu" size={35} />
                </div>
                <div>
                  <strong className="text-sm">Tri-probe black box</strong>
                  <p className="mt-2 text-xs text-muted">{s.vehicle}</p>
                  <p className="mt-1 text-[11px] text-green">
                    Assigned to {s.id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface p-3 text-xs">
                <div>
                  <span className="block text-muted">Battery</span>
                  <strong className="mt-1 block">{96 - i * 7}%</strong>
                </div>
                <div>
                  <span className="block text-muted">Local buffer</span>
                  <strong className="mt-1 block">{i * 12} / 11,000</strong>
                </div>
                <div>
                  <span className="block text-muted">Firmware</span>
                  <strong className="mt-1 block">Demo 1.0.0</strong>
                </div>
                <div>
                  <span className="block text-muted">Connectivity</span>
                  <strong className="mt-1 block">4G / GNSS</strong>
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">ATECC608A attestation</span>
                <span className="text-amber">Not connected</span>
              </div>
              <CandyButton
                className="button-secondary w-full"
                onClick={() => {
                  download(
                    `${s.id}-device-manifest.json`,
                    JSON.stringify(
                      {
                        device: `PBB-EDGE-${String(i + 1).padStart(3, "0")}`,
                        shipment: s.id,
                        channels: [
                          "T_pulp",
                          "T_supply",
                          "T_return",
                          "I_comp",
                          "V_ign",
                          "S_door",
                        ],
                        intervalSeconds: 60,
                        offlineCapacity: 11000,
                        hardwareSignature: null,
                        mode: "demo",
                      },
                      null,
                      2,
                    ),
                    "application/json",
                  );
                  notify("Device manifest exported.");
                }}
              >
                Device manifest <Icon name="download" size={14} />
              </CandyButton>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
export function Alerts({
  acknowledged,
  onAcknowledge,
  shipments,
  onSelect,
  notify,
}: {
  acknowledged: string[];
  onAcknowledge: (id: string) => void;
  shipments: Shipment[];
  onSelect: (s: Shipment) => void;
  notify: (s: string) => void;
}) {
  const [filter, setFilter] = useState("Open");
  const filtered = alerts.filter(
    (a) =>
      filter === "All" ||
      (filter === "Reviewed"
        ? acknowledged.includes(a.id)
        : !acknowledged.includes(a.id)),
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Early intervention protects cargo and the people transporting it.
        </p>
        <select
          className="select-small"
          aria-label="Alert status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>Open</option>
          <option>Reviewed</option>
          <option>All</option>
        </select>
      </div>
      <Panel
        title="Intervention inbox"
        action={
          <Badge tone="amber">{alerts.length - acknowledged.length} open</Badge>
        }
      >
        {filtered.length ? (
          <div className="divide-y divide-line">
            {filtered.map((a) => (
              <div className="flex flex-wrap items-center gap-4 p-5" key={a.id}>
                <span className={`alert-icon tone-${a.tone}`}>
                  <Icon name={a.icon} size={20} />
                </span>
                <div className="min-w-48 flex-1">
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  <p className="mt-1 text-xs text-muted">{a.detail}</p>
                  <p className="mt-2 text-[10px] text-muted">
                    {a.time} · Demo event
                  </p>
                </div>
                <CandyButton
                  className="button-secondary button-small"
                  onClick={() =>
                    onSelect(
                      shipments.find(
                        (s) =>
                          s.id ===
                          ["PB-0942", "PB-0945", "PB-0944"][alerts.indexOf(a)],
                      ) ?? shipments[0],
                    )
                  }
                >
                  Inspect <Icon name="chevron" size={13} />
                </CandyButton>
                <CandyButton
                  className="button-primary button-small"
                  disabled={acknowledged.includes(a.id)}
                  onClick={() => onAcknowledge(a.id)}
                >
                  {acknowledged.includes(a.id) ? "Reviewed" : "Mark reviewed"}
                </CandyButton>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Your inbox is clear"
            detail="No alerts match this filter."
          />
        )}
      </Panel>
      <Panel
        title="Driver intervention preview"
        subtitle="Regional voice and SMS workflows · provider connection pending"
      >
        <div className="grid gap-5 p-5 pt-1 md:grid-cols-2">
          <div className="rounded-xl bg-surface p-5">
            <Badge tone="amber">Cooling off for 10+ minutes</Badge>
            <h3 className="mt-4 text-lg font-semibold">
              A timely nudge. A protected bonus.
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              “Cooling is off. Restart within 15 minutes to protect your ₹2,000
              compliance bonus.”
            </p>
            <p className="mt-3 text-xs leading-6 text-green" lang="hi">
              कूलिंग बंद है। अपना ₹2,000 बोनस सुरक्षित रखने के लिए 15 मिनट में
              कूलिंग चालू करें।
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted">
              Escalation: driver voice alert → fleet dispatcher → FPO manager.
              Actual delivery requires consent and a configured messaging
              provider.
            </p>
            <label className="field-label">
              Preview language
              <select className="input">
                <option>Hindi</option>
                <option>English</option>
                <option>Punjabi</option>
                <option>Marathi</option>
                <option>Telugu</option>
              </select>
            </label>
            <CandyButton
              className="button-secondary"
              onClick={() =>
                notify(
                  "Voice / SMS provider not connected. No message was sent. The intervention above is a local preview.",
                )
              }
            >
              <Icon name="bell" size={16} />
              Check provider connection
            </CandyButton>
          </div>
        </div>
      </Panel>
    </div>
  );
}
export function DriverView({ shipments }: { shipments: Shipment[] }) {
  const [selected, setSelected] = useState(shipments[0].id);
  const s = shipments.find((s) => s.id === selected) ?? shipments[0];
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-muted">
          Your journey. Your evidence. Your right to a fair review.
        </p>
        <select
          className="select-small"
          aria-label="Driver shipment"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {shipments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.driver} · {s.id}
            </option>
          ))}
        </select>
      </div>
      <div className="driver-hero">
        <Icon name="shield" size={32} />
        <div>
          <div className="eyebrow">DRIVER SELF-VIEW</div>
          <h2 className="mt-2 text-2xl font-semibold">
            Safe travels, {s.driver.split(" ")[0]}.
          </h2>
          <p className="mt-2 text-sm">
            {s.vehicle} · {s.origin} → {s.destination}
          </p>
        </div>
        <Badge tone={s.scenario === "S1" ? "green" : "amber"}>
          {s.scenario === "S2"
            ? "Driver protected"
            : s.scenario === "S1"
              ? "Journey compliant"
              : "Review pending"}
        </Badge>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [
            "Core pulp",
            `${s.temperature}°C`,
            `Crop band ${crops[s.crop].min}–${crops[s.crop].max}°C`,
          ],
          [
            "Compliance bonus",
            "₹2,000",
            "Illustrative · subject to trip review",
          ],
          ["Cargo invoice", rupees(s.value), "No automatic driver deductions"],
        ].map(([title, value, detail]) => (
          <div className="panel p-5" key={title}>
            <p className="text-xs text-muted">{title}</p>
            <strong className="mt-4 block text-3xl font-semibold text-green">
              {value}
            </strong>
            <p className="mt-3 text-[11px] text-muted">{detail}</p>
          </div>
        ))}
      </div>
      <Panel title="Your protection at every handover">
        <div className="space-y-5 p-5 pt-1">
          {[
            [
              "Origin record",
              "Hot-loaded produce is attributed to the loading record. The driver is protected when origin evidence establishes responsibility.",
            ],
            [
              "In-transit evidence",
              "You can inspect your own telemetry. A sensor anomaly is a review signal, not an automatic accusation.",
            ],
            [
              "Arrival handover",
              "Record unloading time. After a two-hour destination wait, a reviewed geofence record may shift liability to the receiver.",
            ],
          ].map(([title, detail], i) => (
            <div className="flex gap-4" key={title}>
              <span className="step-circle">{i + 1}</span>
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
