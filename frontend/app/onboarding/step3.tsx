import { Stack, router } from 'expo-router';
import OnboardingScreen from '@/components/OnboardingScreen';
import { navigateToPreviousRoute } from '@/utils/navigationHistory';

export default function Onboarding3() {
  return (
    <>
      <Stack.Screen options={{ title: 'Safety through connection - Step 3 of 3' }} />
      <OnboardingScreen
        title="Safety through connection"
        description="Find your friends, get immediate help and support from the event, and organize your schedule.  

All this at SAFINITY"
        step={2}
        total={3}
        image={require('@/assets/images/onboarding/onboarding-img3.png')}
        imageAlt="Route map to a friend"
        onPrev={() => navigateToPreviousRoute('/onboarding/step2')}
        onNext={() => router.replace('/(tabs)')}
        onSkip={() => router.replace('/(tabs)')}
      />
    </>
  );
}
