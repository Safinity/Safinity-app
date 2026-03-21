import { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import InputField from '@/components/InputField';
import Checkbox from '@/components/Checkbox';
import PrimaryButton from '@/components/PrimaryButton';

export default function Register() {
  const [checked, setChecked] = useState(false);

  return (
    <Screen>
      <Container>
        <BackButton
          onPress={() => router.back()}
          accessibilityLabel="Return to the previous page"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </BackButton>

        <Title accessibilityRole="header">Create account</Title>

        <Form>
          <InputField label="First Name" placeholder="First Name" />
          <InputField label="Last Name" placeholder="Last Name" />
          <InputField label="Username" placeholder="Username" />
          <InputField
            label="Email"
            placeholder="example@email.com"
            icon="mail-outline"
            keyboardType="email-address"
          />
          <InputField label="Password" password />
          <InputField label="Confirm password" password />
        </Form>

        <Actions>
          <CheckboxWrapper>
            <CheckboxArea
              onPress={() => setChecked(!checked)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checked }}
              accessibilityLabel="I agree to the terms and conditions"
            >
              <Checkbox style={{ marginLeft: 8 }} checked={checked} />
            </CheckboxArea>
          </CheckboxWrapper>

          <PrimaryButton
            title="Create account"
            disabled={!checked}
            onPress={() => router.push('/onboarding')}
          />
        </Actions>
      </Container>
    </Screen>
  );
}

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    padding: theme.spacing.xl,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
}))``;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  font-size: 26px;
  font-weight: 700;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.white};
`;

const Form = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Actions = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const CheckboxWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const CheckboxArea = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
`;
