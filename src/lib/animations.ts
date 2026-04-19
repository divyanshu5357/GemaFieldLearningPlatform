/**
 * Framer Motion Animation Variants
 * Centralized animation definitions for consistency across the app
 */

import { Easing } from "framer-motion";

const easeOut: Easing = [0.0, 0.0, 0.58, 1.0]; // easeOutCubic
const easeIn: Easing = [0.42, 0.0, 1.0, 1.0]; // easeInCubic
const easeInOut: Easing = [0.42, 0.0, 0.58, 1.0]; // easeInOutCubic

// ============================================================
// PAGE LOAD ANIMATIONS
// ============================================================

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: easeIn,
    },
  },
};

// ============================================================
// STAGGER ANIMATIONS (for lists/cards)
// ============================================================

export const staggerContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
  exit: { opacity: 0, y: -20 },
};

// ============================================================
// CARD ANIMATIONS
// ============================================================

export const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.3,
      ease: easeInOut,
    },
  },
  tap: {
    scale: 0.98,
  },
};

export const cardGlowVariants = {
  initial: { boxShadow: "0px 0px 0px rgba(59, 130, 246, 0)" },
  hover: {
    boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.4)",
    transition: {
      duration: 0.3,
    },
  },
};

// ============================================================
// BUTTON ANIMATIONS
// ============================================================

export const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: easeInOut,
    },
  },
  tap: {
    scale: 0.95,
  },
};

export const buttonGlowVariants = {
  initial: { boxShadow: "0px 0px 0px rgba(59, 130, 246, 0)" },
  hover: {
    boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.5)",
  },
};

// ============================================================
// ICON ANIMATIONS
// ============================================================

export const iconHoverVariants = {
  initial: { rotate: 0, scale: 1 },
  hover: {
    rotate: 5,
    scale: 1.1,
    transition: {
      duration: 0.3,
    },
  },
};

export const iconBounceVariants = {
  initial: { y: 0 },
  hover: {
    y: -3,
    transition: {
      duration: 0.3,
      yoyo: Infinity,
    },
  },
};

// ============================================================
// PROGRESS BAR ANIMATIONS
// ============================================================

export const progressBarVariants = {
  initial: { width: 0, opacity: 0 },
  animate: (custom: number) => ({
    width: `${custom}%`,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: easeOut,
      delay: 0.3,
    },
  }),
};

// ============================================================
// COUNTER ANIMATIONS (for scores, XP)
// ============================================================

export const counterVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

// ============================================================
// NAVIGATION / SIDEBAR ANIMATIONS
// ============================================================

export const navItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
  hover: {
    x: 5,
    transition: {
      duration: 0.2,
    },
  },
  active: {
    x: 0,
    boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.5)",
  },
};

export const sidebarVariants = {
  initial: { x: -250, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
  exit: {
    x: -250,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// ============================================================
// NOTIFICATION / TOAST ANIMATIONS
// ============================================================

export const notificationVariants = {
  initial: { x: 400, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// ============================================================
// QUIZ / ANSWER ANIMATIONS
// ============================================================

export const questionVariants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.3,
    },
  },
};

export const correctAnswerVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    backgroundColor: ["rgba(34, 197, 94, 0)", "rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0)"],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1],
    },
  },
};

export const wrongAnswerVariants = {
  animate: {
    x: [-10, 10, -10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// ============================================================
// LEADERBOARD ANIMATIONS
// ============================================================

export const leaderboardRowVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const topUserVariants = {
  animate: {
    boxShadow: ["0px 0px 0px rgba(251, 191, 36, 0)", "0px 0px 20px rgba(251, 191, 36, 0.6)", "0px 0px 0px rgba(251, 191, 36, 0)"],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// ============================================================
// LOADING / SKELETON ANIMATIONS
// ============================================================

export const skeletonShimmerVariants = {
  initial: { backgroundPosition: "200% center" },
  animate: {
    backgroundPosition: "-200% center",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ============================================================
// HERO / LANDING PAGE ANIMATIONS
// ============================================================

export const heroTitleVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
      delay: 0.1,
    },
  },
};

export const heroSubtitleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
      delay: 0.3,
    },
  },
};

export const heroButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easeOut,
      delay: 0.5,
    },
  },
  hover: {
    scale: 1.08,
    boxShadow: "0px 10px 30px rgba(59, 130, 246, 0.4)",
  },
};

// ============================================================
// PULSE / GLOW ANIMATIONS
// ============================================================

export const pulseVariants = {
  animate: {
    opacity: [1, 0.6, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const glowVariants = {
  animate: {
    boxShadow: [
      "0px 0px 10px rgba(59, 130, 246, 0.3)",
      "0px 0px 25px rgba(59, 130, 246, 0.6)",
      "0px 0px 10px rgba(59, 130, 246, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// ============================================================
// MODAL / POPUP ANIMATIONS
// ============================================================

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const modalContentVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================
// SLIDE IN ANIMATIONS
// ============================================================

export const slideInFromLeftVariants = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const slideInFromRightVariants = {
  initial: { x: 100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// ============================================================
// ROTATE ANIMATIONS
// ============================================================

export const rotateVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
