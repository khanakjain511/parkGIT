import type { Transition, Variants } from "motion/react";

export const interfaceSpring = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.8,
} satisfies Transition;

export const navigationSpring = {
  type: "spring",
  stiffness: 440,
  damping: 38,
  mass: 0.8,
} satisfies Transition;

export const surfaceSpring = {
  type: "spring",
  stiffness: 280,
  damping: 29,
  mass: 0.85,
} satisfies Transition;

export const fadeTransition = {
  duration: 0.16,
  ease: [0.22, 1, 0.36, 1],
} satisfies Transition;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...surfaceSpring, opacity: fadeTransition },
  },
};

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...surfaceSpring,
      opacity: fadeTransition,
      staggerChildren: 0.035,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};
