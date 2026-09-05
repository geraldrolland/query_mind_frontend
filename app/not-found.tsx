"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SearchX, ArrowLeft, Home } from "lucide-react";

function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={
        reduce
          ? {}
          : {
              y: [0, -30, 0],
              x: [0, 15, -10, 0],
              scale: [1, 1.1, 0.95, 1],
            }
      }
      transition={{
        duration: 10,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function NotFound() {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background orbs */}
      <FloatingOrb className="h-72 w-72 bg-primary/40 -top-20 -left-20" delay={0} />
      <FloatingOrb className="h-96 w-96 bg-chart-4/30 -bottom-32 -right-32" delay={2} />
      <FloatingOrb className="h-48 w-48 bg-chart-2/20 top-1/3 right-1/4" delay={4} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated 404 number */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          <span className="text-[8rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-foreground/5 sm:text-[10rem]">
            404
          </span>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={
              reduce
                ? {}
                : { y: [0, -8, 0], rotate: [0, 5, -5, 0] }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <SearchX className="h-20 w-20 text-primary/60 sm:h-24 sm:w-24" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Page not found
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        {/* Divider */}
        <motion.div
          className="my-8 h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98]"
          >
            <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Back to home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary hover:border-border/80 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Go back
          </button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link
            href="/signin"
            className="transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/signup"
            className="transition-colors hover:text-foreground"
          >
            Create account
          </Link>
          <span className="text-border">·</span>
          <a
            href="mailto:support@querymind.app"
            className="transition-colors hover:text-foreground"
          >
            Contact support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
