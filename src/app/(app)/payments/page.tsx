import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentCard } from "@/components/PaymentCard";
import { FilterBar } from "@/components/FilterBar";
import Link from "next/link";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; storeId?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;

  const where: Record<string, unknown> = { userId };
  if (params.status) where.status = params.status;
  if (params.storeId) where.storeId = params.storeId;

  const plans = await prisma.paymentPlan.findMany({
    where,
    include: {
      store: true,
      installments: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  let filtered = plans;
  if (params.from || params.to) {
    const fromDate = params.from ? new Date(params.from) : null;
    const toDate = params.to ? new Date(params.to) : null;
    filtered = plans.filter((p) =>
      p.installments.some((i) => {
        if (fromDate && i.dueDate < fromDate) return false;
        if (toDate && i.dueDate > toDate) return false;
        return true;
      })
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <Link href="/payments" className="text-primary-600 dark:text-primary-400 font-medium">All</Link>
            <Link href="/payments/upcoming" className="text-neutral-500 hover:text-primary-600">Upcoming</Link>
            <Link href="/payments/overdue" className="text-neutral-500 hover:text-primary-600">Overdue</Link>
            <Link href="/payments/paid" className="text-neutral-500 hover:text-primary-600">Paid</Link>
          </div>
        </div>
        <Link
          href="/payments/new"
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
        >
          + New Plan
        </Link>
      </div>

      <FilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((plan) => (
          <PaymentCard key={plan.id} plan={plan} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-400">No payment plans found.</div>
        )}
      </div>
    </div>
  );
}
