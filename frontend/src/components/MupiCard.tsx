import styled from 'styled-components';

const CardContainer = styled.div`
  width: 320px;
  height: 500px;
  flex: 0 0 auto;
  border-radius: var(--radius-medium);
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
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7),  
    rgba(0, 0, 0, 0)     
  );
`;

const Title = styled.span`
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.75rem 1rem 0; 
  font-family: var(--font-family);
  font-size: 1rem;
  color: var(--white);
  width: 100%;
  z-index: 2; 
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
