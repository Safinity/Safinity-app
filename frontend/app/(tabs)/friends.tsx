import styled from 'styled-components/native';


const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.white};
`;

export default function FriendsScreen() {
  return (
    <Container>
      <Title>Friends</Title>
    </Container>
  );
}