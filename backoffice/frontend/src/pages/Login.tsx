import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import LogoImg from '../assets/images/landing/logo.png';
import PhoneImg from '../assets/images/landing/phone.png';
import PrimaryButton from '../components/PrimaryButton';
import users from '../data/users.json';
import { FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

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
  align-items: flex-start;
  padding-top: 40px;
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
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.inactive};
  font-size: 20px;
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: 6px;
`;

const InputBox = styled.div`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Input = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
  height: 24px;
  line-height: 24px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cfd3e0;
  padding: 0;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-bottom: 12px;
`;

const ForgotText = styled.p`
  text-align: right;
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 24px;
`;

const BottomText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.inactive};
  margin-top: 24px;
`;

const LinkText = styled.span`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    navigate('/home');
  };

  return (
    <Page>
      <LeftContent>
        <Logo src={LogoImg} alt="Safinity Logo" />
        <Title>Log in</Title>
        <Subtitle>Welcome back!</Subtitle>

        <InputGroup>
          <Label>Email</Label>
          <InputBox>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <FiMail size={20} color="#cfd3e0" />
          </InputBox>
        </InputGroup>

        <InputGroup>
          <Label>Password</Label>
          <InputBox>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <IconButton type="button" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
            </IconButton>
          </InputBox>
        </InputGroup>

        <ForgotText>Forgot your password?</ForgotText>

        {error && <ErrorText>{error}</ErrorText>}

        <PrimaryButton onClick={handleLogin}>Log in</PrimaryButton>

        <BottomText>
          Don’t have an account?{' '}
          <LinkText onClick={() => navigate('/register')}>Create Account</LinkText>
        </BottomText>
      </LeftContent>

      <RightContent>
        <Phone src={PhoneImg} alt="App preview" />
      </RightContent>
    </Page>
  );
}
