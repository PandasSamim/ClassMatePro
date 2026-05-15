import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

interface StudentRowProps {
  name: string;
  avatarUrl?: string;
  avatarInitials?: string;
  dueAmount?: string;
  onPress?: () => void;
  onDelete?: () => void;
  index?: number;
}

export function StudentRow({ 
  name, avatarUrl, avatarInitials, dueAmount = "₹0", onPress, onDelete, index = 0
}: StudentRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 40).duration(300)}
      layout={Layout.springify()}
    >
      <TouchableOpacity 
        style={[styles.container, { borderBottomColor: colors.surfaceContainerLow }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.leftArea}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primaryFixed }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <Text style={[styles.initials, { color: colors.onPrimaryFixed }]}>
                {avatarInitials || name.charAt(0)}
              </Text>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.dueText, { color: colors.error }]}>Due: {dueAmount}</Text>
          </View>
        </View>

        <View style={styles.rightArea}>
          <TouchableOpacity onPress={onDelete} style={[styles.deleteButton, { backgroundColor: colors.errorContainer }]}>
            <MaterialIcons name="delete-outline" size={18} color={colors.onErrorContainer} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  leftArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 14,
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
