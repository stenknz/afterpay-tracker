import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentCard } from "@/components/PaymentCard";
import Link from "next/link";

export default async function OverduePaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const now = new Date();

  const plans = await prisma.paymentPlan.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      store: true,
      installments: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const overdue = plans.filter((p) =>
    p.installments.some((i) => i.status === "PENDING" && i.dueDate < now)
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overdue Payments</h1>
        <div className="flex gap-4 mt-2 text-sm">
          <Link href="/payments" className="text-neutral-500 hover:text-primary-600">All</Link>
          <Link href="/payments/upcoming" className="text-neutral-500 hover:text-primary-600">Upcoming</Link>
          <Link href="/payments/overdue" className="text-primary-600 dark:text-primary-400 font-medium">Overdue</Link>
          <Link href="/payments/paid" className="text-neutral-500 hover:text-primary-600">Paid</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {overdue.map((plan) => (
          <PaymentCard key={plan.id} plan={plan} />
        ))}
        {overdue.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-400">No overdue payments. Great job!</div>
        )}
      </div>
    </div>
  );
}
