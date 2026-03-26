"use client";

import { type ReactNode, useRef } from "react";
import {
  m,
  LazyMotion,
  domAnimation,
  useInView,
  type Variants,
} from "framer-motion";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
  delay?: number;
  stagger?: boolean;
};

export function ScrollReveal({
  children,
  className,
  as = "div",
  delay = 0,
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const Component = m[as];

  return (
    <LazyMotion features={domAnimation}>
      <Component
        ref={ref}
        className={className}
        variants={stagger ? staggerContainerVariants : revealVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
      >
        {children}
      </Component>
    </LazyMotion>
  );
}

export function ScrollRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div className={className} variants={revealVariants}>
      {children}
    </m.div>
  );
}
