import React from 'react';
import styled from 'styled-components';
import '../theme/theme.ts';

import emergencyIcon from '../assets/Icons/emergency.svg';
import warningIcon from '../assets/Icons/warning.svg';
import infoIcon from '../assets/Icons/info.svg';
import successIcon from '../assets/Icons/success.svg';

type Props = {
  type: string;
  title: string;
  message: string;
  time: string;
  submittedby: string;
};

export const AlertsBar: React.FC<Props> = ({ type, title, message, time, submittedby }) => {
  const getIconByType = (t: string) => {
    switch (t.toLowerCase()) {
      case 'emergency':
      case 'critical':
        return emergencyIcon;
      case 'warning':
        return warningIcon;
      case 'success':
        return successIcon;
      default:
        return infoIcon;
    }
  };

  return (
    <Container>
      <Left>
        {/* aria-hidden="true" porque a imagem é decorativa (o texto já explica o tipo) */}
        <IconImage src={getIconByType(type)} alt="" aria-hidden="true" />

        <TextBlock>
          {/* aria-hidden="true" aqui evita que o leitor de ecrã leia "EMERGENCY" e logo a seguir o aria-label do pai */}
          <TypeLabel $type={type.toLowerCase()} aria-hidden="true">
            {type.toUpperCase()}
          </TypeLabel>

          <Title role="heading" aria-level={3}>
            {title}
          </Title>
          <Message>{message}</Message>

          <Meta>
            <SubmittedBy>
              Submitted by <Author>{submittedby}</Author>
            </SubmittedBy>
          </Meta>
        </TextBlock>
      </Left>

      {/* role="timer" ou aria-label ajuda a dar contexto ao número isolado */}
      <Time aria-label={`Time: ${time}`}>{time}</Time>
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
  width: 100%;
`;

const Left = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding-top: 4px;
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 14px;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TypeLabel = styled.span<{ $type: string }>`
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 2px;
  /* Texto branco em cima do fundo escuro (Contraste 21:1 - Perfeito) */
  color: #ffffff;
`;

const Title = styled.div`
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  font-weight: bold;
`;

const Message = styled.div`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.9;
`;

const Meta = styled.div`
  margin-top: 8px;
  font-size: 12px;
`;

const SubmittedBy = styled.div`
  color: ${({ theme }) => theme.colors.palette.primary.light60};
`;

const Author = styled.b`
  color: ${({ theme }) => theme.colors.white};
`;

const Time = styled.div`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  margin-left: 16px;
  padding-top: 20px;
  white-space: nowrap;
`;
