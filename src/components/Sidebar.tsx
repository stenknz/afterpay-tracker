"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { SafeImage } from "./SafeImage";
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Repeat,
  Zap,
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/utilities", label: "Utilities", icon: Zap },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  logoPath?: string | null;
}

export function Sidebar({ logoPath }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          bg-white dark:bg-zinc-900
          border-r border-zinc-200/70 dark:border-zinc-800
          flex flex-col
          transition-all duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "w-[68px]" : "w-[240px]"}
        `}
      >
        <div className={`flex items-center h-16 px-4 border-b border-zinc-200/70 dark:border-zinc-800 ${collapsed ? "justify-center" : "gap-3"}`}>
          <SafeImage
            src={logoPath}
            alt="Logo"
            className="h-8 w-auto shrink-0"
            fallback={
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                DF
              </div>
            }
          />
          {!collapsed && <span className="font-semibold text-base tracking-tight">DueFlow</span>}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
                  ${active
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-500 dark:bg-indigo-400" />
                )}
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-zinc-200/70 dark:border-zinc-800">
          <button
            onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
              text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150
              ${collapsed ? "justify-center px-0" : ""}
            `}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-zinc-200/70 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>
    </>
  );
}
