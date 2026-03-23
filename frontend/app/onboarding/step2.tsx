import { Stack, router } from 'expo-router';
import OnboardingScreen from '@/components/OnboardingScreen';

export default function Onboarding2() {
  return (
    <>
      <Stack.Screen options={{ title: 'Navigate with confidence - Step 2 of 3' }} />
      <OnboardingScreen
        title="Navigate with confidence"
        description="The map will be your guide to finding the safest routes and  help you avoid the most crowded areas."
        step={1}
        total={3}
        image={require('@/assets/images/onboarding/onboarding-img2.png')}
        imageAlt="Navigation route from my location to friend."
        onNext={() => router.push('/onboarding/step3')}
        onPrev={() => router.back()}
        onSkip={() => router.replace('/(tabs)')}
      />
    </>
  );
}
