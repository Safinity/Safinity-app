import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  flex: 1;
  flex-wrap: wrap;
`;

const Link = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
`;

export default function Checkbox({ checked, onToggle }: any) {
  return (
    <Row>
      <TouchableOpacity onPress={onToggle} style={{ marginRight: 8 }}>
        <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color="#E9D9F5" />
      </TouchableOpacity>

      <Label>
        I agree to the <Link>Terms of use</Link> and <Link>Privacy Policy</Link>.
      </Label>
    </Row>
  );
}
