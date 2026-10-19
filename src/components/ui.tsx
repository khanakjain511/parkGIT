"use client";

import { CandyButton } from "./motion";
import { m } from "motion/react";
import { fadeTransition, revealVariants, surfaceSpring } from "@/lib/motion";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icon";

export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "neutral";
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.section variants={revealVariants} className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </m.section>
  );
}
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal-host"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
    >
      <m.div
        className="dialog-scrim"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fadeTransition}
        onClick={onClose}
      />
      <m.div
        className={`modal ${wide ? "modal-wide" : ""}`}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.985 }}
        transition={{ ...surfaceSpring, opacity: fadeTransition }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold" id="modal-title">
            {title}
          </h2>
          <CandyButton
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </CandyButton>
        </div>
        <div className="p-6">{children}</div>
      </m.div>
    </dialog>
  );
}
export function Empty({
  title = "No shipments found",
  detail = "Try another search or create a new shipment.",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface text-green">
        <Icon name="search" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}
