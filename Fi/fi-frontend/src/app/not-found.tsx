import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl mb-8">Page Not Found</h2>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded">
            Return to Home
          </span>
        </Link>
      </div>
    </div>
  );
}