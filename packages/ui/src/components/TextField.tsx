import { StyleSheet, TextInput, View } from 'react-native';

import { color, fontFace, palette, radius, spacing, touch, typography } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  testID?: string;
}

/** Labelled single-line input (e.g. renaming a basket). Large, friendly, no autocorrect surprises. */
export function TextField({ label, value, onChangeText, placeholder, maxLength, testID }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.text.secondary}
        maxLength={maxLength}
        autoCorrect={false}
        returnKeyType="done"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, alignSelf: 'stretch' },
  input: {
    minHeight: touch.child,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: palette.lavender,
    backgroundColor: color.background.raised,
    color: color.text.primary,
    fontFamily: fontFace['600'],
    fontSize: typography.body.fontSize,
  },
});
