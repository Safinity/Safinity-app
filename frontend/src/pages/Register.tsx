import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCheckSquare, AiOutlineBorder } from 'react-icons/ai';

import LogoImg from '../assets/images/landing/logo.png';
import PhoneImg from '../assets/images/landing/phone.png';
import PrimaryButton from '../components/PrimaryButton';

const Page = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LeftContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 80px;
  gap: 32px;
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Phone = styled.img`
  height: 100%;
`;

const Logo = styled.img`
  width: 180px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.white};
  font-size: 40px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.inactive};
  font-size: 20px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: 6px;
`;

const InputBox = styled.div`
  background-color: #2a303f;
  border-radius: 8px;
  padding: 12px;
`;

const Input = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
`;

const CheckboxLabel = styled.span`
  color: ${({ theme }) => theme.colors.inactive};
  flex: 1;
  line-height: 1.4;
`;

const LinkText = styled.span`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;
`;

const BottomText = styled.p`
  color: ${({ theme }) => theme.colors.inactive};
  text-align: center;
  margin-top: 24px;
`;

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!checked) {
      setError('You must agree to the terms');
      return;
    }

    // Aqui você poderia salvar o usuário no backend
    navigate('/home');
  };

  return (
    <Page>
      <LeftContent>
        <Logo src={LogoImg} alt="Safinity Logo" />
        <Title>Create account</Title>
        <Subtitle>Join us!</Subtitle>

        <Form>
          <InputGroup>
            <Label>First Name</Label>
            <InputBox>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Last Name</Label>
            <InputBox>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Username</Label>
            <InputBox>
              <Input value={username} onChange={e => setUsername(e.target.value)} />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Email</Label>
            <InputBox>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <InputBox>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Confirm Password</Label>
            <InputBox>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </InputBox>
          </InputGroup>
        </Form>

        <CheckboxWrapper onClick={() => setChecked(!checked)} style={{ cursor: 'pointer' }}>
          {checked ? (
            <AiOutlineCheckSquare size={22} color="#E9D9F5" />
          ) : (
            <AiOutlineBorder size={22} color="#E9D9F5" />
          )}
          <CheckboxLabel>
            I agree to the <LinkText>Terms of Use</LinkText> and <LinkText>Privacy Policy</LinkText>
            .
          </CheckboxLabel>
        </CheckboxWrapper>

        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}

        <PrimaryButton onClick={handleRegister}>Create account</PrimaryButton>

        <BottomText>
          Already have an account? <LinkText onClick={() => navigate('/login')}>Log in</LinkText>
        </BottomText>
      </LeftContent>

      <RightContent>
        <Phone src={PhoneImg} alt="App preview" />
      </RightContent>
    </Page>
  );
}
