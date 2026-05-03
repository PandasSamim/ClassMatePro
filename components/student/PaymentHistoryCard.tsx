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
  const totalOutstanding = fees.reduce((sum, f) => sum + (f.status !== 'waived' ? f.due_amount : 0), 0);

  return (
    <View style={[styles.card, styles.paymentCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
      <View style={[styles.paymentHeader, { borderBottomColor: colors.surfaceVariant }]}>
        <View>
          <View style={styles.cardHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Payment History</Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.outline, marginTop: 4 }]}>
            {new Date().getFullYear()}-{new Date().getFullYear() + 1} ACADEMIC YEAR
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.viewAllButton, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}
          onPress={onViewAll}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.infoBanner, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant }]}>
        <MaterialIcons name="info" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
          <Text style={{ fontWeight: '700' }}>Fee Rule:</Text> Fees are waived if monthly attendance is less than 10%.
        </Text>
      </View>

      {/* Total Due Summary */}
      <View style={[styles.totalDueContainer, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
        <View>
          <Text style={[styles.totalDueLabel, { color: colors.onErrorContainer }]}>TOTAL OUTSTANDING BALANCE</Text>
          <Text style={[styles.totalDueValue, { color: colors.onErrorContainer }]}>
            ₹{totalOutstanding.toFixed(0)}
          </Text>
        </View>
        <MaterialIcons name="account-balance" size={32} color={colors.onErrorContainer} opacity={0.3} />
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant }]}>
            <Text style={[styles.th, { color: colors.outline, width: 100 }]}>MONTH</Text>
            <Text style={[styles.th, { color: colors.outline, width: 60 }]}>ATT %</Text>
            <Text style={[styles.th, { color: colors.outline, width: 100 }]}>STATUS</Text>
            <Text style={[styles.th, { color: colors.outline, width: 70 }]}>DUE</Text>
            <Text style={[styles.th, { color: colors.outline, width: 80 }]}>ACTION</Text>
          </View>

          {fees.length > 0 ? fees.map((fee) => {
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

            return (
              <View key={fee.id} style={[styles.tableRow, { borderBottomColor: colors.surfaceVariant }]}>
                <Text style={[styles.td, { color: colors.onSurface, width: 100, fontSize: 13 }]}>{displayMonth}</Text>

                <Text style={[styles.td, { color: colors.onSurfaceVariant, width: 60, fontSize: 12 }]}>
                  {Math.round((fee.attendance_rate || 0) * 100)}%
                </Text>

                {/* Status Column */}
                <View style={{ width: 100 }}>
                  <View style={[styles.statusBadgeSmall, { alignSelf: 'flex-start', backgroundColor: fee.status === 'paid' ? colors.secondaryContainer : fee.status === 'waived' ? colors.surfaceVariant : fee.status === 'partial' ? colors.primaryContainer : colors.errorContainer }]}>
                    <MaterialIcons 
                      name={fee.status === 'paid' ? 'check-circle' : fee.status === 'waived' ? 'money-off' : fee.status === 'partial' ? 'adjust' : 'schedule'} 
                      size={12} 
                      color={fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.onSurfaceVariant : fee.status === 'partial' ? colors.onPrimaryContainer : colors.onErrorContainer} 
                    />
                    <Text style={[styles.statusBadgeText, { color: fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.onSurfaceVariant : fee.status === 'partial' ? colors.onPrimaryContainer : colors.onErrorContainer, textTransform: 'capitalize' }]}>
                      {fee.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.td, { color: fee.due_amount > 0 ? colors.error : colors.outline, width: 70, fontWeight: '700' }]}>
                  ₹{fee.due_amount.toFixed(0)}
                </Text>

                {/* Action Column */}
                <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
                  {(fee.status === 'due' || fee.status === 'partial') ? (
                    <TouchableOpacity
                      style={[styles.payButton, { backgroundColor: colors.primary }]}
                      onPress={() => onPayPress(fee)}
                    >
                      <Text style={[styles.payButtonText, { color: colors.onPrimary }]}>Pay</Text>
                    </TouchableOpacity>
                  ) : (
                    <MaterialIcons 
                      name={fee.status === 'paid' ? "check-circle" : "info"} 
                      size={20} 
                      color={fee.status === 'paid' ? colors.secondary : colors.outline} 
                    />
                  )}
                </View>
              </View>
            );
          }) : (
            <View style={{ padding: 24 }}>
              <Text style={{ color: colors.onSurfaceVariant }}>No payment records found.</Text>
            </View>
          )}

        </View>
      </ScrollView>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  totalDueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  totalDueLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalDueValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  table: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  td: {
    fontSize: 14,
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
