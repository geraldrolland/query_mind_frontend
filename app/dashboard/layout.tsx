"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Database, LogOut, Menu, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FeedbackModal } from "@/components/review/feedback-modal";

const NAV = [
  { href: "/dashboard/datasets", label: "Datasets", icon: Database },
];

function SidebarContent({ onLogout, onNavigate, onFeedback }: {
  onLogout: () => void;
  onNavigate?: () => void;
  onFeedback: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      <Link
        href="/dashboard/datasets"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-4 py-4"
      >
        <motion.div
          whileHover={{ rotate: 12, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500"
        >
          <Sparkles className="h-4 w-4 text-white" />
        </motion.div>
        <span className="text-lg font-bold tracking-tight">QueryMind</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-indigo-500/15"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/60 p-3 space-y-1">
        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => { onFeedback(); onNavigate?.(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </motion.button>
        <motion.button
          whileHover={{ x: 2 }}
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </motion.button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Don't mount page children (which fire API calls) until the session has
  // been validated against the backend. If the session is invalid the guard
  // in useAuth redirects to /signin.
  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (status === "anonymous") {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100 lg:flex-row">
      <motion.aside
        initial={{ x: -48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-hidden border-r border-slate-800 bg-slate-900/60 lg:flex"
      >
        <SidebarContent onLogout={() => logout()} onFeedback={() => setFeedbackOpen(true)} />
      </motion.aside>

      {/* Mobile top bar */}
      {!pathname.includes("/assistant") && (
        <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard/datasets" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">QueryMind</span>
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </header>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 lg:hidden"
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent
                onLogout={() => logout()}
                onNavigate={() => setMobileNavOpen(false)}
                onFeedback={() => setFeedbackOpen(true)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-x-hidden lg:ml-60">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
