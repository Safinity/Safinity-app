import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map Screen</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/teste-not-found')}
      >
        <Text style={styles.buttonText}>Ir para página inexistente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
