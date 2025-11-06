"use client"

import Image from "next/image"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {  useMemo, useState } from "react"
import { useGetEvents } from "@/hooks/useGetEvents"
import { Event } from "@/types/type"
import Link from "next/link"

function SectionHeader({ title }: { title: string }) {
  
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
      <Link
        href="/events"
        className="text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        See More
      </Link>
    </div>
  )
}

export default function EventDiscoveryPage() {
  const [search, setSearch] = useState("")
  const { data, isLoading, error } = useGetEvents()

  const events: Event[] = useMemo(() => {
    const base = Array.isArray(data) ? data : []
    if (!search) return base
    const q = search.toLowerCase()
    return base.filter((e) =>
      [e.title, e.description, e.category, e.city, e.venue_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <div className="container mx-auto bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
        
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search Event"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-5 pr-12 py-3 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Status */}
        {isLoading && (
          <p className="text-sm text-gray-600">Memuat event…</p>
        )}
        {error instanceof Error && (
          <p className="text-sm text-red-600">Gagal mengambil data: {error.message}</p>
        )}

        {/* Event Grid */}
        <section>
          <SectionHeader title={search ? `Hasil untuk "${search}"` : "Event for you"} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug || event.id}`} className="w-full bg-white shadow-lg rounded-2xl overflow-hidden transition-transform hover:scale-105">
                <div className="relative">
                  <Image
                    src={event.poster_image_url || "/banner.jpeg"}
                    alt={event.title}
                    width={400}
                    height={225}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(event.start_datetime).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">{event.city || event.venue_name}</p>
                  <p className="text-xl font-bold text-teal-600 mt-2">
                    Rp {event.ticket_types?.[0]?.price ? Number(event.ticket_types[0].price).toLocaleString("id-ID") : "—"}
                  </p>
                </div>
              </Link>
            ))}

            {!isLoading && events.length === 0 && (
              <div className="text-gray-500 text-sm">Tidak ada event yang cocok.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}