import { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import InputField from '@/components/InputField';
import Checkbox from '@/components/Checkbox';
import PrimaryButton from '@/components/PrimaryButton';

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled(ScrollView)`
  flex: 1;
  padding: 40px;
`;

const Title = styled.Text`
  font-size: 26px;
  font-weight: 700;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.white};
`;

export default function Register() {
  const [checked, setChecked] = useState(false);

  return (
    <Screen>
      <Container>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Title>Create account</Title>

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

        <Checkbox checked={checked} onToggle={() => setChecked(!checked)} />

        <PrimaryButton
          title="Create account"
          disabled={!checked}
          onPress={() => router.push('/onboarding')}
        />
      </Container>
    </Screen>
  );
}
