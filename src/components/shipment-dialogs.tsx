"use client";

import { CandyButton } from "./motion";
import type { FormEvent } from "react";
import { crops, scenarios, rupees, type Shipment } from "@/lib/auditor";
import { exportCertificate } from "@/lib/workspace";
import { Modal, Badge } from "./ui";
import { Icon } from "./icon";
import { Custody, CustodyTrail } from "./custody";
export function NewShipmentDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal title="Create a shipment" onClose={() => onClose()} wide>
      <form onSubmit={onSubmit} className="space-y-5">
        <p className="text-sm text-muted">
          Start an origin record. Hardware checks and pre-cooling verification
          follow at loading.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            Origin
            <input
              name="origin"
              className="input"
              placeholder="e.g. Sonipat FPO"
              required
              maxLength={80}
            />
          </label>
          <label className="field-label">
            Destination
            <input
              name="destination"
              className="input"
              placeholder="e.g. Azadpur Mandi"
              required
              maxLength={80}
            />
          </label>
          <label className="field-label">
            Crop
            <select name="crop" className="input">
              {Object.keys(crops).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Invoice value (INR)
            <input
              name="value"
              className="input"
              type="number"
              min="1"
              max="100000000"
              required
              defaultValue="150000"
            />
          </label>
          <label className="field-label">
            Driver name
            <input
              name="driver"
              className="input"
              placeholder="Full name"
              required
              maxLength={80}
            />
          </label>
          <label className="field-label">
            Vehicle registration
            <input
              name="vehicle"
              className="input"
              placeholder="HR 69 E 4821"
              required
              maxLength={20}
            />
          </label>
          <label className="field-label">
            Origin pulp temperature (°C)
            <input
              name="temperature"
              className="input"
              type="number"
              min="-20"
              max="60"
              step="0.1"
              defaultValue="12.4"
              required
            />
          </label>
          <div className="rounded-lg bg-surface p-3 text-[11px] leading-5 text-muted">
            Origin gate: pulp must remain within the crop band for 15 minutes
            after door closure. No insurance policy is bound by this form.
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <CandyButton
            type="button"
            className="button-secondary"
            onClick={() => onClose()}
          >
            Cancel
          </CandyButton>
          <CandyButton type="submit" className="button-primary">
            Create origin record
            <Icon name="plus" size={16} />
          </CandyButton>
        </div>
      </form>
    </Modal>
  );
}
export function ShipmentDetail({
  selected,
  onClose,
  onQueue,
  onUpdate,
  onMonitor,
  notify,
}: {
  selected: Shipment;
  onClose: () => void;
  onQueue: (id: string) => void;
  onUpdate: (s: Shipment) => void;
  onMonitor: (id: string) => void;
  notify: (message: string) => void;
}) {
  return (
    <Modal title={`Shipment ${selected.id}`} onClose={() => onClose()} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">
              {selected.origin} <span className="mx-2 text-muted">→</span>{" "}
              {selected.destination}
            </p>
            <p className="mt-1 text-xs text-muted">
              {selected.crop} · {selected.vehicle} · {selected.driver}
            </p>
          </div>
          <Badge tone={selected.scenario === "S1" ? "green" : "amber"}>
            {selected.status}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Core pulp", `${selected.temperature}°C`],
            ["Invoice value", rupees(selected.value)],
            ["Oracle trust", `${Math.round(selected.trust * 100)}%`],
          ].map(([label, value]) => (
            <div className="rounded-xl bg-surface p-4" key={label}>
              <p className="text-[10px] text-muted">{label}</p>
              <strong className="mt-2 block text-xl font-semibold">
                {value}
              </strong>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-center gap-2">
            <Badge tone={selected.scenario === "S1" ? "green" : "amber"}>
              {selected.scenario ?? "Pending"}
            </Badge>
            <strong className="text-sm">
              {selected.scenario
                ? scenarios[selected.scenario].name
                : "Awaiting sensor telemetry"}
            </strong>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted">
            {selected.scenario
              ? scenarios[selected.scenario].description
              : "An origin temperature alone cannot establish a thermodynamic cause. Connect the full sensor array and complete the loading baseline."}
          </p>
          <p className="mt-2 text-[11px] text-green">
            Crop band: {crops[selected.crop].min}–{crops[selected.crop].max}
            °C · No automatic liability decision.
          </p>
        </div>
        <section aria-labelledby="custody-trail-title">
          <h3 id="custody-trail-title" className="mb-4 text-sm font-semibold">
            Custody trail
          </h3>
          <CustodyTrail shipment={selected} />
        </section>
        <Custody shipment={selected} onUpdate={onUpdate} />
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-5">
          <CandyButton
            className="button-secondary"
            onClick={() => {
              onQueue(selected.id);
            }}
          >
            Request review
          </CandyButton>
          <CandyButton
            className="button-secondary"
            onClick={() => {
              onMonitor(selected.id);
              onClose();
            }}
          >
            Inspect telemetry
          </CandyButton>
          <CandyButton
            className="button-primary"
            onClick={async () => {
              try {
                await exportCertificate(selected);
                notify("Unsigned certificate draft downloaded.");
              } catch {
                notify("Could not generate certificate.");
              }
            }}
          >
            <Icon name="download" size={15} />
            Certificate draft
          </CandyButton>
        </div>
      </div>
    </Modal>
  );
}
