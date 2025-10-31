'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TicketType } from '@/types/type';
import { TicketOrderForm } from './ticket-order-form';

interface TicketSectionProps {
  eventId: number;
  ticketTypes: TicketType[];
  userId?: number;
}

export function TicketSection({ eventId, ticketTypes, userId }: TicketSectionProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  // Jika tidak ada tiket yang tersedia
  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">Tiket Belum Tersedia</h3>
        <p className="text-gray-500">Tiket untuk event ini belum tersedia saat ini.</p>
      </div>
    );
  }

  // Jika user belum login
  if (!userId) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Tiket</h2>
        <div className="space-y-4 mb-6">
          {ticketTypes.map((ticket) => (
            <div 
              key={ticket.id} 
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{ticket.name}</h3>
                <p className="text-sm text-gray-500">{ticket.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Rp {ticket.price.toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-500">
                  {ticket.total_stock} tersedia
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
            asChild
          >
            <a href="/auth/login?redirect=back">Login untuk Membeli Tiket</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tiket</h2>
      
      {!showOrderForm ? (
        <>
          <div className="space-y-4 mb-6">
            {ticketTypes.map((ticket) => (
              <div 
                key={ticket.id} 
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{ticket.name}</h3>
                  <p className="text-sm text-gray-500">{ticket.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Rp {ticket.price.toLocaleString('id-ID')}</p>
                  <p className="text-sm text-gray-500">
                    {ticket.total_stock} tersedia
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
              onClick={() => setShowOrderForm(true)}
            >
              Beli Tiket
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Pesan Tiket</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowOrderForm(false)}
            >
              Kembali
            </Button>
          </div>
          
          <TicketOrderForm 
            eventId={eventId} 
            ticketTypes={ticketTypes} 
            userId={userId} 
          />
        </div>
      )}
    </div>
  );
}