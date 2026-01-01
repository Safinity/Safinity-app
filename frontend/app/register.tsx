import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: #1f2430;
`;

const Container = styled(ScrollView)`
  flex: 1;
  padding: 40px;
`;

const Title = styled.Text`
  font-size: 26px;
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 25px;
  color: white;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const InputWrapper = styled.View`
  flex: 1;
  margin-bottom: 16px;
`;

const Label = styled.Text`
  color: #cfd3e0;
  font-size: 14px;
  margin-bottom: 6px;
`;

const InputBox = styled.View`
  background-color: #2a303f;
  border-radius: 10px;
  padding: 12px 14px;
  flex-direction: row;
  align-items: center;
`;

const TextInput = styled.TextInput`
  flex: 1;
  color: white;
`;

const CheckboxRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
`;

const TermsText = styled.Text`
  color: #cfd3e0;
  flex: 1;
  flex-wrap: wrap;
`;

const Link = styled.Text`
  color: #9f6bff;
  text-decoration: underline;
`;

const Button = styled.TouchableOpacity`
  background-color: #9242cc;
  padding: 16px;
  border-radius: 15px;
  margin-top: 22px;
`;

const ButtonText = styled.Text`
  text-align: center;
  color: white;
  font-weight: 600;
`;

const BottomRow = styled.View`
  margin-top: 18px;
  align-items: center;
`;

const Small = styled.Text`
  color: #cfd3e0;
`;

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <Screen>
      <Container contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Title>Create account</Title>

        {/* First / Last name */}
        <Row style={{ columnGap: 12 }}>
          <InputWrapper>
            <Label>First Name</Label>
            <InputBox>
              <TextInput placeholder="First Name" placeholderTextColor="#8a90a5" />
            </InputBox>
          </InputWrapper>

          <InputWrapper>
            <Label>Last Name</Label>
            <InputBox>
              <TextInput placeholder="Last Name" placeholderTextColor="#8a90a5" />
            </InputBox>
          </InputWrapper>
        </Row>

        <InputWrapper>
          <Label>Username</Label>
          <InputBox>
            <TextInput placeholder="Username" placeholderTextColor="#8a90a5" />
          </InputBox>
        </InputWrapper>

        <InputWrapper>
          <Label>Email</Label>
          <InputBox>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8a90a5"
              keyboardType="email-address"
            />
            <Ionicons name="mail-outline" size={20} color="#cfd3e0" />
          </InputBox>
        </InputWrapper>

        <InputWrapper>
          <Label>Password</Label>
          <InputBox>
            <TextInput placeholder=" " placeholderTextColor="#8a90a5" secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#cfd3e0"
              />
            </TouchableOpacity>
          </InputBox>
        </InputWrapper>

        <InputWrapper>
          <Label>Confirm password</Label>
          <InputBox>
            <TextInput
              placeholder=" "
              placeholderTextColor="#8a90a5"
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#cfd3e0"
              />
            </TouchableOpacity>
          </InputBox>
        </InputWrapper>

        {/* Terms */}
        <CheckboxRow>
          <TouchableOpacity onPress={() => setChecked(!checked)} style={{ marginRight: 8 }}>
            <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color="#9f6bff" />
          </TouchableOpacity>

          <TermsText>
            I agree to the <Link>Terms of use</Link> and <Link>Privacy Policy</Link>.
          </TermsText>
        </CheckboxRow>

        <Button disabled={!checked}>
          <ButtonText>Create account</ButtonText>
        </Button>

        <BottomRow>
          <Small>
            Already have an account? <Link onPress={() => router.push('/login')}>Log in</Link>
          </Small>
        </BottomRow>
      </Container>
    </Screen>
  );
}
