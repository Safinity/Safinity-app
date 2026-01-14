import React from 'react';
import styled from 'styled-components';
import '../theme/theme.ts';

type Props = {
  type: string;
  dotColor: string;
  title: string;
  message: string;
  time: string;
  submittedby: string;
};

export const AlertsBar: React.FC<Props> = ({
  type,
  dotColor,
  title,
  message,
  time,
  submittedby,
}) => {
  return (
    <Container>
      <Left>
        <Dot $color={dotColor} />
        <TextBlock>
          <Title>{title}</Title>
          <Message>{message}</Message>

          <Meta>
            <SubmittedBy>
              Submitted by <b>{submittedby}</b>
            </SubmittedBy>
          </Meta>
        </TextBlock>
      </Left>

      <Time>{time}</Time>
    </Container>
  );
};

// ----------------------------- styled-components --------------------------------

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 25px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.grayNavbar};
  color: ${({ theme }) => theme.colors.white};
`;

const Left = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Dot = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
`;

const Message = styled.div`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
`;

const Meta = styled.div`
  font-size: 12px;
  display: flex;
  gap: 12px;
`;

const SubmittedBy = styled.div`
color: ${({ theme }) => theme.colors.palette.primary.light60};`;

const Time = styled.div`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  margin-left: 16px;
`;
