import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AttendanceStatus = 'present' | 'absent' | 'dayOff' | null;

interface AttendanceCardProps {
  name: string;
  id: string;
  avatarUrl?: string;
  avatarInitials?: string;
  status: AttendanceStatus;
  onStatusChange?: (status: AttendanceStatus) => void;
}

export function AttendanceCard({ 
  name, id, avatarUrl, avatarInitials, status, onStatusChange 
}: AttendanceCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isAbsent = status === 'absent';

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      isAbsent && { backgroundColor: 'rgba(255, 218, 214, 0.1)', borderColor: colors.errorContainer }
    ]}>
      <View style={styles.info}>
        <Avatar 
          initials={avatarInitials} 
          imageUrl={avatarUrl} 
          size={48} 
        />
        <View style={styles.textInfo}>
          <Text style={[styles.name, { color: colors.onSurface }]}>{name}</Text>
          <Text style={[styles.id, { color: colors.onSurfaceVariant }]}>{id}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[
            styles.button, 
            status === 'present' ? [styles.buttonActive, { backgroundColor: colors.secondary, borderColor: colors.secondary }] : styles.buttonInactive
          ]}
          onPress={() => onStatusChange?.('present')}
        >
          <Text style={[styles.buttonText, status === 'present' ? { color: colors.onSecondary } : { color: colors.onSurfaceVariant }]}>
            Present
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            status === 'absent' ? [styles.buttonActive, { backgroundColor: colors.error, borderColor: colors.error }] : styles.buttonInactive
          ]}
          onPress={() => onStatusChange?.('absent')}
        >
          <Text style={[styles.buttonText, status === 'absent' ? { color: colors.onError } : { color: colors.onSurfaceVariant }]}>
            Absent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            status === 'dayOff' ? [styles.buttonActive, { backgroundColor: colors.primary, borderColor: colors.primary }] : styles.buttonInactive
          ]}
          onPress={() => onStatusChange?.('dayOff')}
        >
          <Text style={[styles.buttonText, status === 'dayOff' ? { color: colors.onPrimary } : { color: colors.onSurfaceVariant }]}>
            Day Off
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'column',
    gap: 16,
    ...(Platform.OS === 'web' ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } : {}),
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textInfo: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  id: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? { alignSelf: 'auto' } : {}),
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  buttonInactive: {
    borderColor: '#c3c5d7',
    backgroundColor: '#f8f9fa',
  },
  buttonActive: {
    // colors set dynamically
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
