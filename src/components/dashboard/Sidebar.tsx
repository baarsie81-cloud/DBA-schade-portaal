"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./nav-items";
import { beheerNav, schadesNav } from "./nav-items";
import { Logo } from "./Logo";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-lime/80 focus-visible:ring-offset-2 focus-visible:ring-offset-dba-dark-green";

function NavEntry({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${focusRing} ${
        active
          ? "bg-dba-sidebar-active text-white shadow-[inset_3px_0_0_0_var(--dba-lime)]"
          : "text-white/85 hover:bg-dba-sidebar-hover hover:text-white"
      }`}
    >
      <Icon
        className={`h-[18px] w-[18px] shrink-0 ${
          active ? "text-dba-lime" : "text-white/75 group-hover:text-white"
        }`}
        strokeWidth={1.75}
      />
      <span>{item.label}</span>
    </Link>
  );
}

function NavSections({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      <div>
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          Schades
        </p>
        <ul className="flex flex-col gap-0.5">
          {schadesNav.map((item) => (
            <li key={item.href}>
              <NavEntry
                item={item}
                active={pathname === item.href}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mx-3 mb-3 border-t border-white/10" />
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          Beheer
        </p>
        <ul className="flex flex-col gap-0.5">
          {beheerNav.map((item) => (
            <li key={item.href}>
              <NavEntry
                item={item}
                active={pathname === item.href}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col self-start bg-dba-dark-green text-white lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo variant="light" />
      </div>
      <NavSections pathname={pathname} />
    </aside>
  );
}

export function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-dba-charcoal/40"
        aria-label="Menu sluiten"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-[min(280px,85vw)] flex-col bg-dba-dark-green text-white shadow-[-8px_0_24px_rgba(51,53,54,0.08)]">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo variant="light" />
        </div>
        <NavSections pathname={pathname} onNavigate={onClose} />
      </aside>
    </div>
  );
}
