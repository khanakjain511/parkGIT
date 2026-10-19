"use client";

import Link from "next/link";
import {
  useSyncExternalStore,
  type ReactNode,
  type ComponentProps,
} from "react";
import {
  domMax,
  LazyMotion,
  m,
  MotionConfig,
  useIsPresent,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { interfaceSpring, pageVariants } from "@/lib/motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig
        reducedMotion="user"
        transition={reduced ? { duration: 0 } : interfaceSpring}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

export function CandyButton({
  disabled,
  className = "",
  whileHover,
  whileTap,
  onClick,
  ...props
}: HTMLMotionProps<"button">) {
  const reduced = useReducedMotion();
  return (
    <m.button
      {...props}
      className={`candy-button ${className}`}
      disabled={disabled}
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        onClick?.(event);
      }}
      whileHover={disabled || reduced ? undefined : (whileHover ?? { y: -1 })}
      whileTap={
        disabled || reduced ? undefined : (whileTap ?? { scale: 0.98, y: 0 })
      }
    />
  );
}

const AnimatedLink = m.create(Link);
export function MotionLink({
  whileHover,
  whileTap,
  className = "",
  ...props
}: ComponentProps<typeof AnimatedLink>) {
  const reduced = useReducedMotion();
  return (
    <AnimatedLink
      {...props}
      className={`${className.includes("button-") ? "candy-button " : ""}${className}`}
      whileHover={reduced ? undefined : (whileHover ?? { y: -1 })}
      whileTap={reduced ? undefined : (whileTap ?? { scale: 0.975 })}
    />
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return (
    <m.div
      className="view-content"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      inert={!present || undefined}
    >
      {children}
    </m.div>
  );
}

const mobileQuery = "(max-width: 760px)";
function subscribeViewport(callback: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
export function useMobileViewport() {
  return useSyncExternalStore(
    subscribeViewport,
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
}
