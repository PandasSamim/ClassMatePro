import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFees } from '@/hooks/useFees';
import { PaymentModal } from '@/components/student/PaymentModal';

export default function PaymentHistoryScreen() {
  const { id, name } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { fees, fetchFeesByStudent, loading, processPayment } = useFees();
  
  // Payment State
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (id) {
      fetchFeesByStudent(Number(id), 50);
    }
  }, [id]);

  const handleOpenPayment = (fee: any) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.due_amount.toString());
    setPaymentModalVisible(true);
  };

  const handleMakePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    const success = await processPayment(selectedFee.id, amount);
    if (success) {
      setPaymentModalVisible(false);
      fetchFeesByStudent(Number(id), 50);
      Alert.alert('Success', 'Payment processed successfully.');
    }
  };

  // Each column sized to its max content. Total = 120+50+85+70+60 = 385 + 5*12 padding = 445
  const COL = { month: 120, att: 50, status: 85, due: 70, action: 60 };
  const ROW_GAP = 12;
  const TABLE_WIDTH = COL.month + COL.att + COL.status + COL.due + COL.action + ROW_GAP * 4;

  const formatMonth = (monthKey: string) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const totalOutstanding = fees.reduce((sum, f) => sum + (f.status !== 'waived' ? f.due_amount : 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.customHeader, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.surfaceVariant }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Fee History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant }]}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.studentName, { color: colors.onSurface }]}>{name}</Text>
              <Text style={[styles.subtitle, { color: colors.outline }]}>Detailed Financial Statement</Text>
            </View>
            <View style={[styles.yearBadge, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.yearText, { color: colors.onPrimaryContainer }]}>2024-25</Text>
            </View>
          </View>

          <View style={[styles.totalBox, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
            <View>
              <Text style={[styles.totalLabel, { color: colors.onErrorContainer }]}>OUTSTANDING BALANCE</Text>
              <Text style={[styles.totalValue, { color: colors.onErrorContainer }]}>₹{totalOutstanding.toFixed(0)}</Text>
            </View>
            <MaterialIcons name="account-balance" size={40} color={colors.onErrorContainer} opacity={0.2} />
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={[styles.tableCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant }]}>
              <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant, gap: ROW_GAP, width: TABLE_WIDTH }]}>
                <Text style={[styles.th, { color: colors.outline, width: COL.month }]}>MONTH</Text>
                <Text style={[styles.th, { color: colors.outline, width: COL.att, textAlign: 'center' }]}>ATT%</Text>
                <Text style={[styles.th, { color: colors.outline, width: COL.status, textAlign: 'center' }]}>STATUS</Text>
                <Text style={[styles.th, { color: colors.outline, width: COL.due, textAlign: 'right' }]}>DUE</Text>
                <Text style={[styles.th, { color: colors.outline, width: COL.action, textAlign: 'right' }]}>ACTION</Text>
              </View>

              {fees.map((fee, index) => (
                <View key={fee.id} style={[styles.tableRow, { borderBottomColor: colors.surfaceVariant, backgroundColor: index % 2 === 0 ? 'transparent' : `${colors.primary}05`, gap: ROW_GAP, width: TABLE_WIDTH }]}>
                  <Text style={[styles.tdMonth, { color: colors.onSurface, width: COL.month }]} numberOfLines={1}>{formatMonth(fee.month)}</Text>

                  <Text style={[styles.tdAtt, { color: colors.outline, width: COL.att, textAlign: 'center' }]}>{Math.round((fee.attendance_rate || 0) * 100)}%</Text>

                  <View style={{ width: COL.status, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, { backgroundColor: fee.status === 'paid' ? colors.secondaryContainer : fee.status === 'waived' ? colors.surfaceVariant : colors.errorContainer, width: COL.status }]}>
                      <MaterialIcons 
                        name={fee.status === 'paid' ? 'check-circle' : fee.status === 'waived' ? 'money-off' : 'schedule'} 
                        size={12} 
                        color={fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.outline : colors.onErrorContainer} 
                      />
                      <Text style={[styles.statusText, { color: fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.outline : colors.onErrorContainer }]}>{fee.status}</Text>
                    </View>
                  </View>

                  <Text style={[styles.tdAmount, { color: fee.due_amount > 0 ? colors.error : colors.secondary, width: COL.due, textAlign: 'right' }]}>₹{fee.due_amount.toFixed(0)}</Text>

                  <View style={{ width: COL.action, alignItems: 'flex-end' }}>
                    {(fee.status === 'due' || fee.status === 'partial') ? (
                      <TouchableOpacity
                        style={[styles.payBtnSmall, { backgroundColor: colors.primary }]}
                        onPress={() => handleOpenPayment(fee)}
                      >
                        <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: '700' }}>Pay</Text>
                      </TouchableOpacity>
                    ) : (
                      <MaterialIcons name="info" size={18} color={colors.outlineVariant} style={{ paddingRight: 4 }} />
                    )}
                  </View>
                </View>
              ))}

              {fees.length === 0 && (
                <View style={styles.empty}>
                  <MaterialIcons name="history-toggle-off" size={48} color={colors.outlineVariant} />
                  <Text style={{ color: colors.outline, marginTop: 12 }}>No records found</Text>
                </View>
              )}
            </View>
        )}
      </ScrollView>

      <PaymentModal 
        visible={isPaymentModalVisible}
        colors={colors}
        selectedFee={selectedFee}
        paymentAmount={paymentAmount}
        onAmountChange={setPaymentAmount}
        onClose={() => setPaymentModalVisible(false)}
        onConfirm={handleMakePayment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  yearBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  tableCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  tdMonth: {
    fontSize: 13,
    fontWeight: '700',
  },
  tdAtt: {
    fontSize: 12,
    fontWeight: '500',
  },
  tdAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    width: 75,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  payBtnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  center: {
    padding: 60,
    alignItems: 'center',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  }
});
