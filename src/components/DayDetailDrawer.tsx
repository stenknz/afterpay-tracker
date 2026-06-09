"use client";

import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  extendedProps: {
    status: string;
    amount: number;
    planId: string;
    storeName: string;
  };
}

interface DayDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export function DayDetailDrawer({ open, onClose, events }: DayDetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 h-full overflow-y-auto p-6 shadow-xl border-l border-neutral-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {events.length > 0
              ? new Date(events[0].start).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Selected Date"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No payments due on this date.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/payments/${event.extendedProps.planId}`}
                className="block p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: event.backgroundColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.extendedProps.storeName}</p>
                    <p className="text-sm text-neutral-500">${event.extendedProps.amount.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    event.extendedProps.status === "PAID"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                      : event.extendedProps.status === "OVERDUE"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                  }`}>
                    {event.extendedProps.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
