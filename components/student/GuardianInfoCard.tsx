import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';

interface GuardianInfoCardProps {
  colors: ThemeColors;
  guardianName: string;
  guardianPhone: string;
}

export function GuardianInfoCard({
  colors,
  guardianName,
  guardianPhone,
}: GuardianInfoCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.tertiary }]}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="security" size={24} color={colors.tertiary} />
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Guardian</Text>
      </View>
      
      <View style={styles.infoList}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.outline }]}>NAME</Text>
          <Text style={[styles.infoValue, { color: colors.onSurface }]}>{guardianName || 'Not Set'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.outline }]}>PHONE</Text>
          <Text style={[styles.infoValue, { color: colors.onSurface }]}>{guardianPhone || 'Not Set'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderTopWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
