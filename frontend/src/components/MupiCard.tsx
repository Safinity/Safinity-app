import styled from 'styled-components';

const CardContainer = styled.div`
  width: 320px;
  height: 500px;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  overflow: hidden;
  position: relative;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
`;

const Title = styled.span`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.sm}px;
  left: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px 0`};
  width: 100%;
  z-index: 2;

  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  line-height: ${({ theme }) => theme.text.titulo.h3.lineHeight}px;
`;

interface MupiCardProps {
  title: string;
  image: string;
}

export default function MupiCard({ title, image }: MupiCardProps) {
  return (
    <CardContainer>
      <Image src={image} alt={title} />
      <GradientOverlay />
      <Title>{title}</Title>
    </CardContainer>
  );
}
