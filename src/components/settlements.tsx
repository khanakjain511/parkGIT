"use client";

import { CandyButton } from "./motion";

import { useState } from "react";
import {
  rupees,
  insuranceRoute,
  scenarios,
  settlement,
  type Scenario,
  type Shipment,
} from "@/lib/auditor";
import { download } from "@/lib/workspace";
import { Badge, Panel } from "./ui";
import { Icon } from "./icon";

export function Settlements({
  shipments,
  queue,
  onQueue,
  notify,
}: {
  shipments: Shipment[];
  queue: string[];
  onQueue: (id: string) => void;
  notify: (message: string) => void;
}) {
  const [id, setId] = useState(shipments[1]?.id ?? shipments[0].id);
  const [breach, setBreach] = useState(12);
  const [scenario, setScenario] = useState<Scenario>("S3");
  const [lowTrust, setLowTrust] = useState(false);
  const [extremeHeat, setExtremeHeat] = useState(false);
  const [excursionHours, setExcursionHours] = useState(6);
  const [originProof, setOriginProof] = useState(false);
  const claim = insuranceRoute(excursionHours, scenario, originProof);
  const shipment = shipments.find((s) => s.id === id) ?? shipments[0];
  const result = settlement(
    shipment.value,
    18000,
    breach,
    scenario,
    lowTrust ? 0.3 : 0.98,
    extremeHeat ? 9 : 0,
  );
  return (
    <div className="space-y-5">
      <div className="notice">
        <Icon name="lock" size={18} />
        <div>
          <strong>Shadow-mode settlement</strong>
          <p>
            Recommendations only. No funds move until evidence is reviewed and a
            regulated banking partner is connected.
          </p>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          [
            "1",
            "Below 5% breach",
            "Full payout",
            "Farmer and carrier receive their full contractual amounts.",
          ],
          [
            "2",
            "5% to below 25%",
            "Pro-rata quality rebate",
            "Farmer protected. Carrier bond or insurer funding requires approval.",
          ],
          [
            "3",
            "25% breach or above",
            "Rejection & recovery",
            "Human review, insurance assessment, and salvage record required.",
          ],
        ].map(([tier, band, title, detail]) => (
          <section
            className={`tier-card ${result.tier === Number(tier) ? "tier-active" : ""}`}
            key={tier}
          >
            <span className="eyebrow">
              TIER {tier} · {band}
            </span>
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
          </section>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel
          title="Settlement calculator"
          subtitle="Transparent allocation before human approval"
        >
          <div className="space-y-4 p-5 pt-1">
            <label className="field-label">
              Shipment
              <select
                className="input"
                value={id}
                onChange={(e) => setId(e.target.value)}
              >
                {shipments.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.id} · {s.origin} → {s.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Reviewed diagnostic scenario
              <select
                className="input"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as Scenario)}
              >
                {Object.entries(scenarios).map(([code, s]) => (
                  <option key={code} value={code}>
                    {code} · {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Excess breach degradation: {breach}%
              <input
                className="mt-3 w-full accent-green"
                type="range"
                min="0"
                max="100"
                step="1"
                value={breach}
                onChange={(e) => setBreach(Number(e.target.value))}
              />
              <span className="flex justify-between text-[10px] text-muted">
                <span>0%</span>
                <span>25% rejection threshold</span>
                <span>100%</span>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-line p-3 text-xs">
              <input
                type="checkbox"
                checked={lowTrust}
                onChange={(e) => setLowTrust(e.target.checked)}
                className="accent-green"
              />
              Simulate low-trust evidence (hold all actions)
            </label>
            <label className="flex items-center gap-3 text-xs">
              <input
                type="checkbox"
                className="accent-green"
                checked={extremeHeat}
                onChange={(e) => setExtremeHeat(e.target.checked)}
              />
              Simulate pulp above 38°C for more than 8 hours
            </label>
            <p className="text-[11px] leading-5 text-muted">
              Carrier freight assumption: ₹18,000. Insurance is a requested
              contribution, never a confirmed recovery. Prolonged exposure above
              38°C requires separate rejection review.
            </p>
          </div>
        </Panel>
        <Panel
          title="Proposed allocation"
          action={
            <Badge tone={result.held ? "red" : "amber"}>
              {result.held
                ? "Held · low trust"
                : `Tier ${result.tier} · advisory`}
            </Badge>
          }
        >
          <div className="space-y-4 p-5 pt-1">
            {[
              ["Farmer invoice protected", result.farmer],
              ["Carrier freight after bond contribution", result.freight],
              ["Buyer quality rebate", result.rebate],
              ["Carrier bond contribution", result.carrierContribution],
              ["Insurance funding requested", result.insuranceRequested],
              ["Additional funding required", result.unfunded],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-3 border-b border-line pb-3 text-xs"
              >
                <span className="text-muted">{label}</span>
                <strong>{rupees(Number(value))}</strong>
              </div>
            ))}
            <div className="rounded-lg bg-surface p-3 text-[11px] leading-5">
              Sources {rupees(result.totalSources)} = allocations{" "}
              {rupees(result.totalUses)}. Includes{" "}
              {rupees(result.insuranceRequested + result.unfunded)} of
              unconfirmed external funding.
            </div>
            {scenario === "S2" && (
              <p className="text-xs text-green">
                Driver protected: hot-loading attribution does not reduce
                carrier freight. Origin adjustment needs bilateral review.
              </p>
            )}
            <CandyButton
              disabled={result.held || queue.includes(id)}
              className="button-primary w-full"
              onClick={() => onQueue(id)}
            >
              <Icon name="file" size={16} />
              {queue.includes(id)
                ? "In review queue"
                : result.held
                  ? "Automatic action blocked"
                  : "Submit recommendation for review"}
            </CandyButton>
          </div>
        </Panel>
      </div>
      <Panel
        title="Insurance claim preparation"
        subtitle="Check origin eligibility and route an excursion before preparing a draft"
      >
        <div className="grid gap-5 p-5 pt-1 md:grid-cols-2">
          <div className="space-y-4">
            <label className="field-label">
              Excursion duration (hours)
              <input
                type="number"
                min="0"
                max="720"
                step="0.5"
                className="input"
                value={excursionHours}
                onChange={(e) =>
                  setExcursionHours(Math.max(0, Number(e.target.value)))
                }
              />
            </label>
            <label className="flex items-start gap-3 text-xs">
              <input
                className="accent-green"
                type="checkbox"
                checked={originProof}
                onChange={(e) => setOriginProof(e.target.checked)}
              />
              Simulate verified origin pre-cool proof
            </label>
            <p className="text-[11px] leading-5 text-muted">
              The scenario selected above is {scenario}. Only
              mechanical-breakdown scenarios are automatically routed. The 12–24
              hour coverage gap stays in manual review.
            </p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <Badge tone={claim.path === "BLOCKED" ? "red" : "amber"}>
              {claim.path}
            </Badge>
            <p className="mt-3 text-sm leading-6">{claim.reason}</p>
            <CandyButton
              className="button-secondary mt-4"
              disabled={claim.path === "BLOCKED" || lowTrust}
              onClick={() => {
                download(
                  `${id}-claim-draft.json`,
                  JSON.stringify(
                    {
                      mode: "demo",
                      status: "DRAFT_NOT_SUBMITTED",
                      shipment: id,
                      scenario,
                      durationHours: excursionHours,
                      originProofSimulated: originProof,
                      path: claim.path,
                      insuranceFundingRequested: result.insuranceRequested,
                    },
                    null,
                    2,
                  ),
                  "application/json",
                );
                notify(
                  "Claim preparation record downloaded. No claim was submitted and no policy was bound.",
                );
              }}
            >
              Download claim draft
              <Icon name="download" size={14} />
            </CandyButton>
          </div>
        </div>
      </Panel>
      <Panel
        title="Settlement rails & claim routing"
        subtitle="External integrations require partner onboarding"
      >
        <div className="grid gap-4 p-5 pt-1 md:grid-cols-3">
          {[
            [
              "Bank escrow",
              "Castler / Cashfree / RazorpayX",
              "Partner credentials required",
            ],
            [
              "Path A · Parametric",
              "3–12 hour thermal excursions",
              "Insurer partner required",
            ],
            [
              "Path B · Indemnity",
              "Breakdowns over 24 hours / accidents",
              "Surveyor dossier required",
            ],
          ].map(([name, detail, status]) => (
            <div className="rounded-xl border border-line p-4" key={name}>
              <Icon
                name={name === "Bank escrow" ? "wallet" : "shield"}
                size={20}
              />
              <h3 className="mt-3 text-sm font-semibold">{name}</h3>
              <p className="mt-2 text-xs text-muted">{detail}</p>
              <p className="mt-3 text-[10px] text-amber">{status}</p>
              <CandyButton
                className="text-action mt-4"
                onClick={() =>
                  notify(
                    `${name}: not connected. Configure a partner-backed server integration before live operation.`,
                  )
                }
              >
                Connection details
                <Icon name="arrow" size={12} />
              </CandyButton>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
