import { Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  text: string;
  style?: any;
};

export function GradientText({ text, style }: Props) {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, styles.mask]}>
          {text}
        </Text>
      }
    >
      <LinearGradient
        colors={['#9242CC', '#E9D9F5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={[style, styles.transparent]}>
          {text}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    backgroundColor: 'transparent',
  },
  transparent: {
    opacity: 0,
  },
});
