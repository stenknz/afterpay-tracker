import { CalendarView } from "@/components/CalendarView";

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <CalendarView />
    </div>
  );
}
