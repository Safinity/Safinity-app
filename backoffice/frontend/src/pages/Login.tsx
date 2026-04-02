import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import LogoImg from '../assets/images/landing/logo.png';
import PhoneImg from '../assets/images/landing/phone.png';
import PrimaryButton from '../components/PrimaryButton';
import users from '../data/users.json';
import { FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

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
    <>
      <Helmet>
        <title>Login | Safinity Backoffice</title>
      </Helmet>

      <Page>
        <LeftContent>
          <Logo src={LogoImg} alt="Safinity Logo" />
          <Title>Log in</Title>
          <Subtitle>Welcome back!</Subtitle>

          <LoginForm
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
            noValidate
          >
            <InputGroup>
              <Label htmlFor="email">Email</Label>
              <InputBox>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  autoComplete="email"
                  onChange={e => setEmail(e.target.value)}
                />
                <FiMail size={20} color="#cfd3e0" aria-hidden="true" />
              </InputBox>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <InputBox>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                />

                <IconButton
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FiEyeOff size={22} aria-hidden="true" />
                  ) : (
                    <FiEye size={22} aria-hidden="true" />
                  )}
                </IconButton>
              </InputBox>
            </InputGroup>

            <ForgotButton type="button" onClick={() => navigate('/forgot-password')}>
              Forgot your password?
            </ForgotButton>

            {error && <ErrorText role="alert">{error}</ErrorText>}

            <PrimaryButton type="submit">Log in</PrimaryButton>
          </LoginForm>

          <BottomText>
            Don’t have an account?
            <LinkText type="button" onClick={() => navigate('/register')}>
              Create Account
            </LinkText>
          </BottomText>
        </LeftContent>

        <RightContent>
          <Phone src={PhoneImg} alt="" aria-hidden="true" />
        </RightContent>
      </Page>
    </>
  );
}

const Page = styled.main`
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const Subtitle = styled.h2`
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

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    border-radius: 4px;
  }
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

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    border-radius: 4px;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-bottom: 12px;
`;

const ForgotButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  text-align: right;
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 24px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    border-radius: 4px;
  }
`;

const BottomText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.inactive};
  margin-top: 24px;
`;

const LinkText = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    border-radius: 4px;
  }
`;
