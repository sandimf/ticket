"use client"

import React, { useEffect, useState } from "react"
import { Music, Dumbbell, Pizza, Paintbrush, Search, Cpu, BookOpen, Plane, Shirt, HeartPulse, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventListClient } from "@/components/features/event/event-list-client"
import { BannerImage } from "../banner/banner-image"
import { useSession } from "next-auth/react"

const categories = [
  { id: 1, name: "Music", icon: Music, color: "bg-purple-100 text-purple-600" },
  { id: 3, name: "Food", icon: Pizza, color: "bg-orange-100 text-orange-600" },
  { id: 4, name: "Art", icon: Paintbrush, color: "bg-pink-100 text-pink-600" },
  { id: 5, name: "Technology", icon: Cpu, color: "bg-slate-100 text-slate-600" },
  { id: 6, name: "Education", icon: BookOpen, color: "bg-green-100 text-green-600" },
  { id: 7, name: "Travel", icon: Plane, color: "bg-teal-100 text-teal-600" },
  { id: 8, name: "Fashion", icon: Shirt, color: "bg-rose-100 text-rose-600" },
  { id: 9, name: "Health", icon: HeartPulse, color: "bg-red-100 text-red-600" },
  { id: 10, name: "Film", icon: Film, color: "bg-yellow-100 text-yellow-600" },
]

export default function EventHomepage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: session } = useSession()
  const username = session?.user?.name ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 px-4 pt-8 pb-20 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
              {username && (
              <p className="mt-1 text-white">Halo, {username}!</p>
            )}
            <h1 className="text-2xl font-bold text-white">Find Your Next Event</h1>
            <p className="text-teal-100">Explore events around you</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search events, artists, or venues"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-xl border-0 bg-white shadow-sm placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-teal-300"
          />
        </div>
      </header>


      {/* Konten Utama (Menumpuk) */}
      <main className="bg-white rounded-t-[1.5rem] mt-[-2rem] shadow-lg p-4 pb-20">
        <section className="mb-8">
          <BannerImage />
        </section>
        {/* Kategori */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${category.color} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-sm font-medium flex-shrink-0 w-24 h-24 transition-transform hover:scale-90 active:scale-95`}
              >
                <category.icon className="w-6 h-6" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>


        {/* Popular Events */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Popular Events</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              See More
            </Button>
          </div>
          <EventListClient />
        </section>

        {/* Banner */}


        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              See More
            </Button>
          </div>
          <EventListClient />
        </section>
      </main>
    </div>
  )
}