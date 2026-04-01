import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { Sidebar } from '../components/SideBar';
import userImg from '../assets/user-pic.png';
import { Helmet } from 'react-helmet-async';

export const Layout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const user = { name: 'There', avatar: userImg };

  return (
    <>
      <Helmet>
        <title>{title || 'Safinity'}</title>
      </Helmet>
      
      <Navbar
        userName={user.name}
        avatarUrl={user.avatar}
        onMenuClick={() => setMenuOpen(!menuOpen)}
      />

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Content>{children}</Content>
    </>
  );
};

const Content = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg}px;
`;
