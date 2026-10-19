"use client";

import { AnimatePresence, m } from "motion/react";
import { fadeTransition, surfaceSpring } from "@/lib/motion";
import { CandyButton, PageTransition, useMobileViewport } from "./motion";

import { useState, type FormEvent } from "react";
import { Settings } from "./settings";
import { Sidebar } from "./sidebar";
import { type Crop, type Shipment } from "@/lib/auditor";
import { useWorkspace, useWorkspaceView } from "@/lib/workspace";
import { Icon } from "./icon";
import { NewShipmentDialog, ShipmentDetail } from "./shipment-dialogs";
import { Modal, Panel } from "./ui";
import { Overview } from "./overview";
import { Monitoring } from "./monitoring";
import { Settlements } from "./settlements";
import { Alerts, Devices, DriverView, Evidence } from "./operations";
import { ShipmentTable } from "./shipment-table";
import { ThemeToggle } from "./theme";

const descriptions: Record<string, string> = {
  Shipments: "A complete custody record, from loading to the final handover.",
  "Live monitoring": "Six channels. One clear picture of cargo condition.",
  "Fault diagnostics":
    "Understand what happened before deciding who is responsible.",
  "Settlements & escrow":
    "Fair allocations, backed by evidence and human review.",
  "Evidence & reports":
    "Turn the journey into a reproducible, inspectable record.",
  "Edge devices":
    "Your forensic hardware, its health, and its data continuity.",
  "Alerts & interventions":
    "Act early. Protect the cargo. Keep everyone informed.",
  "Driver self-view": "Evidence that protects the people behind every journey.",
  Settings: "Manage your local workspace and data preferences.",
};
export default function Platform() {
  const { workspace, update } = useWorkspace();
  const [view, setView] = useWorkspaceView();
  const [search, setSearch] = useState("");
  const [monitorId, setMonitorId] = useState<string | undefined>();
  const [status, setStatus] = useState("All shipments");
  const [modal, setModal] = useState<"new" | "detail" | "help" | null>(null);
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileMenuOpen, setMobileOpen] = useState(false);
  const isMobile = useMobileViewport();
  const mobileOpen = isMobile && mobileMenuOpen;
  const shipments = workspace.shipments;
  function navigate(next: string) {
    setView(next);
    setMobileOpen(false);
    setSearch("");
  }
  function select(s: Shipment) {
    setSelected(s);
    setModal("detail");
  }
  function queue(id: string) {
    try {
      update((w) => ({
        ...w,
        reviewQueue: Array.from(new Set([...w.reviewQueue, id])),
      }));
      setNotice(
        `${id} added to the local arbitration queue. No financial action was taken.`,
      );
    } catch {
      setNotice(
        "Could not save the review. Browser storage may be unavailable.",
      );
    }
  }
  const filtered = shipments.filter(
    (s) =>
      (status === "All shipments" || s.status === status) &&
      `${s.id} ${s.crop} ${s.origin} ${s.destination} ${s.driver} ${s.vehicle}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function addShipment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const crop = data.get("crop") as Crop;
    const temp = Number(data.get("temperature"));
    const id = `PB-${String(Math.max(...shipments.map((s) => Number(s.id.split("-")[1]))) + 1).padStart(4, "0")}`;
    const newShipment: Shipment = {
      id,
      crop,
      origin: String(data.get("origin")).trim(),
      destination: String(data.get("destination")).trim(),
      driver: String(data.get("driver")).trim(),
      vehicle: String(data.get("vehicle")).trim(),
      temperature: temp,
      status: "At origin",
      scenario: null,
      trust: 0.98,
      value: Number(data.get("value")),
    };
    if (
      !newShipment.origin ||
      !newShipment.destination ||
      !newShipment.driver ||
      !newShipment.vehicle
    ) {
      setNotice("Please complete all shipment details.");
      return;
    }
    try {
      update((w) => ({ ...w, shipments: [newShipment, ...w.shipments] }));
      setModal(null);
      setView("Shipments");
      setStatus("All shipments");
      setNotice(
        `${id} created in the demo workspace. Origin stabilization and hardware verification remain pending.`,
      );
    } catch {
      setNotice(
        "Shipment could not be saved. Check browser storage and try again.",
      );
    }
  }
  return (
    <div className="app-shell">
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <m.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className="sidebar-scrim"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
        )}
      </AnimatePresence>
      <Sidebar
        key={isMobile ? "mobile" : "desktop"}
        mobile={isMobile}
        view={view}
        navigate={navigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onHelp={() => {
          setMobileOpen(false);
          setModal("help");
        }}
        alertCount={3 - workspace.acknowledged.length}
      />
      <div className="main-shell" inert={mobileOpen || undefined}>
        <header className="topbar">
          <div className="flex min-w-0 items-center gap-3">
            <CandyButton
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              aria-controls="workspace-navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="grid" />
            </CandyButton>
            <span className="topbar-breadcrumb">
              Workspace <span>/</span> <strong>{view}</strong>
            </span>
          </div>
          <div className="topbar-tools">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                setView("Shipments");
              }}
            >
              <Icon name="search" size={16} />
              <input
                aria-label="Search shipments"
                placeholder="Search shipments, routes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setView("Shipments");
                }}
              />
              <kbd>↵</kbd>
            </form>
            <span className="date-display">
              <Icon name="calendar" size={15} />
              19 Oct, 2026
            </span>
            <ThemeToggle />
            <CandyButton
              className="notification-button icon-button"
              onClick={() => navigate("Alerts & interventions")}
              aria-label="Open notifications"
            >
              <Icon name="bell" size={19} />
              {workspace.acknowledged.length < 3 && <span />}
            </CandyButton>
            <span className="topbar-divider" />
            <CandyButton
              className="profile-button"
              onClick={() => navigate("Settings")}
              aria-label="Open profile settings"
            >
              <span className="profile-avatar">
                {workspace.settings.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <strong>{workspace.settings.name}</strong>
                <small>FPO administrator</small>
              </span>
              <span className="text-muted">⌄</span>
            </CandyButton>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <AnimatePresence
            mode="wait"
            onExitComplete={() =>
              window.scrollTo({ top: 0, behavior: "instant" })
            }
          >
            <PageTransition key={view}>
              {view !== "Overview" && (
                <div className="page-intro">
                  <div>
                    <div className="eyebrow">PERISHABLES BLACK BOX</div>
                    <h1>{view}</h1>
                    <p>{descriptions[view]}</p>
                  </div>
                  {view === "Shipments" && (
                    <CandyButton
                      className="button-primary"
                      onClick={() => setModal("new")}
                    >
                      <Icon name="plus" size={17} />
                      New shipment
                    </CandyButton>
                  )}
                </div>
              )}
              {view === "Overview" && (
                <Overview
                  shipments={shipments}
                  onSelect={select}
                  navigate={navigate}
                  onNew={() => setModal("new")}
                  acknowledged={workspace.acknowledged}
                />
              )}
              {view === "Shipments" && (
                <Panel
                  title="Shipment register"
                  subtitle={`${filtered.length} shipments · Local demonstration workspace`}
                  action={
                    <select
                      className="select-small"
                      aria-label="Filter shipment status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {[
                        "All shipments",
                        "In transit",
                        "Attention",
                        "Delivered",
                        "At origin",
                        "Awaiting unloading",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  }
                >
                  <div className="px-5 pb-4">
                    <div className="table-search">
                      <Icon name="search" size={16} />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, route, crop, driver, or vehicle"
                        aria-label="Filter shipments"
                      />
                      {search && (
                        <CandyButton
                          onClick={() => setSearch("")}
                          aria-label="Clear search"
                        >
                          <Icon name="close" size={14} />
                        </CandyButton>
                      )}
                    </div>
                  </div>
                  <ShipmentTable shipments={filtered} full onSelect={select} />
                </Panel>
              )}
              {view === "Live monitoring" && (
                <Monitoring
                  shipments={shipments}
                  onQueue={queue}
                  initialId={monitorId}
                />
              )}
              {view === "Fault diagnostics" && (
                <Monitoring shipments={shipments} diagnostics onQueue={queue} />
              )}
              {view === "Settlements & escrow" && (
                <Settlements
                  shipments={shipments}
                  queue={workspace.reviewQueue}
                  onQueue={queue}
                  notify={setNotice}
                />
              )}
              {view === "Evidence & reports" && (
                <Evidence
                  shipments={shipments}
                  queue={workspace.reviewQueue}
                  notify={setNotice}
                />
              )}
              {view === "Edge devices" && (
                <Devices shipments={shipments} notify={setNotice} />
              )}
              {view === "Alerts & interventions" && (
                <Alerts
                  shipments={shipments}
                  onSelect={select}
                  acknowledged={workspace.acknowledged}
                  notify={setNotice}
                  onAcknowledge={(id) => {
                    try {
                      update((w) => ({
                        ...w,
                        acknowledged: Array.from(
                          new Set([...w.acknowledged, id]),
                        ),
                      }));
                      setNotice(
                        "Alert marked reviewed. The original event remains in the activity record.",
                      );
                    } catch {
                      setNotice("Unable to save alert review.");
                    }
                  }}
                />
              )}
              {view === "Driver self-view" && (
                <DriverView shipments={shipments} />
              )}
              {view === "Settings" && <Settings notify={setNotice} />}
            </PageTransition>
          </AnimatePresence>
          <footer className="main-footer">
            <span>
              Perishables Black Box <span className="mx-2">·</span> Evidence for
              a fairer journey.
            </span>
            <span>
              <span className="status-dot" />
              Demo workspace · No live financial transactions
            </span>
          </footer>
        </main>
      </div>
      <AnimatePresence initial={false}>
        {notice && (
          <m.div
            key={notice}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ ...surfaceSpring, opacity: fadeTransition }}
          >
            <Icon name="check" size={18} />
            <span>{notice}</span>
            <CandyButton
              className="icon-button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={15} />
            </CandyButton>
          </m.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {modal === "help" && (
          <Modal
            key="help"
            title="Your cold-chain audit workspace"
            onClose={() => setModal(null)}
          >
            <div className="space-y-4 text-sm leading-6 text-muted">
              <p>
                Perishables Black Box helps farmers, drivers, buyers, and
                arbitrators inspect the same custody record.
              </p>
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  Create a shipment and check the crop-specific origin
                  temperature.
                </li>
                <li>
                  Inspect six-channel telemetry and reproduce S1–S6 fault
                  scenarios.
                </li>
                <li>
                  Review advisory shelf-life ranges and settlement allocations.
                </li>
                <li>
                  Export a hashed evidence record and an unsigned PDF
                  certificate draft.
                </li>
              </ol>
              <div className="rounded-lg bg-surface p-4 text-xs">
                This is a local software demonstration. Field devices, identity
                and access controls, partner APIs, statutory sign-off, and
                physical validation are required before a live pilot.
              </div>
              <CandyButton
                className="button-primary"
                onClick={() => {
                  setModal(null);
                  navigate("Fault diagnostics");
                }}
              >
                Open the diagnostic workbench
                <Icon name="arrow" size={15} />
              </CandyButton>
            </div>
          </Modal>
        )}
        {modal === "new" && (
          <NewShipmentDialog
            key="new"
            onClose={() => setModal(null)}
            onSubmit={addShipment}
          />
        )}
        {modal === "detail" && selected && (
          <ShipmentDetail
            key="detail"
            selected={selected}
            onClose={() => setModal(null)}
            onQueue={queue}
            notify={setNotice}
            onMonitor={(id) => {
              setMonitorId(id);
              navigate("Live monitoring");
            }}
            onUpdate={(next) => {
              try {
                update((w) => ({
                  ...w,
                  shipments: w.shipments.map((s) =>
                    s.id === next.id ? next : s,
                  ),
                }));
                setSelected(next);
                setNotice("Demo custody record saved locally.");
              } catch {
                setNotice("Custody record could not be saved.");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
