import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { PlanActions } from "@/components/PlanActions";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "@/components/SafeImage";
import { ArrowLeft, Building2, Pencil } from "lucide-react";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const plan = await prisma.paymentPlan.findFirst({
    where: {
      id,
      OR: [
        { userId },
        {
          visibility: "SHARED",
          user: {
            OR: [
              { partnersGiven: { some: { viewerId: userId } } },
              { partnersRecv: { some: { sharerId: userId } } },
            ],
          },
        },
      ],
    },
    include: {
      store: true,
      vendor: true,
      user: { select: { id: true, name: true, email: true } },
      installments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!plan) notFound();

  const isOwner = plan.userId === userId;
  const totalPaid = plan.installments.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const progress = plan.totalAmount > 0 ? Math.round((totalPaid / plan.totalAmount) * 100) : 0;
  const allPaid = plan.installments.length > 0 && plan.installments.every((i) => i.status === "PAID");

  const freqLabel: Record<string, string> = {
    WEEKLY: "Weekly",
    BIWEEKLY: "Bi-weekly",
    MONTHLY: "Monthly",
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <Link href="/payments" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Payments
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <SafeImage
              src={plan.store?.logoPath}
              alt={plan.store?.name || "Store"}
              className="w-full h-full object-contain"
              fallback={<Building2 className="w-6 h-6 text-zinc-400" />}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight">{plan.title || plan.store?.name || "Untitled Plan"}</h2>
              <StatusBadge status={plan.status} />
              {plan.archivedAt && <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium">Archived</span>}
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">
              {freqLabel[plan.frequency] || plan.frequency} payments &middot; Started {formatDate(plan.startDate)}
              {!isOwner && plan.user && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  Shared by {plan.user.name || plan.user.email}
                </span>
              )}
            </p>
          </div>
          {isOwner && (
            <Link
              href={`/payments/${plan.id}/edit`}
              className="btn btn-secondary"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mt-4">
          <div>
            <p className="stat-label">Total</p>
            <p className="text-xl font-bold tracking-tight mt-0.5">${plan.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="stat-label">Paid</p>
            <p className="text-xl font-bold tracking-tight mt-0.5 text-emerald-600 dark:text-emerald-400">${totalPaid.toFixed(2)}</p>
          </div>
          <div>
            <p className="stat-label">Remaining</p>
            <p className="text-xl font-bold tracking-tight mt-0.5 text-amber-600 dark:text-amber-400">${(plan.totalAmount - totalPaid).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-zinc-500">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${allPaid ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {plan.notes && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400">
            {plan.notes}
          </div>
        )}

        {isOwner && (
          <div className="mt-4">
            <PlanActions planId={plan.id} isArchived={!!plan.archivedAt} allPaid={allPaid} />
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="section-heading mb-4">Installments</h3>
        <InstallmentTimeline installments={plan.installments} />
      </div>
    </div>
  );
}
