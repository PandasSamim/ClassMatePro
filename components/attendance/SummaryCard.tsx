import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryCardProps {
  label: string;
  value: string | number;
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  const getCardStyle = () => {
    switch (label.toUpperCase()) {
      case 'STUDENTS':
        return { bg: '#5e00cd', glow: '#d3baff', icon: 'groups' };
      case 'PRESENT':
        return { bg: '#006c4b', glow: '#9ff2cc', icon: 'check-circle' };
      case 'ABSENT':
        return { bg: '#8b2500', glow: '#ffb594', icon: 'cancel' };
      case 'DAY OFF':
        return { bg: '#575f71', glow: '#bfc6dc', icon: 'event-busy' };
      default:
        return { bg: '#5e00cd', glow: '#d3baff', icon: 'info' };
    }
  };

  const style = getCardStyle();

  return (
    <View style={[styles.card, { backgroundColor: style.bg }]}>
      <View style={[styles.glow, { backgroundColor: style.glow }]} />
      <View style={styles.iconBox}>
        <MaterialIcons name={style.icon as any} size={20} color={style.glow} />
      </View>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    height: 120,
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
});
