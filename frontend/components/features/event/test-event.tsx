"use client"

import React, { useState } from "react"
import { Music, Dumbbell, Pizza } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventListClient } from "@/components/features/event/event-list-client"
import { BannerImage } from "../banner/banner-image"

const categories = [
  { id: 1, name: "Music", icon: Music, color: "bg-purple-100 text-purple-600" },
  { id: 2, name: "Sport", icon: Dumbbell, color: "bg-blue-100 text-blue-600" },
  { id: 3, name: "Food", icon: Pizza, color: "bg-orange-100 text-orange-600" },
  { id: 4, name: "Food", icon: Pizza, color: "bg-orange-100 text-orange-600" },
]

export default function EventHomepage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/80 text-sm">Welcome back 👋</p>
            <h1 className="text-white text-2xl font-bold mt-1">Ridwan Soleh</h1>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-teal-300 rounded-full flex items-center justify-center text-teal-800 font-semibold">
              RS
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Event"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-6 rounded-xl border-0 bg-white/95 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-white"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white rounded-t-[2rem] min-h-[calc(100vh-280px)] px-4 pt-6 pb-8">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 text-gray-800">Category</h2>

          <div className="flex gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${category.color
                  } rounded-2xl px-3 py-2 flex flex-col items-center justify-center gap-1 text-sm font-medium flex-1 min-w-[80px] transition-transform hover:scale-105 active:scale-95`}
              >
                <category.icon className="w-5 h-5" />
                {category.name}
              </button>
            ))}
          </div>
        </div>



        {/* Popular Events */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Popular Events</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto"
            >
              See More
            </Button>
          </div>

          {/* Integrasi EventListClient */}
          <EventListClient />
        </div>

        <BannerImage />


        {/* Upcoming Events (duplikasi untuk section kedua, opsional) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto"
            >
              See More
            </Button>
          </div>

          <EventListClient />
        </div>
      </div>
    </div>
  )
}
