import React, { useState } from 'react';
import styled from 'styled-components/native';

import Header from '@/components/ui/header';

export default function QRCodeScreen() {
  return (
    <Container>
      <Header variant="back" title="Profile's QR Code" showBottomDivider={false} />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: 80px;
`;
