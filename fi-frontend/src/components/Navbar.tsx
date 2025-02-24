"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from 'react';
import Logo from './Logo';
import styled from 'styled-components';
import Image from "next/image";

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    to right,
    rgba(0, 123, 255, 0.1),
    rgba(111, 66, 193, 0.1),
    rgba(255, 20, 147, 0.1)
  );
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(111, 66, 193, 0.2);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use status to conditionally render content
  const isAuthenticated = status === 'authenticated';

  // Use router for navigation
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <NavbarContainer>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      <NavLinks>
        {session ? (
          <>
            <Link href="/profile" className="flex items-center space-x-2">
              {session.user?.image && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </Link>
            <button 
              onClick={handleSignOut}
              className="btn-primary"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button 
            onClick={handleSignIn}
            className="btn-primary"
          >
            Sign In
          </button>
        )}
      </NavLinks>
    </NavbarContainer>
  );
}

export default Navbar;
