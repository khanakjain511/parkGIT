"use client";

import { CandyButton } from "./motion";
import { LayoutGroup, m } from "motion/react";
import { navigationSpring } from "@/lib/motion";
import { Brand } from "./brand";
import { useEffect, useRef } from "react";
import { Icon } from "./icon";
const navigation = [
  ["Overview", "grid"],
  ["Shipments", "truck"],
  ["Live monitoring", "activity"],
  ["Fault diagnostics", "shield"],
  ["Settlements & escrow", "wallet"],
  ["Evidence & reports", "file"],
  ["Edge devices", "cpu"],
  ["Alerts & interventions", "bell"],
];

function NavigationItem({
  label,
  icon,
  active,
  onClick,
  count,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <CandyButton
      className={`nav-item ${active ? "nav-active" : ""}`}
      whileHover={{ y: 0 }}
      whileTap={{ scale: 0.985 }}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {active && (
        <m.span
          layoutId="active-navigation"
          className="nav-indicator"
          transition={navigationSpring}
          aria-hidden="true"
        />
      )}
      <Icon name={icon} size={18} />
      <span>{label}</span>
      {count !== undefined && <span className="nav-count">{count}</span>}
    </CandyButton>
  );
}

export function Sidebar({
  view,
  navigate,
  mobileOpen,
  mobile,
  onHelp,
  alertCount,
  onClose,
}: {
  view: string;
  navigate: (view: string) => void;
  mobileOpen: boolean;
  mobile: boolean;
  onHelp: () => void;
  alertCount: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, [mobileOpen]);
  return (
    <LayoutGroup id="workspace-navigation">
      <m.aside
        id="workspace-navigation"
        data-mobile={mobile}
        initial={false}
        animate={{ x: mobile && !mobileOpen ? "-100%" : "0%" }}
        transition={navigationSpring}
        inert={(mobile && !mobileOpen) || undefined}
        aria-hidden={(mobile && !mobileOpen) || undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
      >
        <CandyButton
          ref={closeRef}
          className="mobile-close icon-button"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <Icon name="close" />
        </CandyButton>
        <Brand />
        <CandyButton className="workspace-switch" onClick={() => onHelp()}>
          <span className="workspace-avatar">GH</span>
          <span className="flex-1 text-left">
            <strong>Green Harvest</strong>
            <small>FPO workspace</small>
          </span>
          <span className="text-muted">⌄</span>
        </CandyButton>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {navigation.map(([name, icon]) => (
            <NavigationItem
              key={name}
              label={name}
              icon={icon}
              active={view === name}
              onClick={() => navigate(name)}
              count={name === "Alerts & interventions" ? alertCount : undefined}
            />
          ))}
        </nav>
        <p className="nav-label mt-7!">PEOPLE & PREFERENCES</p>
        <NavigationItem
          label="Driver self-view"
          icon="shield"
          active={view === "Driver self-view"}
          onClick={() => navigate("Driver self-view")}
        />
        <NavigationItem
          label="Settings"
          icon="settings"
          active={view === "Settings"}
          onClick={() => navigate("Settings")}
        />
        <div className="sidebar-bottom">
          <CandyButton className="help-link" onClick={() => onHelp()}>
            <Icon name="help" size={16} />
            Help & product guide
            <Icon name="arrow" size={12} />
          </CandyButton>
        </div>
      </m.aside>
    </LayoutGroup>
  );
}
