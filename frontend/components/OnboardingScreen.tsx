import { useEffect } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import TertiaryButton from './TertiaryButton';

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
      top: -300px;
      right: 0px;
      height: 1450px;
    `}

  ${({ step }) =>
    step === 1 &&
    `
      top: -300px;
      left: 0px;
      height: 1450px;
    `}

  ${({ step }) =>
    step === 2 &&
    `
      top: -300px;
      left: 0px;
      height: 1450px;
    `}
`;

const Content = styled.View`
  align-items: center;
  margin-top: 450px;
`;

const AnimatedContent = Animated.createAnimatedComponent(Content);

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
  width: 15px;
  height: 15px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.inactive};
`;

const NavigationRow = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const CircleButton = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const LeftButton = styled(CircleButton)`
  position: absolute;
  left: 0;
`;

const RightButton = styled(CircleButton)`
  position: absolute;
  right: 0;
`;

const SkipWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
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
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(30);

  useEffect(() => {
    opacity.value = 0;
    translateX.value = 30;

    opacity.value = withTiming(1, { duration: 400 });
    translateX.value = withTiming(0, { duration: 400 });
  }, [step]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Screen>
      {image && <DecorativeImage source={image} step={step} resizeMode="contain" />}

      <AnimatedContent style={animatedStyle}>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </AnimatedContent>

      <Bottom>
        <NavigationRow>
          {onPrev && (
            <LeftButton onPress={onPrev}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </LeftButton>
          )}

          <Dots>
            {Array.from({ length: total }).map((_, i) => (
              <Dot key={i} active={i === step} />
            ))}
          </Dots>

          <RightButton onPress={onNext}>
            <Ionicons name="chevron-forward" size={26} color="white" />
          </RightButton>
        </NavigationRow>

        <SkipWrapper>
          <TertiaryButton title="Skip" onPress={onSkip} />
        </SkipWrapper>
      </Bottom>
    </Screen>
  );
}
