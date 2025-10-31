import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventFormData } from './types';
import { CategorySelect } from './CategorySelect';
import { ImageUpload } from './ImageUpload';

type EventFormFieldsProps = {
  formData: EventFormData;
  imageFile: File | null;
  onInputChange: (field: keyof EventFormData, value: string) => void;
  onImageChange: (file: File | null) => void;
};

export function EventFormFields({ 
  formData, 
  imageFile, 
  onInputChange, 
  onImageChange 
}: EventFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nama Event *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Masukkan nama event"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange('description', e.target.value)}
          placeholder="Deskripsikan event Anda"
          rows={4}
          required
        />
      </div>

      {/* Date, Time, Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Tanggal *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onInputChange('date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Waktu *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => onInputChange('time', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => onInputChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Lokasi *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder="Lokasi event"
            required
          />
        </div>
        <CategorySelect
          value={formData.categoryId}
          onValueChange={(value) => onInputChange('categoryId', value)}
          required
        />
      </div>

      {/* Image Upload */}
      <ImageUpload
        file={imageFile}
        onFileChange={onImageChange}
        required
      />
    </div>
  );
}
