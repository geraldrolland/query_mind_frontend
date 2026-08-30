"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, EyeOff, Loader2, Sparkles, X } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  features,
  testimonials,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  features?: { icon: ReactNode; text: string }[];
  testimonials?: { quote: string; name: string; role: string }[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;
    const iv = setInterval(() => {
      setActiveIdx((i) => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(iv);
  }, [testimonials]);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.4) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 animate-orb rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-40 -left-32 h-72 w-72 animate-float-slow rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-24 -right-32 h-80 w-80 animate-float rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
        {/* Left panel — branding + features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="hidden w-full max-w-sm flex-col lg:flex"
        >
          <Link href="/" className="mb-8 flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">QueryMind</span>
          </Link>

          <h2 className="mb-2 text-2xl font-extrabold tracking-tight">{title}</h2>
          <p className="mb-6 text-sm text-slate-400">{subtitle}</p>

          {features && (
            <ul className="mb-8 space-y-3">
              {features.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                    {f.icon}
                  </span>
                  {f.text}
                </motion.li>
              ))}
            </ul>
          )}

          {testimonials && testimonials.length > 0 && (
            <div className="mt-auto">
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-indigo-500 to-cyan-500" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative p-4"
                  >
                    <div className="mb-2 text-3xl font-bold text-indigo-500/30 leading-none">
                      &ldquo;
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-slate-400">
                      {testimonials[activeIdx].quote}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                        {testimonials[activeIdx].name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-300">{testimonials[activeIdx].name}</div>
                        <div className="text-[11px] text-slate-500">{testimonials[activeIdx].role}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              {testimonials.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === activeIdx ? "w-5 bg-indigo-500" : "w-1.5 bg-slate-700 hover:bg-slate-600"
                      }`}
                      aria-label={`Show testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right panel — form card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <Link href="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">QueryMind</span>
          </Link>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-950/20">
            {/* Gradient glow border */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/30 via-transparent to-cyan-500/30 opacity-50" />

            <div className="relative">
              <h1 className="text-2xl font-bold lg:hidden">{title}</h1>
              <p className="mt-1 mb-6 text-sm text-slate-400 lg:hidden">{subtitle}</p>
              {children}
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-0 ${
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30"
          } ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-400"];

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? colors[strength.score - 1] : "bg-slate-800"
            }`}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs ${strength.score >= 3 ? "text-emerald-400" : strength.score >= 2 ? "text-amber-400" : "text-red-400"}`}>
          {labels[strength.score - 1] || "Too short"}
        </p>
      )}
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return { score };
}

export function PasswordRequirements({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mb-4 space-y-1.5">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2 text-xs">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
              c.met ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"
            }`}
          >
            {c.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          </span>
          <span className={c.met ? "text-slate-300" : "text-slate-500"}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-4 overflow-hidden rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SuccessBanner({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-4 overflow-hidden rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SubmitButton({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { scale: 1.01 } : undefined}
      whileTap={!loading ? { scale: 0.98 } : undefined}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Please wait…
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
