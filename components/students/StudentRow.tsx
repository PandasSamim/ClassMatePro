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
  onDelete?: () => void;
}

export function StudentRow({ 
  name, avatarInitials, avatarUrl, avatarBg, avatarText, 
  status, statusVariant, statusOutlined, onPress, onMorePress, onDelete 
}: StudentRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: colors.surfaceVariant }]}
      onPress={onPress || (() => router.push({ pathname: '/student/[id]', params: { id: name.replace(/\s+/g, '-').toLowerCase(), name } }))}
    >
      <View style={styles.avatarColumn}>
        <Avatar 
          initials={avatarInitials} 
          imageUrl={avatarUrl} 
          size={32}
          backgroundColor={avatarBg}
          textColor={avatarText}
        />
      </View>

      <View style={styles.nameColumn}>
        <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{name}</Text>
      </View>
      
      <View style={styles.statusColumn}>
        <Badge label={status} variant={statusVariant} outlined={statusOutlined} />
      </View>
      
      <View style={styles.actionColumn}>
        {onDelete ? (
          <TouchableOpacity style={styles.moreButton} onPress={onDelete}>
            <MaterialIcons name="delete-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
            <MaterialIcons name="more-vert" size={20} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  avatarColumn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 1,
    paddingLeft: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusColumn: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionColumn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },
  moreButton: {
    padding: 8,
  },
});
