import { router } from 'expo-router';
import styled from 'styled-components/native';
import { ImageBackground } from 'react-native';
// Ajustado para importar do ficheiro específico que criaste
import { StaticImages } from '../assets/images/landing';

import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TertiaryButton from '../components/TertiaryButton';

const Background = styled(ImageBackground).attrs({
  imageStyle: {
    objectFit: 'cover', // Melhora a renderização no browser
    objectPosition: 'center', // Garante que o foco da imagem seja o meio
  },
})`
  flex: 1;
  width: 100%;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  padding: 40px;
  /* Garantir que não existem parênteses extra aqui */
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export default function Landing() {
  return (
    <Background source={StaticImages.landingBg}>
      <Content>
        {/* Corrigida a rota do login para ser absoluta '/' */}
        <PrimaryButton title="Log in" onPress={() => router.push('/login')} />

        <SecondaryButton title="Create account" onPress={() => router.push('/register')} />

        <TertiaryButton title="Other options" onPress={() => console.log('Other options')} />
      </Content>
    </Background>
  );
}
