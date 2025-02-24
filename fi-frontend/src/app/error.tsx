"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="glass-panel p-8 text-center">
      <h2 className="gradient-heading mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="gradient-button px-6 py-2 rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}