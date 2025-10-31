'use client';

import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventFormData, EventResponse, EventFormProps } from './types';
import { EventFormFields } from './EventFormFields';
import { EventFormActions } from './EventFormActions';
import { EventFormStatus } from './EventFormStatus';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const initialFormData: EventFormData = {
  name: '',
  description: '',
  date: '',
  time: '',
  location: '',
  status: 'draft',
  categoryId: '',
};

export function EventForm({ onSuccess, onError }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Create event mutation
  const createEventMutation = useMutation<EventResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/event`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Gagal membuat event' }));
        throw new Error(errorData.message || 'Gagal membuat event');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      handleReset();
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error.message);
    },
  });

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setImageFile(null);
    
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Gambar wajib diunggah');
      return;
    }
    
    if (!formData.categoryId) {
      alert('Pilih kategori');
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('date', formData.date);
    fd.append('time', formData.time);
    fd.append('location', formData.location);
    fd.append('status', formData.status);
    fd.append('category_id', formData.categoryId);
    fd.append('image', imageFile);

    createEventMutation.mutate(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EventFormFields
        formData={formData}
        imageFile={imageFile}
        onInputChange={handleInputChange}
        onImageChange={setImageFile}
      />

      <EventFormStatus
        isError={createEventMutation.isError}
        isSuccess={createEventMutation.isSuccess}
        errorMessage={createEventMutation.error?.message}
      />

      <EventFormActions
        isLoading={createEventMutation.isPending}
        onReset={handleReset}
      />
    </form>
  );
}
