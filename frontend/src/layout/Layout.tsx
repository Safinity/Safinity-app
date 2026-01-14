import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const user = { name: "Jorge", avatar: "/Ellipse.png" };

  return (
    <>
      <Navbar userName={user.name} avatarUrl={user.avatar} onMenuClick={() => setMenuOpen(!menuOpen)}/>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Content>
        {children}
      </Content>
    </>
  );
};

const Content = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg}px;
`;
