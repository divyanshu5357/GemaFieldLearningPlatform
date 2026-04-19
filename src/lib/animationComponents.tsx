/**
 * Reusable Animation Wrapper Components
 * Drop these into your existing components to add animations
 */

import { motion, AnimatePresence, Variants } from "framer-motion";
import React from "react";
import {
  pageVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardVariants,
  buttonVariants,
  buttonGlowVariants,
  notificationVariants,
  modalBackdropVariants,
  modalContentVariants,
} from "../lib/animations";

// ============================================================
// PAGE TRANSITION WRAPPER
// ============================================================

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants as any}
  >
    {children}
  </motion.div>
);

// ============================================================
// STAGGER CONTAINER (for lists of cards)
// ============================================================

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
}) => (
  <motion.div
    className={className}
    variants={staggerContainerVariants as any}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

// ============================================================
// STAGGER ITEM (child of StaggerContainer)
// ============================================================

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className,
}) => (
  <motion.div variants={staggerItemVariants as any} className={className}>
    {children}
  </motion.div>
);

// ============================================================
// ANIMATED CARD
// ============================================================

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  onClick,
}) => (
  <motion.div
    className={className}
    variants={cardVariants as any}
    initial="initial"
    animate="animate"
    whileHover="hover"
    whileTap="tap"
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// ============================================================
// ANIMATED BUTTON
// ============================================================

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  onClick,
  disabled,
}) => (
  <motion.button
    className={className}
    variants={buttonVariants as any}
    initial="initial"
    whileHover={!disabled ? "hover" : undefined}
    whileTap={!disabled ? "tap" : undefined}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

// ============================================================
// NOTIFICATION / TOAST
// ============================================================

interface NotificationProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedNotification: React.FC<NotificationProps> = ({
  children,
  className,
}) => (
  <motion.div
    className={className}
    variants={notificationVariants as any}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

// ============================================================
// MODAL OVERLAY
// ============================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AnimatedModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/50 z-40"
          variants={modalBackdropVariants as any}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        />
        <motion.div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          variants={modalContentVariants as any}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ============================================================
// COUNTER COMPONENT (for XP, Score animation)
// ============================================================

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  from = 0,
  to,
  duration = 1,
  className,
  prefix = "",
  suffix = "",
}) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    let startTime: NodeJS.Timeout | null = null;
    const incrementPerMs = (to - from) / (duration * 1000);

    const timer = setInterval(() => {
      setCount((prev) => {
        const newCount = prev + incrementPerMs * 100;
        return newCount >= to ? to : newCount;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return (
    <span className={className}>
      {prefix}
      {Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

// ============================================================
// PROGRESS BAR WITH ANIMATION
// ============================================================

import { progressBarVariants } from "../lib/animations";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  label?: string;
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  label,
}) => (
  <div className={className}>
    {label && <div className="text-sm font-medium text-gray-300 mb-2">{label}</div>}
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-linear-to-r from-blue-500 to-purple-500"
        variants={progressBarVariants as any}
        initial="initial"
        animate="animate"
        custom={value}
      />
    </div>
    <div className="text-xs text-gray-400 mt-1">{value}%</div>
  </div>
);

// ============================================================
// SKELETON LOADER
// ============================================================

// ============================================================
// PULSE WRAPPER
// ============================================================

import { pulseVariants } from "../lib/animations";

interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPulse: React.FC<PulseProps> = ({ children, className }) => (
  <motion.div
    className={className}
    variants={pulseVariants as any}
    animate="animate"
  >
    {children}
  </motion.div>
);

// ============================================================
// HOVER SCALE WRAPPER
// ============================================================

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  className,
}) => (
  <motion.div
    className={className}
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// ============================================================
// SLIDE IN WRAPPER
// ============================================================

import { slideInFromLeftVariants } from "../lib/animations";

interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right";
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  className,
  direction = "left",
  delay = 0,
}) => (
  <motion.div
    className={className}
    variants={
      direction === "left"
        ? (slideInFromLeftVariants as any)
        : (slideInFromLeftVariants as any)
    }
    initial="initial"
    animate="animate"
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// ============================================================
// LOADING SKELETON
// ============================================================

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
  variant?: "text" | "card" | "avatar" | "box";
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  className = "h-16 bg-gray-700 rounded-lg mb-4",
  variant = "text",
}) => {
  const variants: Record<string, string> = {
    text: "h-4 bg-gray-700 rounded-md",
    card: "h-48 bg-gray-700 rounded-lg",
    avatar: "h-12 w-12 bg-gray-700 rounded-full",
    box: "h-24 bg-gray-700 rounded-lg",
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={variants[variant] || className}
          animate={{
            backgroundPosition: ["200% 0%", "-200% 0%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      ))}
    </div>
  );
};

// ============================================================
// LOADING SPINNER
// ============================================================

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue-500",
}) => {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <motion.div
      className={`${sizeMap[size]} border-4 border-gray-600 border-t-${color} rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// ============================================================
// LOADING OVERLAY
// ============================================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = "Loading...",
}) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900 p-8 rounded-lg flex flex-col items-center gap-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <LoadingSpinner size="lg" color="blue-500" />
          <p className="text-white text-center">{message}</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================
// FADE IN LOADING STATE
// ============================================================

interface FadeInLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
}

export const FadeInLoading: React.FC<FadeInLoadingProps> = ({
  children,
  isLoading,
  loadingComponent,
}) => (
  <AnimatePresence mode="wait">
    {isLoading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {loadingComponent || <SkeletonLoader count={3} />}
      </motion.div>
    ) : (
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================
// PULSING LOADER (dots animation)
// ============================================================

export const PulsingLoader: React.FC = () => (
  <div className="flex gap-2 justify-center items-center">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-3 w-3 bg-blue-500 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);
