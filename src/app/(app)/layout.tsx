import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await prisma.appSetting.findUnique({ where: { id: "site" } });

  return (
    <div className="flex min-h-screen">
      <Sidebar logoPath={settings?.logoPath} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-6 pb-12 pt-6 lg:px-8 max-w-[1280px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
