import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AttendanceStatus } from '@/hooks/useAttendance';

export { AttendanceStatus };

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

  const getStatusConfig = () => {
    switch (status) {
      case 'present': return { color: '#006c4b', icon: 'check-circle' };
      case 'absent': return { color: '#8b2500', icon: 'cancel' };
      case 'dayOff': return { color: '#5e00cd', icon: 'event-busy' };
      default: return { color: colors.outline, icon: 'radio-button-unchecked' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
      <View style={styles.topRow}>
        <View style={styles.studentInfo}>
          <View style={[styles.avatarFrame, { borderColor: status ? config.color : 'rgba(0,0,0,0.05)' }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.initialsAvatar, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.initialsText, { color: colors.onSurfaceVariant }]}>{avatarInitials}</Text>
              </View>
            )}
            {status && (
              <View style={[styles.statusDot, { backgroundColor: config.color }]}>
                <MaterialIcons name={config.icon as any} size={10} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.id, { color: colors.outline }]}>{id}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => onStatusChange?.('present')}
            style={[styles.miniBtn, status === 'present' && { backgroundColor: '#e6f4ea', borderColor: '#006c4b' }]}
          >
            <MaterialIcons name="check" size={18} color={status === 'present' ? '#006c4b' : colors.outline} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onStatusChange?.('absent')}
            style={[styles.miniBtn, status === 'absent' && { backgroundColor: '#fce8e6', borderColor: '#8b2500' }]}
          >
            <MaterialIcons name="close" size={18} color={status === 'absent' ? '#8b2500' : colors.outline} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onStatusChange?.('dayOff')}
            style={[styles.miniBtn, status === 'dayOff' && { backgroundColor: '#f3e5f5', borderColor: '#5e00cd' }]}
          >
            <MaterialIcons name="event-busy" size={18} color={status === 'dayOff' ? '#5e00cd' : colors.outline} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarFrame: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    padding: 2,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  id: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});