import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type EventFormActionsProps = {
  isLoading: boolean;
  onReset: () => void;
};

export function EventFormActions({ isLoading, onReset }: EventFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
      >
        Reset
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Membuat...
          </>
        ) : (
          'Buat Event'
        )}
      </Button>
    </div>
  );
}
