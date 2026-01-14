import { router } from 'expo-router';
import OnboardingScreen from '@/components/OnboardingScreen';

export default function Onboarding1() {
  return (
    <OnboardingScreen
      title="Welcome to Safinity"
      description="Safinity is an app created with the aim of ensuring the protection and well-being of all participants in large-scale public events."
      step={0}
      total={3}
      image={require('@/assets/images/onboarding/onboarding-img1.png')}
      onNext={() => router.push('/onboarding/step2')}
      onSkip={() => router.replace('/(tabs)')}
    />
  );
}
