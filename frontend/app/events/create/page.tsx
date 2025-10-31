"use client"

import { EventForm } from "@/components/features/event/event-form";

export default function CreateEventPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buat Event</h1>
      <EventForm />
    </div>
  );
}