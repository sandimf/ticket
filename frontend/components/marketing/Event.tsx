"use client"

import { useQuery } from "@tanstack/react-query";
import { GetAllEvents } from '@/lib/events';
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export function EventsData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: GetAllEvents,
  });

  const events = Array.isArray(data) ? data : (data as any)?.data || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200 animate-pulse bg-white">
              <div className="w-full aspect-[16/9] bg-gray-200" />
              <div className="p-3">
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-2 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error instanceof Error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">All Events</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {events.map((event: any) => (
          <div 
            key={event.id} 
            className="overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer group bg-white"
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.name || 'Event'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {(event.name || 'Event')[0]}
                </div>
              )}
              
              {/* Featured Badge */}
              {event.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-white border-0 text-xs">
                  Featured
                </Badge>
              )}
            </div>

            {/* Event Content */}
            <div className="p-3 space-y-2">
              {/* Event Title */}
              <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {event.name || 'Untitled Event'}
              </h3>

              {/* Event Date */}
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3 h-3 mr-1.5" />
                <span>
                  {event.date || event.startDate 
                    ? new Date(event.date || event.startDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Date TBA'}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}`}
                </span>
              </div>

              {/* Event Price */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {event.price === 0 || event.price === '0' || event.isFree
                      ? 'Gratis'
                      : event.price 
                        ? `Rp${Number(event.price).toLocaleString('id-ID')}`
                        : 'TBA'}
                  </p>
                </div>
              </div>

              {/* Organizer */}
              {event.organizer && (
                <div className="flex items-center pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1.5">
                    {event.organizerLogo ? (
                      <img 
                        src={event.organizerLogo} 
                        alt={event.organizer}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                        {event.organizer[0]}
                      </div>
                    )}
                    <span className="text-xs text-gray-700 font-medium truncate">
                      {event.organizer}
                    </span>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No events available at the moment
        </div>
      )}
    </div>
  );
}