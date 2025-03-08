export default function LoadingState() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <img
          src="/logo.png"
          alt="Fi Logo"
          className="h-20 w-20 animate-pulse"
        />
        <p className="mt-4 text-lg font-semibold">Loading...</p>
      </div>
    );
  }