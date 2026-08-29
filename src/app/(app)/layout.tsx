import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await prisma.appSetting.findUnique({ where: { id: "site" } });

  return (
    <div className="flex min-h-screen bg-[#F6F7F9] dark:bg-[#0B1215] bg-gradient-to-br from-white via-[#F6F7F9] to-slate-100/60 dark:from-[#0B1215] dark:via-[#0F1F23] dark:to-[#121A1C]">
      <Sidebar logoPath={settings?.logoPath} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
