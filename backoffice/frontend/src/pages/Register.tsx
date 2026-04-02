import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import LogoImg from '../assets/images/landing/logo.png';
import PhoneImg from '../assets/images/landing/phone.png';
import PrimaryButton from '../components/PrimaryButton';
import { FiUser, FiMail, FiEye, FiEyeOff, FiAtSign } from 'react-icons/fi';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    navigate('/home');
  };

  return (
    <>
      <Helmet>
        <title>Register | Safinity Backoffice</title>
      </Helmet>

      {/* FIX 1.3.1: <main> semântico */}
      <Page>
        <LeftContent>
          <Logo src={LogoImg} alt="Safinity" />
          <Title>Create account</Title>
          <Subtitle>Join us!</Subtitle>

          {/* FIX 2.1.1 / 4.1.2: <form> nativo */}
          <RegisterForm
            onSubmit={e => {
              e.preventDefault();
              handleRegister();
            }}
            noValidate
          >
            <InputGroup>
              {/* FIX 1.3.1 / 4.1.2: htmlFor + id em todos os campos */}
              <Label htmlFor="firstName">First Name</Label>
              <InputBox>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={firstName}
                  autoComplete="given-name"
                  onChange={e => setFirstName(e.target.value)}
                />
                {/* FIX 1.1.1: ícones decorativos ocultos */}
                <FiUser size={20} color="#cfd3e0" aria-hidden="true" />
              </InputBox>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="lastName">Last Name</Label>
              <InputBox>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={lastName}
                  autoComplete="family-name"
                  onChange={e => setLastName(e.target.value)}
                />
                <FiUser size={20} color="#cfd3e0" aria-hidden="true" />
              </InputBox>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="username">Username</Label>
              <InputBox>
                <Input
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={username}
                  autoComplete="username"
                  onChange={e => setUsername(e.target.value)}
                />
                <FiAtSign size={20} color="#cfd3e0" aria-hidden="true" />
              </InputBox>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="email">Email</Label>
              <InputBox>
                <Input
                  id="email"
                  name="email"
                  type="email"
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
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  autoComplete="new-password"
                  onChange={e => setPassword(e.target.value)}
                />
                {/* FIX 4.1.2: aria-label no botão de password */}
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

            <InputGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <InputBox>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <IconButton
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={22} aria-hidden="true" />
                  ) : (
                    <FiEye size={22} aria-hidden="true" />
                  )}
                </IconButton>
              </InputBox>
            </InputGroup>

            {/* FIX 2.1.1 / 4.1.2: checkbox nativo em vez de <div> clicável */}
            <CheckboxWrapper>
              <Checkbox
                id="terms"
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
              />
              <CheckboxLabel htmlFor="terms">
                I agree to the {/* FIX 2.1.1: <button> em vez de <span> clicável */}
                <TermsButton type="button" onClick={() => navigate('/terms')}>
                  Terms of Use
                </TermsButton>{' '}
                and{' '}
                <TermsButton type="button" onClick={() => navigate('/privacy')}>
                  Privacy Policy
                </TermsButton>
                .
              </CheckboxLabel>
            </CheckboxWrapper>

            {/* FIX 4.1.3: role="alert" para anúncio automático */}
            {error && <ErrorText role="alert">{error}</ErrorText>}

            <PrimaryButton type="submit">Create account</PrimaryButton>
          </RegisterForm>

          <BottomText>
            Already have an account? {/* FIX 2.1.1: <button> em vez de <span> */}
            <LinkButton type="button" onClick={() => navigate('/login')}>
              Log in
            </LinkButton>
          </BottomText>
        </LeftContent>

        <RightContent>
          {/* FIX 1.1.1: imagem decorativa */}
          <Phone src={PhoneImg} alt="" aria-hidden="true" />
        </RightContent>
      </Page>
    </>
  );
}

/* FIX 1.3.1: <main> semântico */
const Page = styled.main`
  min-height: 100vh;
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
  max-height: 100vh;
  object-fit: contain;
`;

const Logo = styled.img`
  margin-top: 70px;
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

/* FIX 2.1.1 / 4.1.2: <form> nativo */
const RegisterForm = styled.form`
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
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

/* FIX 2.1.1: foco visível */
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

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
`;

/* FIX 2.1.1 / 4.1.2: checkbox nativo */
const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.palette.primary.normal};
  flex-shrink: 0;
  margin-top: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    outline-offset: 2px;
  }
`;

/* FIX: label associado ao checkbox */
const CheckboxLabel = styled.label`
  color: ${({ theme }) => theme.colors.inactive};
  flex: 1;
  line-height: 1.4;
`;

/* FIX 2.1.1: <button> em vez de <span> para Terms/Privacy */
const TermsButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    border-radius: 4px;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

const BottomText = styled.p`
  color: ${({ theme }) => theme.colors.inactive};
  text-align: center;
  margin-top: 24px;
  margin-bottom: 38px;
`;

/* FIX 2.1.1: <button> em vez de <span> para Log in */
const LinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.palette.primary.normal};
    border-radius: 4px;
  }
`;
