import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCheckSquare, AiOutlineBorder } from 'react-icons/ai';

import LogoImg from '../assets/images/landing/logo.png';
import PhoneImg from '../assets/images/landing/phone.png';
import PrimaryButton from '../components/PrimaryButton';
import { FiUser, FiMail, FiEye, FiEyeOff, FiAtSign } from 'react-icons/fi';

const Page = styled.div`
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
  margin-bottom: 38px;
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
    <Page>
      <LeftContent>
        <Logo src={LogoImg} alt="Safinity Logo" />
        <Title>Create account</Title>
        <Subtitle>Join us!</Subtitle>

        <Form>
          <InputGroup>
            <Label>First Name</Label>
            <InputBox>
              <Input
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <FiUser size={20} color="#cfd3e0" />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Last Name</Label>
            <InputBox>
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
              <FiUser size={20} color="#cfd3e0" />
            </InputBox>
          </InputGroup>

          <InputGroup>
            <Label>Username</Label>
            <InputBox>
              <Input
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <FiAtSign size={20} color="#cfd3e0" />
            </InputBox>
          </InputGroup>

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

          <InputGroup>
            <Label>Confirm Password</Label>
            <InputBox>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />

              <IconButton type="button" onClick={() => setShowConfirmPassword(prev => !prev)}>
                {showConfirmPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
              </IconButton>
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
