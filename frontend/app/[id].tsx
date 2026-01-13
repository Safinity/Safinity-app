import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24 }}> Perfil do utilizador: {id} </Text>
    </View>
  );
}
