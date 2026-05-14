import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';

interface PaymentHistoryCardProps {
  colors: ThemeColors;
  fees: any[];
  onPayPress: (fee: any) => void;
  onViewAll?: () => void;
}

export function PaymentHistoryCard({ colors, fees, onPayPress, onViewAll }: PaymentHistoryCardProps) {
  const getEffectiveStatus = (fee: any) => {
    if (fee.status === 'paid' || fee.status === 'waived') return fee.status;
    if ((fee.attendance_rate || 0) < 0.1 && (fee.paid_amount || 0) === 0) return 'waived';
    return fee.status;
  };

  const displayedFees = fees.slice(0, 3);

  const totalOutstanding = fees.reduce((sum, f) => {
    return sum + (getEffectiveStatus(f) !== 'waived' ? f.due_amount : 0);
  }, 0);

  return (
    <View style={[styles.card, styles.paymentCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
      <View style={[styles.paymentHeader, { borderBottomColor: colors.surfaceVariant }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Payment History (Last 3 Months)</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.viewAllButton, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}
          onPress={onViewAll}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>



      {/* Simple List */}
      <View style={styles.listContainer}>
        {displayedFees.length > 0 ? displayedFees.map((fee) => {
          let displayMonth = fee.month.replace('Invalid Date ', '');
          try {
            if (displayMonth.includes('-')) {
              const [year, month] = displayMonth.split('-');
              const monthDate = new Date(parseInt(year), parseInt(month) - 1);
              if (!isNaN(monthDate.getTime())) {
                const monthName = monthDate.toLocaleString('default', { month: 'long' });
                displayMonth = `${monthName} ${year}`;
              }
            }
          } catch (e) {
            console.warn("Format error:", e);
          }

          const monthNameOnly = displayMonth.split(' ')[0] || displayMonth;

          return (
            <View key={fee.id} style={[styles.simpleRow, { borderBottomColor: colors.surfaceVariant }]}>
              <View style={styles.simpleRowContent}>
                <Text style={[styles.simpleText, { color: colors.onSurface }]}>
                  {monthNameOnly} — Attendance: {Math.round((fee.attendance_rate || 0) * 100)}% — 
                </Text>
                <View style={[
                  styles.statusBadgeSmall, 
                  { backgroundColor: getEffectiveStatus(fee) === 'paid' ? colors.secondaryContainer : getEffectiveStatus(fee) === 'waived' ? colors.errorContainer : '#ffedd5', marginLeft: 6 }
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: getEffectiveStatus(fee) === 'paid' ? colors.onSecondaryContainer : getEffectiveStatus(fee) === 'waived' ? colors.error : '#c2410c' }
                  ]}>
                    {getEffectiveStatus(fee) === 'paid' ? 'PAID' : getEffectiveStatus(fee) === 'waived' ? 'NO_FEES' : 'DUE'}
                  </Text>
                </View>
              </View>

              {getEffectiveStatus(fee) !== 'waived' && getEffectiveStatus(fee) !== 'paid' && (
                <TouchableOpacity
                  style={[styles.payButton, { backgroundColor: colors.primary }]}
                  onPress={() => onPayPress(fee)}
                >
                  <Text style={[styles.payButtonText, { color: colors.onPrimary }]}>Pay</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }) : (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.onSurfaceVariant }}>No payment records found.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  paymentCard: {
    borderTopWidth: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  simpleRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  simpleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
