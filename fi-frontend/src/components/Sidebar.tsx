'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { 
  RiDashboardLine, 
  RiFileList3Line,
  RiUserLine,
  RiSettings4Line 
} from 'react-icons/ri';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: IconType;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: RiDashboardLine },
  { name: 'Documents', href: '/dashboard/documents', icon: RiFileList3Line },
  { name: 'Profile', href: '/dashboard/profile', icon: RiUserLine },
  { name: 'Settings', href: '/dashboard/settings', icon: RiSettings4Line },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Image className="h-8 w-auto" src="/logo.svg" alt="Your Company" width={32} height={32} />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                          ${isActive
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
