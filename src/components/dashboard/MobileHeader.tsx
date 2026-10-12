"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { MobileNavDrawer } from "./Sidebar";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-dba-border bg-dba-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-dba-border bg-dba-background text-dba-charcoal transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1"
          aria-label="Menu openen"
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dba-muted">
            DBA advies
          </p>
          <p className="truncate text-sm font-semibold text-dba-charcoal">
            Schade-assistent
          </p>
        </div>
      </header>
      <MobileNavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
