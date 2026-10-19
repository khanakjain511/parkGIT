"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { fadeTransition, interfaceSpring } from "@/lib/motion";
import { CandyButton } from "./motion";

import { type Shipment, crops } from "@/lib/auditor";
import { Icon } from "./icon";
import { Badge, Empty } from "./ui";

export function ShipmentTable({
  shipments,
  onSelect,
  full = false,
}: {
  shipments: Shipment[];
  onSelect: (shipment: Shipment) => void;
  full?: boolean;
}) {
  const reduced = useReducedMotion();
  if (!shipments.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="shipment-table">
        <thead>
          <tr>
            <th>Shipment / cargo</th>
            <th>Route</th>
            {full && <th>Driver / vehicle</th>}
            <th>Pulp temp.</th>
            <th>Status</th>
            <th>
              <span>Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {shipments.map((s) => (
              <m.tr
                key={s.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { ...interfaceSpring, opacity: fadeTransition }
                }
              >
                <td>
                  <button
                    type="button"
                    className="shipment-link"
                    onClick={(event) => {
                      event.currentTarget.focus({ preventScroll: true });
                      onSelect(s);
                    }}
                  >
                    <span className="shipment-link-label font-semibold text-ink">
                      {s.id}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted">
                      {s.crop}{" "}
                      {s.id === "PB-0941" ? "· 4,200 kg" : "· Reefer cargo"}
                    </span>
                  </button>
                </td>
                <td>
                  <span className="block text-xs text-ink">
                    {s.origin} <span className="px-1 text-muted">→</span>{" "}
                    {s.destination}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted">
                    {s.status === "Delivered"
                      ? "Arrival confirmed"
                      : "Custody record available"}
                  </span>
                </td>
                {full && (
                  <td>
                    <span className="text-xs">{s.driver}</span>
                    <span className="mt-1 block text-[10px] text-muted">
                      {s.vehicle}
                    </span>
                  </td>
                )}
                <td>
                  <span
                    className={`text-sm font-semibold ${s.temperature > crops[s.crop].max ? "text-amber" : "text-green"}`}
                  >
                    {s.temperature.toFixed(1)}
                    <span className="ml-0.5 text-[11px] font-normal">°C</span>
                  </span>
                </td>
                <td>
                  <Badge
                    tone={
                      s.status === "Attention"
                        ? "amber"
                        : s.status === "At origin"
                          ? "neutral"
                          : "green"
                    }
                  >
                    {s.status}
                  </Badge>
                </td>
                <td>
                  <CandyButton
                    className="icon-button"
                    onClick={() => onSelect(s)}
                    aria-label={`View ${s.id}`}
                  >
                    <Icon name="chevron" size={16} />
                  </CandyButton>
                </td>
              </m.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
