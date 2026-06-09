"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DayDetailDrawer } from "./DayDetailDrawer";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    status: string;
    amount: number;
    planId: string;
    storeName: string;
  };
}

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function loadEvents(from: string, to: string) {
    const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    const to = new Date();
    to.setMonth(to.getMonth() + 6);
    loadEvents(from.toISOString(), to.toISOString());
  }, []);

  function handleDateClick(info: { dateStr: string }) {
    const dayEvents = events.filter((e) => e.start.startsWith(info.dateStr));
    setSelectedDateEvents(dayEvents);
    setDrawerOpen(true);
  }

  function handleEventClick(info: { event: { extendedProps: Record<string, unknown> } }) {
    const planId = info.event.extendedProps.planId as string;
    if (planId) window.location.href = `/payments/${planId}`;
  }

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
          }}
          displayEventTime={false}
        />
      </div>
      <DayDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        events={selectedDateEvents}
      />
    </>
  );
}
