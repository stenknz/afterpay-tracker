"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { SafeImage } from "./SafeImage";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/payments": "Payments",
  "/payments/new": "New Payment Plan",
  "/calendar": "Calendar",
  "/subscriptions": "Subscriptions",
  "/utilities": "Utilities",
  "/stores": "Stores",
  "/settings": "Settings",
};

export function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as { name?: string; email?: string; avatarPath?: string } | undefined;

  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || "DueFlow";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex items-center justify-between h-full px-6 lg:px-8 max-w-[1280px] mx-auto w-full">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <ThemeToggle />
          {user && (
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-zinc-200 dark:ring-zinc-700">
              <SafeImage
                src={user.avatarPath}
                alt=""
                className="w-full h-full object-cover"
                fallback={
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {(user.name || user.email || "?")[0].toUpperCase()}
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
