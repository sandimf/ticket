import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

type ImageUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
};

export function ImageUpload({ file, onFileChange, required = false }: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    onFileChange(selectedFile);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image">
        Gambar Event {required && '*'}
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={required}
          className="flex-1"
        />
        <Upload className="h-4 w-4 text-muted-foreground" />
      </div>
      {file && (
        <p className="text-sm text-muted-foreground">
          File terpilih: {file.name}
        </p>
      )}
    </div>
  );
}
