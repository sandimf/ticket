import { Alert, AlertDescription } from '@/components/ui/alert';

type EventFormStatusProps = {
  isError: boolean;
  isSuccess: boolean;
  errorMessage?: string;
};

export function EventFormStatus({ isError, isSuccess, errorMessage }: EventFormStatusProps) {
  if (!isError && !isSuccess) return null;

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage || 'Terjadi kesalahan'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Event berhasil dibuat! 🎉
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
