"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { CandyButton } from "./motion";
import { Icon } from "./icon";
import { fadeTransition } from "@/lib/motion";

import {
  type Theme,
  themeStorageKey as storageKey,
  themeEvent,
  systemThemeQuery as systemQuery,
} from "@/lib/theme";

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(themeEvent));
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {}
  applyTheme(theme);
}

function subscribeTheme(callback: () => void) {
  window.addEventListener(themeEvent, callback);
  return () => window.removeEventListener(themeEvent, callback);
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const system = window.matchMedia(systemQuery);
    const sync = () =>
      applyTheme(savedTheme() ?? (system.matches ? "dark" : "light"));
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) sync();
    };
    sync();
    system.addEventListener("change", sync);
    window.addEventListener("storage", onStorage);
    return () => {
      system.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return children;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    currentTheme,
    () => "light",
  );
  const reduced = useReducedMotion();
  const transition = useRef<ViewTransition | null>(null);

  useEffect(
    () => () => {
      transition.current?.skipTransition();
      delete document.documentElement.dataset.themeTransition;
    },
    [],
  );

  function toggle(button: HTMLButtonElement) {
    if (transition.current) return;
    const next = currentTheme() === "dark" ? "light" : "dark";
    if (reduced || !document.startViewTransition) {
      persistTheme(next);
      return;
    }
    const root = document.documentElement;
    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    root.style.setProperty("--theme-origin", `${x}px ${y}px`);
    root.style.setProperty("--theme-radius", `${radius}px`);
    root.dataset.themeTransition = "active";
    const cleanup = () => {
      transition.current = null;
      delete root.dataset.themeTransition;
      root.style.removeProperty("--theme-origin");
      root.style.removeProperty("--theme-radius");
    };
    try {
      transition.current = document.startViewTransition(() =>
        flushSync(() => persistTheme(next)),
      );
      transition.current.finished.then(cleanup, cleanup);
    } catch {
      cleanup();
      persistTheme(next);
    }
  }

  return (
    <CandyButton
      type="button"
      className="theme-toggle icon-button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      onClick={(event) => toggle(event.currentTarget)}
    >
      <AnimatePresence initial={false} mode="wait">
        <m.span
          key={theme}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={reduced ? { duration: 0 } : fadeTransition}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
        </m.span>
      </AnimatePresence>
    </CandyButton>
  );
}
