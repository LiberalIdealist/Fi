'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ClientLayout;