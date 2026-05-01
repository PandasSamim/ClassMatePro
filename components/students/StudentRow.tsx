import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

interface StudentRowProps {
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
  avatarBg?: string;
  avatarText?: string;
  status: string;
  statusVariant: BadgeVariant;
  statusOutlined?: boolean;
  onPress?: () => void;
  onMorePress?: () => void;
}

export function StudentRow({ 
  name, avatarInitials, avatarUrl, avatarBg, avatarText, 
  status, statusVariant, statusOutlined, onPress, onMorePress 
}: StudentRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: colors.surfaceVariant }]}
      onPress={onPress || (() => router.push({ pathname: '/student/[id]', params: { id: name.replace(/\s+/g, '-').toLowerCase(), name } }))}
    >
      <View style={styles.info}>
        <Avatar 
          initials={avatarInitials} 
          imageUrl={avatarUrl} 
          size={32}
          backgroundColor={avatarBg}
          textColor={avatarText}
        />
        <Text style={[styles.name, { color: colors.onSurface }]}>{name}</Text>
      </View>
      
      <View style={styles.right}>
        <Badge label={status} variant={statusVariant} outlined={statusOutlined} />
        <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
          <MaterialIcons name="more-vert" size={20} color={colors.outline} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moreButton: {
    padding: 4,
    marginLeft: 12,
  },
});
