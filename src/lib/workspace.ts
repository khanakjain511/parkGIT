"use client";

import { useMemo, useSyncExternalStore } from "react";
import { crops, scenarios, initialShipments, type Shipment } from "./auditor";

type Workspace = {
  shipments: Shipment[];
  acknowledged: string[];
  reviewQueue: string[];
  settings: {
    name: string;
    email: string;
    language: string;
    retention: string;
    notifications: boolean;
    locationConsent: boolean;
  };
};
const initial: Workspace = {
  shipments: initialShipments,
  acknowledged: [],
  reviewQueue: [],
  settings: {
    name: "Akshay Singh",
    email: "akshay@greenharvest.in",
    language: "English",
    retention: "90",
    notifications: true,
    locationConsent: false,
  },
};
const key = "perishables-workspace-v1";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("workspace-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("workspace-change", callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function read(raw: string | null): Workspace {
  if (!raw) return initial;
  try {
    const value = JSON.parse(raw);
    if (
      !Array.isArray(value.shipments) ||
      value.shipments.length === 0 ||
      !value.shipments.every(
        (s: Shipment) =>
          s &&
          typeof s.id === "string" &&
          s.crop in crops &&
          ["origin", "destination", "driver", "vehicle"].every(
            (k) => typeof s[k as keyof Shipment] === "string",
          ) &&
          [s.temperature, s.value, s.trust].every(Number.isFinite) &&
          [
            "In transit",
            "Attention",
            "Delivered",
            "At origin",
            "Awaiting unloading",
          ].includes(s.status) &&
          (s.scenario === null || s.scenario in scenarios),
      ) ||
      !Array.isArray(value.acknowledged) ||
      !Array.isArray(value.reviewQueue) ||
      !value.settings ||
      typeof value.settings.name !== "string" ||
      typeof value.settings.email !== "string" ||
      typeof value.settings.language !== "string" ||
      typeof value.settings.retention !== "string" ||
      typeof value.settings.notifications !== "boolean" ||
      typeof value.settings.locationConsent !== "boolean"
    )
      return initial;
    return value;
  } catch {
    return initial;
  }
}
export function useWorkspace() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const workspace = useMemo(() => read(raw), [raw]);
  function update(change: (current: Workspace) => Workspace) {
    localStorage.setItem(key, JSON.stringify(change(read(snapshot()))));
    window.dispatchEvent(new Event("workspace-change"));
  }
  return { workspace, update };
}
export function download(
  name: string,
  content: string | Uint8Array,
  type: string,
) {
  const blob = new Blob(
    [typeof content === "string" ? content : new Uint8Array(content)],
    { type },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
export async function exportEvidence(shipment: Shipment) {
  const payload = JSON.stringify(
    {
      mode: "demo",
      shipment,
      device: "PBB-EDGE-001",
      timestamp: new Date().toISOString(),
      hardwareSignature: null,
    },
    null,
    2,
  );
  const hash = Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
  download(
    `${shipment.id}-evidence.json`,
    JSON.stringify(
      {
        payload: JSON.parse(payload),
        canonicalPayload: payload,
        hashEncoding: "SHA-256 of canonicalPayload encoded as UTF-8",
        sha256: hash,
        certificateStatus: "DRAFT_UNSIGNED",
      },
      null,
      2,
    ),
    "application/json",
  );
  return hash;
}
export async function exportCertificate(shipment: Shipment) {
  const payload = JSON.stringify(shipment);
  const hash = Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
  const lines = [
    "PERISHABLES BLACK BOX",
    "Evidence certificate / DRAFT - UNSIGNED",
    "BSA Section 63(4) preparation worksheet",
    "",
    "Demonstration data. Not a statutory certification.",
    "Custodian and expert completion and legal review required.",
    "",
    "PART A - CUSTODIAN RECORD",
    `Shipment: ${shipment.id} | Crop: ${shipment.crop}`,
    `Route: ${shipment.origin} to ${shipment.destination}`,
    `Vehicle: ${shipment.vehicle} | Driver: ${shipment.driver}`,
    `Device serial: PBB-EDGE-001 (simulated)`,
    `Generated: ${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date())} IST`,
    "Record source: local demonstration workspace",
    "Custodian name and capacity: __________________________",
    "Custodian signature and date: _________________________",
    "",
    "PART B - EXPERT RECORD",
    "Algorithm: SHA-256",
    `Payload hash: ${hash.slice(0, 32)}`,
    hash.slice(32),
    `Scenario: ${shipment.scenario ?? "UNCLASSIFIED"} | Pulp: ${shipment.temperature} C`,
    `Trust score: ${Math.round(shipment.trust * 100)}% (simulated)`,
    "Hardware ECDSA signature: NOT AVAILABLE",
    "Expert identity and qualification: _____________________",
    "Expert signature and date: ____________________________",
    "",
    "HASHED PAYLOAD (base64 of UTF-8 JSON; concatenate, then decode)",
    ...(btoa(String.fromCharCode(...new TextEncoder().encode(payload))).match(
      /.{1,78}/g,
    ) ?? []),
    "",
    "Advisory only. No funds released. No policy bound.",
    "No legal admissibility or physical sensor accuracy asserted.",
  ];
  const escape = (s: string) =>
    s.replace(/[^\x20-\x7e]/g, "-").replace(/([\\()])/g, "\\$1");
  const wrapped = lines.flatMap((line) => line.match(/.{1,80}/g) ?? [""]);
  const pages = Array.from({ length: Math.ceil(wrapped.length / 44) }, (_, i) =>
    wrapped.slice(i * 44, (i + 1) * 44),
  );
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  pages.forEach((page, i) => {
    const stream = `BT /F1 10 Tf 42 800 Td 16 TL ${page.map((line, j) => `${j ? "T* " : ""}(${escape(line)}) Tj`).join("\n")} ET\nBT /F1 8 Tf 42 28 Td (DRAFT - UNSIGNED | Page ${i + 1} of ${pages.length}) Tj ET`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + i * 2} 0 R >>`,
    );
    objects.push(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  });
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join(
      "",
    )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  download(`${shipment.id}-certificate-draft.pdf`, pdf, "application/pdf");
}

const workspaceViews: Record<string, string> = {
  overview: "Overview",
  shipments: "Shipments",
  monitoring: "Live monitoring",
  diagnostics: "Fault diagnostics",
  settlements: "Settlements & escrow",
  evidence: "Evidence & reports",
  devices: "Edge devices",
  alerts: "Alerts & interventions",
  driver: "Driver self-view",
  settings: "Settings",
};
function subscribeView(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}
function viewSnapshot() {
  const slug = window.location.hash.slice(1);
  return Object.hasOwn(workspaceViews, slug)
    ? workspaceViews[slug]
    : "Overview";
}
export function useWorkspaceView() {
  const view = useSyncExternalStore(
    subscribeView,
    viewSnapshot,
    () => "Overview",
  );
  function setView(next: string) {
    const slug = Object.entries(workspaceViews).find(
      ([, label]) => label === next,
    )?.[0];
    if (!slug || window.location.hash === `#${slug}`) return;
    window.history.pushState(null, "", `#${slug}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  return [view, setView] as const;
}
