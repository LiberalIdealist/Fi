"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import React from 'react';
import Logo from './Logo';
import LoginButton from './LoginButton';
import styled from 'styled-components';

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

const Navbar = () => {
  return (
    <NavbarContainer>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      <NavLinks>
        <LoginButton />
      </NavLinks>
    </NavbarContainer>
  );
};

export default Navbar;
