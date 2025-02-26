'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch items-center justify-end">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-300"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            Sign out
          </button>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {session?.user?.image ? (
              <Image
                className="h-8 w-8 rounded-full bg-gray-700"
                src={session.user.image}
                alt=""
                width={32}
                height={32}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-700" />
            )}
            <span className="text-sm font-semibold text-white">
              {session?.user?.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}