"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-semibold">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-500 mb-1">Name</label>
            <p className="font-medium">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-1">Email</label>
            <p className="font-medium">{session?.user?.email || "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-semibold">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-neutral-500">Toggle between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-semibold">About</h3>
        <p className="text-sm text-neutral-500">Afterpay Tracker v1.0.0</p>
        <p className="text-sm text-neutral-500">Track and manage your installment payments with ease.</p>
      </div>
    </div>
  );
}
