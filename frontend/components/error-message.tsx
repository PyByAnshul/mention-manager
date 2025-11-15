// Error state component
'use client';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-xl font-semibold text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Try Again
      </button>
      <p className="mt-4 text-sm text-gray-500 text-center max-w-md">
        If you're using a local API, ensure it's running. Otherwise, refresh the page.
      </p>
    </div>
  );
}
