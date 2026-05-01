import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AvatarProps {
  imageUrl?: string;
  initials?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ imageUrl, initials, size = 48, backgroundColor, textColor, style }: AvatarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: backgroundColor || colors.surfaceVariant,
    borderColor: colors.outlineVariant,
  };

  if (imageUrl) {
    return (
      <Image 
        source={{ uri: imageUrl }}
        style={[styles.base, containerStyle, style as any]}
      />
    );
  }

  return (
    <View style={[styles.base, styles.initialsContainer, containerStyle, style]}>
      <Text style={[styles.initialsText, { color: textColor || colors.onSurfaceVariant, fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: '600',
  },
});
