import styled from 'styled-components';

type HomeCardProps = {
  title: string;
  description: string;
  image: string;
  buttonLabel: string;
  onClick: () => void;
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
`;

const Title = styled.h2`
  color: var(--white);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  text-align: center;
`;

const ImageWrapper = styled.div`
  width: 100%;
  max-width: 560px;
  border-radius: var(--radius-large);
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  display: block;
  object-fit: cover;
`;

const Description = styled.p`
  color: var(--inactive);
  text-align: center;
  max-width: 420px;
  line-height: 1.5;
  margin: 0;
`;

const Button = styled.button`
  background-color: var(--primary);
  color: var(--white);
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-medium);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

export default function HomeCard({
  title,
  description,
  image,
  buttonLabel,
  onClick,
}: HomeCardProps) {
  return (
    <Card>
      <Title>{title}</Title>

      <ImageWrapper>
        <Image src={image} alt={title} />
      </ImageWrapper>

      <Description>{description}</Description>

      <Button onClick={onClick}>{buttonLabel}</Button>
    </Card>
  );
}
