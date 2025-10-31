"use client"

import { useGetEvents } from "@/hooks/useGetEvents"
import { EventCard, EventCardSkeleton } from "./event-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function EventListClient() {
  const { data: events, isLoading, isError, error } = useGetEvents()

  // Loading state
  if (isLoading && !events) {
    return (
      <div className="px-4">
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-[160px] sm:w-[200px] md:w-[240px] lg:w-[260px] flex-shrink-0"
              >
                <EventCardSkeleton />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center text-red-500 py-6">
        <h2 className="text-lg font-semibold">Terjadi Kesalahan</h2>
        <p className="text-sm">{error?.message || "Tidak dapat memuat data."}</p>
      </div>
    )
  }

  // Success state
  return (
    <div className="px-4">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {events?.slice(0, 10).map((event) => (
            <div
              key={event.id}
              className="w-[160px] sm:w-[200px] md:w-[240px] lg:w-[260px] flex-shrink-0"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
