import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Fee, useFees } from '@/hooks/useFees';
import { Student, useStudents } from '@/hooks/useStudents';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function PaymentHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { fetchStudentById } = useStudents();
  const { fetchAllFeesByStudent, processPayment, calculateFees } = useFees();
  const [student, setStudent] = useState<Student | null>(null);
  const [allFees, setAllFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const studentId = Number(id);
    const studentData = await fetchStudentById(studentId);
    setStudent(studentData);
    
    // Ensure fees are calculated before fetching
    await calculateFees(studentId);
    
    const feesData = await fetchAllFeesByStudent(studentId);
    setAllFees(feesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleOpenPayment = (fee: Fee) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.due_amount.toString());
    setPaymentModalVisible(true);
  };

  const handleMakePayment = async () => {
    if (!selectedFee) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    if (amount > selectedFee.due_amount) {
      Alert.alert('Overpayment', 'Amount exceeds the remaining due balance.');
      return;
    }

    const success = await processPayment(selectedFee.id, amount);
    if (success) {
      setPaymentModalVisible(false);
      Alert.alert('Payment Successful', `Processed ₹${amount} for ${selectedFee.month}.`);
      loadData(); // Refresh list
    } else {
      Alert.alert('Error', 'Payment processing failed.');
    }
  };

  const formatMonth = (monthStr: string) => {
    let displayMonth = monthStr.replace('Invalid Date ', '');
    try {
      if (displayMonth.includes('-')) {
        const [year, month] = displayMonth.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1);
        if (!isNaN(monthDate.getTime())) {
          return monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
      }
    } catch (e) {
      console.warn("Format error:", e);
    }
    return displayMonth;
  };

  const renderFeeItem = ({ item }: { item: Fee }) => (
    <Animated.View 
      entering={FadeInUp.duration(400).delay(100)}
      style={[styles.feeCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant }]}
    >
      <View style={styles.feeHeader}>
        <View>
          <Text style={[styles.monthText, { color: colors.onSurface }]}>{formatMonth(item.month)}</Text>
          <Text style={[styles.statusText, { color: colors.outline }]}>
            Attendance: {Math.round((item.attendance_rate || 0) * 100)}%
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? colors.secondaryContainer : item.status === 'waived' ? colors.surfaceVariant : item.status === 'partial' ? colors.primaryContainer : colors.errorContainer }]}>
          <MaterialIcons name={item.status === 'paid' ? 'check-circle' : item.status === 'waived' ? 'money-off' : item.status === 'partial' ? 'adjust' : 'schedule'} size={14} color={item.status === 'paid' ? colors.onSecondaryContainer : item.status === 'waived' ? colors.onSurfaceVariant : item.status === 'partial' ? colors.onPrimaryContainer : colors.onErrorContainer} />
          <Text style={[styles.statusBadgeText, { color: item.status === 'paid' ? colors.onSecondaryContainer : item.status === 'waived' ? colors.onSurfaceVariant : item.status === 'partial' ? colors.onPrimaryContainer : colors.onErrorContainer }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.surfaceVariant }]} />

      <View style={styles.feeDetails}>
        <View style={styles.detailBox}>
          <Text style={[styles.detailLabel, { color: colors.outline }]}>TOTAL</Text>
          <Text style={[styles.detailValue, { color: colors.onSurface }]}>₹{item.total_amount.toFixed(0)}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailLabel, { color: colors.outline }]}>PAID</Text>
          <Text style={[styles.detailValue, { color: colors.secondary }]}>₹{item.paid_amount.toFixed(0)}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailLabel, { color: colors.outline }]}>DUE</Text>
          <Text style={[styles.detailValue, { color: item.due_amount > 0 ? colors.error : colors.outline, fontWeight: '700' }]}>₹{item.due_amount.toFixed(0)}</Text>
        </View>
      </View>

      {(item.status === 'due' || item.status === 'partial') && (
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }]}
          onPress={() => handleOpenPayment(item)}
        >
          <Text style={[styles.payButtonText, { color: colors.onPrimary }]}>Process Payment</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const SkeletonItem = () => (
    <View style={[styles.feeCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, opacity: 0.6 }]}>
      <View style={styles.feeHeader}>
        <View style={[styles.skeletonText, { width: 120, height: 16, backgroundColor: colors.surfaceVariant }]} />
        <View style={[styles.skeletonBadge, { backgroundColor: colors.surfaceVariant }]} />
      </View>
      <View style={[styles.divider, { backgroundColor: colors.surfaceVariant, marginVertical: 16 }]} />
      <View style={styles.feeDetails}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.detailBox}>
            <View style={[styles.skeletonText, { width: 40, height: 10, marginBottom: 8, backgroundColor: colors.surfaceVariant }]} />
            <View style={[styles.skeletonText, { width: 60, height: 16, backgroundColor: colors.surfaceVariant }]} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <Animated.View 
        entering={FadeInUp.duration(600).springify()}
        style={[styles.header, { 
          backgroundColor: colors.surfaceContainerLowest, 
          borderBottomColor: colors.surfaceVariant,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20 
        }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Payment History</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            {student ? `${student.first_name} ${student.last_name}` : 'Loading...'}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </Animated.View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.listContent}>
            <View style={[styles.listHeader, { borderBottomColor: colors.surfaceVariant, marginBottom: 20 }]}>
               <View style={[styles.skeletonText, { width: 150, height: 12, backgroundColor: colors.surfaceVariant }]} />
            </View>
            {[1, 2, 3, 4, 5].map(i => <SkeletonItem key={i} />)}
          </View>
        ) : (
          <FlatList
            data={allFees}
            renderItem={renderFeeItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListHeaderComponent={
              student && (
                <View style={[styles.listHeader, { borderBottomColor: colors.surfaceVariant }]}>
                   <Text style={[styles.listHeaderText, { color: colors.onSurfaceVariant }]}>Transaction Overview</Text>
                </View>
              )
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="history" size={64} color={colors.outlineVariant} />
                <Text style={[styles.emptyText, { color: colors.outline }]}>No payment history found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Payment Modal */}
      <Modal
        visible={isPaymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPaymentModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Make Payment</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.outline} />
              </TouchableOpacity>
            </View>

            {selectedFee && (
              <View style={styles.modalBody}>
                <View style={styles.feeInfoRow}>
                  <Text style={[styles.feeInfoLabel, { color: colors.onSurfaceVariant }]}>Month:</Text>
                  <Text style={[styles.feeInfoValue, { color: colors.onSurface }]}>
                    {formatMonth(selectedFee.month)}
                  </Text>
                </View>
                <View style={styles.feeInfoRow}>
                  <Text style={[styles.feeInfoLabel, { color: colors.onSurfaceVariant }]}>Remaining Due:</Text>
                  <Text style={[styles.feeInfoValue, { color: colors.error, fontWeight: '700' }]}>₹{selectedFee.due_amount.toFixed(0)}</Text>
                </View>

                <View style={styles.amountInputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>PAYMENT AMOUNT (₹)</Text>
                  <TextInput
                    style={[styles.paymentInput, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface, borderColor: colors.outlineVariant }]}
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    keyboardType="numeric"
                    autoFocus
                    placeholder="0.00"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={handleMakePayment}
                >
                  <Text style={[styles.confirmButtonText, { color: colors.onPrimary }]}>Confirm Payment</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  listHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  feeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  feeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    gap: 20,
  },
  feeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeInfoLabel: {
    fontSize: 14,
  },
  feeInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountInputWrapper: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  paymentInput: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  skeletonText: {
    height: 20,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
});
