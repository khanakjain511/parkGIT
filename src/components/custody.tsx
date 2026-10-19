"use client";

import { CandyButton } from "./motion";

import { useState } from "react";
import {
  arrivalLiability,
  crops,
  originGate,
  type Shipment,
} from "@/lib/auditor";
import { Badge } from "./ui";
import { Icon } from "./icon";

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
