import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await prisma.appSetting.findUnique({ where: { id: "site" } });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020208] bg-gradient-to-br from-white via-[#F8FAFC] to-slate-100/60 dark:from-[#020208] dark:via-[#050508] dark:to-[#020208]">
      <Sidebar logoPath={settings?.logoPath} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
