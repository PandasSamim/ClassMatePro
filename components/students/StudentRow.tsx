import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

const AVATAR_COLORS = [
  { bg: '#003fb1', text: '#b5c4ff' },
  { bg: '#006c4b', text: '#9ff2cc' },
  { bg: '#5e00cd', text: '#d3baff' },
  { bg: '#8b2500', text: '#ffb594' },
  { bg: '#006874', text: '#82d3e0' },
];

interface StudentRowProps {
  name: string;
  avatarUrl?: string;
  dueAmount?: string;
  onPress?: () => void;
  onDelete?: () => void;
  index?: number;
}

export function StudentRow({ name, avatarUrl, dueAmount = '₹0', onPress, onDelete, index = 0 }: StudentRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const pal = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).duration(400)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: pal.bg }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.initials, { color: pal.text }]}>{initials}</Text>
          )}
        </View>

        {/* Name & Due */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{name}</Text>
          <View style={styles.duePill}>
            <View style={[styles.dueDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.dueText, { color: colors.error }]}>Due {dueAmount}</Text>
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: colors.errorContainer }]}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete-outline" size={18} color={colors.onErrorContainer} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
