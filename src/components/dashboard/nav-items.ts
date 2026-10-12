import { ClipboardList, FilePlus2, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const schadesNav: NavItem[] = [
  { href: "/nieuwe-schade", label: "Nieuwe schade", icon: FilePlus2 },
  { href: "/schadeoverzicht", label: "Schadeoverzicht", icon: ClipboardList },
];

export const beheerNav: NavItem[] = [
  { href: "/instellingen", label: "Instellingen", icon: Settings },
];
