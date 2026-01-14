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
            <Type>{type}</Type>
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

// ===== styled-components =====

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 25px;
  border-radius: 16px;
  background: #303b49;
  color: #ffffff;
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
  font-size: 18px;
  font-weight: 600;
`;

const Message = styled.div`
  font-size: 14px;
  opacity: 0.85;
`;

const Meta = styled.div`
  font-size: 12px;
  opacity: 0.6;
  display: flex;
  gap: 12px;
`;

const Type = styled.div``;

const SubmittedBy = styled.div``;

const Time = styled.div`
  font-size: 14px;
  margin-left: 16px;
  white-space: nowrap;
`;
