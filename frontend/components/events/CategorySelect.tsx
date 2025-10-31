import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { CategoriesResponse } from './types';

type CategorySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function CategorySelect({ value, onValueChange, required = false }: CategorySelectProps) {
  const { 
    data: categoriesRes, 
    isLoading, 
    isError,
    error 
  } = useQuery<CategoriesResponse, Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/category`);
      if (!res.ok) {
        throw new Error('Gagal memuat kategori');
      }
      return res.json();
    },
  });

  const categories = categoriesRes?.data ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        Kategori {required && '*'}
      </Label>
      {isLoading ? (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat kategori...</span>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat kategori: {error?.message}
          </AlertDescription>
        </Alert>
      ) : (
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
