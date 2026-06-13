import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await prisma.appSetting.findUnique({ where: { id: "site" } });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-50/40 via-white to-accent-50/40 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/60">
      <Sidebar logoPath={settings?.logoPath} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
