import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-6">
        <Link href="/">
          <div className="inline-block">
            <Image 
              src="/logo.png" 
              alt="Fi Logo" 
              width={60} 
              height={60} 
              className="mx-auto mb-2"
            />
          </div>
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}