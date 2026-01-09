import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Header from '../../../components/ui/header';
import { Colors, Spacing, Fonts } from '../../../constants/theme';
import InputField from '../../../components/InputField';

const SecurityScreen = () => {
  const [email, setEmail] = useState('user@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  return (
    <Container>
      <Header variant="back" title="Password & Security" showBottomDivider={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Content>
            <Section>
              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                icon="mail-outline"
              />
            </Section>

            <Section>
              <SectionTitle>Change Password</SectionTitle>

              <InputField
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                password={true}
                icon={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                password={true}
                icon={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconPress={() => setShowNewPassword(!showNewPassword)}
              />

              <InputField
                label="Repeat New Password"
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder="Repeat new password"
                password={true}
                icon={showRepeatPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconPress={() => setShowRepeatPassword(!showRepeatPassword)}
              />

              <SaveButton>
                <SaveButtonText>Save changes</SaveButtonText>
              </SaveButton>
            </Section>
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default SecurityScreen;

// Estilos
const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
  padding-top: ${Spacing.lg}px;
  padding-bottom: ${Spacing.xl}px;
`;

const Section = styled.View`
  margin-bottom: ${Spacing.xl}px;
`;

const SectionTitle = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: 18px;
  margin-bottom: ${Spacing.md}px;
`;

const SectionDescription = styled.Text`
  color: ${Colors.inactive};
  font-family: ${Fonts.weights.light};
  font-size: 14px;
  line-height: 18px;
  margin-bottom: ${Spacing.md}px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${Colors.palette.primary.normal};
  border-radius: ${Spacing.md}px;
  padding: ${Spacing.md}px;
  align-items: center;
  margin-top: ${Spacing.md}px;
`;

const SaveButtonText = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: 16px;
`;

const PasswordRequirements = styled.View`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${Spacing.sm}px;
  padding: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
`;

const RequirementTitle = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.medium};
  font-size: 14px;
  margin-bottom: ${Spacing.sm}px;
`;

const Requirement = styled.Text<{ fulfilled: boolean }>`
  color: ${({ fulfilled }) => (fulfilled ? Colors.palette.primary.light50 : Colors.inactive)};
  font-family: ${Fonts.weights.light};
  font-size: 12px;
  margin-left: ${Spacing.sm}px;
  margin-bottom: ${Spacing.xs}px;
`;
