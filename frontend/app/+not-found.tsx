import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { GradientText } from '../components/ui/GradientText';

export default function NotFound() {
  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <Text style={styles.title}>Opss!</Text>
        <Text style={styles.text}>
          Unable to find the location{'\n'}of this page
        </Text>

        <GradientText text="404" style={styles.errorCode} />
      </View>

      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222734',
    padding: 24,
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },

  text: {
    fontSize: 16,
    color: '#C9CCD6',
    textAlign: 'center',
    marginBottom: 32,
  },

  errorCode: {
    fontSize: 164,
    fontWeight: '500',
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#8A4CCF',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 60,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
