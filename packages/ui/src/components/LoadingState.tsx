import { StyleSheet, View } from 'react-native';

import { spacing } from '../tokens.ts';
import { Mascot } from './Mascot.tsx';
import { Text } from './Text.tsx';

/** Calm loading state: Pino thinking + short message. Announced as busy. */
export function LoadingState({ message, testID }: { message: string; testID?: string }) {
  return (
    <View style={styles.wrap} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" testID={testID}>
      <Mascot emotion="thinking" size={140} animated />
      <Text variant="title3" align="center">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
});
