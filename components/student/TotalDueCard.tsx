import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface TotalDueCardProps {
  colors: ThemeColors;
  totalDue: number;
}

export function TotalDueCard({ colors, totalDue }: TotalDueCardProps) {
  return (
    <LinearGradient
      colors={totalDue > 0 ? ['#ef4444', '#b91c1c'] : ['#10b981', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.content}>
        <View style={styles.leftInfo}>
          <Text style={styles.label}>TOTAL OUTSTANDING</Text>
          <Text style={styles.amount}>₹{totalDue.toLocaleString('en-IN')}</Text>
        </View>
        
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={totalDue > 0 ? 'account-balance-wallet' : 'check-circle'} 
            size={32} 
            color="#ffffff" 
            style={{ opacity: 0.9 }}
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <MaterialIcons 
          name="info-outline" 
          size={14} 
          color="#ffffff" 
          style={{ opacity: 0.8 }} 
        />
        <Text style={styles.footerText}>
          {totalDue > 0 
            ? 'Total pending fees across all months' 
            : 'All fees are clear for this student'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftInfo: {
    flex: 1,
  },
  label: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.8,
    marginBottom: 4,
  },
  amount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
});
