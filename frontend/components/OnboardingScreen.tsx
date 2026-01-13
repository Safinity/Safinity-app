import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType } from 'react-native';

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl}px;
  justify-content: space-between;
`;

const DecorativeImage = styled(Image)<{ step: number }>`
  position: absolute;
  width: 420px;
  height: 420px;

  ${({ step }) =>
    step === 0 &&
    `
      top: -20px;
      right: -110px;
    `}

  ${({ step }) =>
    step === 1 &&
    `
      top: -20px;
      left: -60px;
    `}

  ${({ step }) =>
    step === 2 &&
    `
      top: -80px;
      right: -40px;
    `}
`;

const Content = styled.View`
  align-items: center;
  margin-top: 400px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  ${({ theme }) => theme.text.titulo.h1};
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  text-align: center;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const Bottom = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Dots = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const Dot = styled.View<{ active?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.inactive};
`;

const NavRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const CircleButton = styled.TouchableOpacity`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const Skip = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  text-decoration: underline;
`;

type Props = {
  title: string;
  description: string;
  step: number;
  total: number;
  image?: ImageSourcePropType;
  onNext: () => void;
  onPrev?: () => void;
  onSkip: () => void;
};

export default function OnboardingScreen({
  title,
  description,
  step,
  total,
  image,
  onNext,
  onPrev,
  onSkip,
}: Props) {
  return (
    <Screen>
      {/* 👇 imagem específica do step */}
      {image && <DecorativeImage source={image} step={step} resizeMode="contain" />}

      <Content>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Content>

      <Bottom>
        <Dots>
          {Array.from({ length: total }).map((_, i) => (
            <Dot key={i} active={i === step} />
          ))}
        </Dots>

        <NavRow>
          {onPrev ? (
            <CircleButton onPress={onPrev}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </CircleButton>
          ) : (
            <CircleButton style={{ opacity: 0 }} />
          )}

          <CircleButton onPress={onNext}>
            <Ionicons name="chevron-forward" size={26} color="white" />
          </CircleButton>
        </NavRow>

        <Skip onPress={onSkip}>Skip</Skip>
      </Bottom>
    </Screen>
  );
}
