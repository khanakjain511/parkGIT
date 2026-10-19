"use client";

import { CandyButton } from "./motion";

import { useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { fadeTransition, interfaceSpring } from "@/lib/motion";
import {
  arrivalLiability,
  crops,
  originGate,
  type Shipment,
} from "@/lib/auditor";
import { Badge } from "./ui";
import { Icon } from "./icon";

function custodyPhase(shipment: Shipment) {
  if (shipment.status === "Delivered" || shipment.handoverAt) return 3;
  if (shipment.arrivedAt || shipment.status === "Awaiting unloading") return 2;
  return shipment.status === "At origin" ? 0 : 1;
}

export function CustodyTrail({ shipment }: { shipment: Shipment }) {
  const reduced = useReducedMotion();
  const phase = custodyPhase(shipment);
  let carrierDetail = "Trip completed";
  if (phase === 0) carrierDetail = "Awaiting departure";
  if (phase === 1)
    carrierDetail =
      shipment.status === "Attention" ? "Review required" : "In transit";
  const steps = [
    {
      title: "Origin",
      detail:
        phase === 0 ? "Pre-cooling in progress" : "Loading record captured",
    },
    {
      title: "Carrier",
      detail: carrierDetail,
    },
    {
      title: "Receiver",
      detail:
        phase === 3
          ? "Handover recorded"
          : phase === 2
            ? "Awaiting unloading"
            : "Awaiting arrival",
    },
  ];
  return (
    <ol className="custody-stepper" aria-label="Shipment custody progress">
      {steps.map((step, index) => {
        const completed = index < phase;
        const current = index === phase;
        return (
          <li
            key={step.title}
            className={`custody-step ${completed ? "custody-step-completed" : current ? "custody-step-current" : ""}`}
            aria-current={current ? "step" : undefined}
          >
            {index < steps.length - 1 && (
              <span className="custody-connector" aria-hidden="true">
                <m.span
                  initial={false}
                  animate={{ opacity: completed ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : fadeTransition}
                />
              </span>
            )}
            <span className="custody-step-marker" aria-hidden="true">
              <AnimatePresence initial={false} mode="wait">
                <m.span
                  key={completed ? "completed" : "number"}
                  initial={{ opacity: 0, scale: 0.65 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.65 }}
                  transition={reduced ? { duration: 0 } : interfaceSpring}
                >
                  {completed ? <Icon name="check" size={17} /> : index + 1}
                </m.span>
              </AnimatePresence>
            </span>
            <span className="sr-only">
              {completed
                ? "Completed: "
                : current
                  ? "Current step: "
                  : "Upcoming: "}
            </span>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function Custody({
  shipment,
  onUpdate,
}: {
  shipment: Shipment;
  onUpdate: (value: Shipment) => void;
}) {
  const [gate, setGate] = useState<{ ready: boolean; reason: string } | null>(
    null,
  );
  const [wait, setWait] = useState(0);
  const band = crops[shipment.crop];
  const preview = arrivalLiability(
    "2026-10-19T00:00:00Z",
    new Date(Date.UTC(2026, 9, 19, 0, wait)).toISOString(),
    false,
  );
  function simulateOrigin() {
    const start = Date.now() - 15 * 60000;
    setGate(
      originGate(
        shipment.crop,
        Array.from({ length: 16 }, (_, i) => ({
          timestamp: new Date(start + i * 60000).toISOString(),
          pulp: shipment.temperature,
          doorOpen: false,
        })),
      ),
    );
  }
  return (
    <section className="space-y-4 rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Origin & destination handover</h3>
        <Badge tone="neutral">Simulation</Badge>
      </div>
      {shipment.status === "At origin" && (
        <>
          <p className="text-xs leading-5 text-muted">
            The origin must stay at {band.min}–{band.max}°C for 15 minutes with
            the door closed. Simulate that history before starting this demo
            trip.
          </p>
          <div className="flex flex-wrap gap-2">
            <CandyButton
              className="button-secondary button-small"
              onClick={simulateOrigin}
            >
              Simulate stabilization record
            </CandyButton>
            <CandyButton
              className="button-primary button-small"
              disabled={!gate?.ready}
              onClick={() =>
                onUpdate({ ...shipment, status: "In transit", scenario: "S1" })
              }
            >
              Record demo departure
            </CandyButton>
          </div>
          {gate && (
            <p
              className={`text-xs ${gate.ready ? "text-green" : "text-amber"}`}
            >
              {gate.reason}.{" "}
              {gate.ready
                ? "Synthetic origin history only; no policy bound."
                : "Departure is held for pre-cooling."}
            </p>
          )}
        </>
      )}
      {shipment.status !== "At origin" && (
        <div className="flex flex-wrap items-center gap-2">
          <CandyButton
            className="button-secondary button-small"
            disabled={!!shipment.arrivedAt || shipment.status === "Delivered"}
            onClick={() =>
              onUpdate({
                ...shipment,
                arrivedAt: new Date().toISOString(),
                status: "Awaiting unloading",
              })
            }
          >
            <Icon name="pin" size={13} />
            {shipment.arrivedAt ? "Arrival recorded" : "Record demo arrival"}
          </CandyButton>
          <CandyButton
            className="button-primary button-small"
            disabled={
              !shipment.arrivedAt ||
              !!shipment.handoverAt ||
              shipment.status === "Delivered"
            }
            onClick={() =>
              onUpdate({
                ...shipment,
                status: "Delivered",
                handoverAt: new Date().toISOString(),
              })
            }
          >
            <Icon name="check" size={13} />
            {shipment.handoverAt
              ? "Handover recorded"
              : "Confirm demo unloading"}
          </CandyButton>
        </div>
      )}
      {shipment.arrivedAt && (
        <p className="text-[11px] text-muted">
          Arrival:{" "}
          {new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false,
          }).format(new Date(shipment.arrivedAt))}{" "}
          IST · Manual demo entry, not a verified geofence.
        </p>
      )}
      <div className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
        <label className="field-label flex-1">
          Preview destination wait (minutes)
          <input
            type="number"
            className="input"
            min="0"
            max="4320"
            value={wait}
            onChange={(e) =>
              setWait(Math.max(0, Math.min(4320, Number(e.target.value))))
            }
          />
        </label>
        <span
          className={`mb-3 text-xs ${preview.receiverReview ? "text-amber" : "text-green"}`}
        >
          {preview.receiverReview
            ? "Receiver liability review required"
            : "Within 2-hour unloading allowance"}
        </span>
      </div>
      <p className="text-[10px] leading-5 text-muted">
        A wait over 120 minutes triggers a receiver-liability recommendation. A
        production handover requires validated destination GNSS and custody
        evidence.
      </p>
    </section>
  );
}
