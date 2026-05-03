// Location: ClassMatePro/app/student/[id].tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAttendance } from '@/hooks/useAttendance';
import { useFees } from '@/hooks/useFees';
import { useResults } from '@/hooks/useResults';
import { Student, useStudents } from '@/hooks/useStudents';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id, name, avatarUrl } = useLocalSearchParams();

  const { fetchStudentById } = useStudents();
  const { fees, calculateFees, processPayment } = useFees();
  const { fetchStudentStats } = useAttendance();
  const { results, fetchResultsByStudent } = useResults();
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState({ present: 0, total: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Payment Modal State
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleOpenPayment = (fee: any) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.due_amount.toString());
    setPaymentModalVisible(true);
  };

  const handleMakePayment = async () => {
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
    } else {
      Alert.alert('Error', 'Payment processing failed.');
    }
  };

  const fetchMonthlyStats = useCallback(async (date: Date) => {
    if (!id) return;
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    const newStats = await fetchStudentStats(Number(id), startOfMonth, endOfMonth);
    setStats(newStats);
  }, [id, fetchStudentStats]);

  const hasCalculatedRef = useRef<number | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (id) {
        const studentId = Number(id);
        fetchStudentById(studentId).then(setStudent);
        fetchResultsByStudent(studentId);

        // Only calculate fees once per student per focus session
        if (hasCalculatedRef.current !== studentId) {
          calculateFees(studentId).then(() => {
            hasCalculatedRef.current = studentId;
          });
        }
      }

      return () => {
        // Optional: clear on blur if you want it to recalculate next time
        // hasCalculatedRef.current = null;
      };
    }, [id, calculateFees, fetchStudentById])
  );

  // Separate effect for attendance stats that responds to month navigation
  useEffect(() => {
    if (id) {
      fetchMonthlyStats(selectedMonth);
    }
  }, [id, selectedMonth, fetchMonthlyStats]);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    
    // Don't allow going to future months
    const today = new Date();
    if (newDate > new Date(today.getFullYear(), today.getMonth(), 1)) {
      return;
    }
    
    setSelectedMonth(newDate);
  };

  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return selectedMonth.getFullYear() === today.getFullYear() && 
           selectedMonth.getMonth() === today.getMonth();
  }, [selectedMonth]);

  const studentName = student ? `${student.first_name} ${student.last_name}` : (name ? String(name) : 'Student');
  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const resultChartData = useMemo(() => {
    const units = ['First Unit', 'Second Unit', 'Final Result'];
    return units.map(unit => {
      const unitResults = results.filter(r => r.term === unit);
      if (unitResults.length === 0) return { label: unit, value: 0 };

      const obtained = unitResults.reduce((sum, r) => sum + r.marks, 0);
      const total = unitResults.reduce((sum, r) => sum + r.total_marks, 0);
      const percentage = (obtained / total) * 100;

      return {
        label: unit,
        value: Math.round(percentage),
        frontColor: unit === 'Final Result' ? colors.primary : colors.secondary,
      };
    });
  }, [results, colors]);

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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Student Profile</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>{studentName}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: colors.surfaceContainerHigh }]}
            onPress={() => router.push({ pathname: '/add-student', params: { id } })}
          >
            <MaterialIcons name="edit" size={20} color={colors.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: colors.secondaryContainer, marginLeft: 12 }]}
            onPress={() => router.push({ pathname: '/student/[id]/results', params: { id, name: studentName } })}
          >
            <MaterialIcons name="assessment" size={20} color={colors.onSecondaryContainer} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* Profile Header Card */}
        <View style={[styles.profileCard, { padding: 0, overflow: 'hidden', borderWidth: 0 }]}>
          <LinearGradient
            colors={['#1e3a8a', '#1e40af', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24 }}
          >
            <View style={styles.profileHeaderContent}>
              <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}>
                {student?.avatar_url || avatarUrl ? (
                  <Image
                    source={{ uri: (student?.avatar_url || String(avatarUrl)) }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="person" size={48} color="white" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                {/* 1. Full Name */}
                <Text style={[styles.studentName, { color: 'white', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>
                  {studentName}
                </Text>

                {/* 2. Enroll Tag */}
                <View style={[styles.statusBadge, { backgroundColor: '#fcd34d', alignSelf: 'flex-start', marginBottom: 16 }]}>
                  <Text style={[styles.statusText, { color: '#78350f', fontWeight: '900' }]}>
                    {student?.status?.toUpperCase() || 'ENROLLED'}
                  </Text>
                </View>

                {/* 3, 4, 5. Class, ID, Number */}
                <View style={[styles.detailsGrid, { flexDirection: 'column', gap: 10 }]}>
                  <View style={styles.detailItemSimple}>
                    <View style={[styles.smallIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <MaterialIcons name="class" size={14} color="#34d399" />
                    </View>
                    <Text style={[styles.detailTextSimple, { color: 'rgba(255,255,255,0.9)' }]}>{student?.class_name || 'Class'}</Text>
                  </View>
                  <View style={styles.detailItemSimple}>
                    <View style={[styles.smallIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                      <MaterialIcons name="badge" size={14} color="#60a5fa" />
                    </View>
                    <Text style={[styles.detailTextSimple, { color: 'rgba(255,255,255,0.9)' }]}>
                      ID: {`CMP#${new Date().getFullYear().toString().slice(-2)}-${String(student?.id).padStart(3, '0')}`}
                    </Text>
                  </View>
                  <View style={styles.detailItemSimple}>
                    <View style={[styles.smallIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                      <MaterialIcons name="call" size={14} color="#fbbf24" />
                    </View>
                    <Text style={[styles.detailTextSimple, { color: 'rgba(255,255,255,0.9)' }]}>{student?.phone || 'No Phone'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>

          {/* Left Column Equivalent */}
          <View style={styles.leftCol}>
            {/* Attendance Stats Card */}
            <View style={[styles.card, styles.attendanceCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.secondary }]}>
              <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name="fact-check" size={24} color={colors.secondary} />
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Attendance</Text>
                </View>

                <View style={styles.monthNavigator}>
                  <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
                    <MaterialIcons name="chevron-left" size={20} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <Text style={[styles.monthLabel, { color: colors.onSurface }]}>
                    {selectedMonth.toLocaleString('default', { month: 'short' })}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigateMonth(1)} 
                    style={[styles.navBtn, isCurrentMonth && { opacity: 0.3 }]}
                    disabled={isCurrentMonth}
                  >
                    <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.cardSubtitle, { color: colors.outline }]}>
                {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
              </Text>

              <View style={styles.rateRow}>
                <Text style={[styles.rateValue, { color: colors.secondary }]}>{attendanceRate}%</Text>
                <Text style={[styles.rateLabel, { color: colors.onSurfaceVariant }]}>Present Rate</Text>
              </View>

              <View style={styles.statsList}>
                <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
                  <View style={styles.statLabelRow}>
                    <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
                    <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Present</Text>
                  </View>
                  <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats.present} Days</Text>
                </View>
                <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
                  <View style={styles.statLabelRow}>
                    <View style={[styles.dot, { backgroundColor: colors.error }]} />
                    <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Absent</Text>
                  </View>
                  <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats.total - stats.present} Days</Text>
                </View>
              </View>
            </View>

            {/* Guardian Info */}
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant }]}>
              <Text style={[styles.cardTitle, { color: colors.onSurface, marginBottom: 16 }]}>Primary Guardian</Text>
              <View style={styles.guardianItem}>
                <Text style={[styles.guardianLabel, { color: colors.outline }]}>NAME</Text>
                <Text style={[styles.guardianValue, { color: colors.onSurface }]}>{student?.guardian_name || 'N/A'}</Text>
              </View>
              <View style={styles.guardianItem}>
                <Text style={[styles.guardianLabel, { color: colors.outline }]}>CONTACT</Text>
                <Text style={[styles.guardianValue, { color: colors.onSurfaceVariant }]}>{student?.guardian_phone || 'N/A'}</Text>
              </View>
            </View>

            {/* Academic Overview Chart */}
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
              <View style={[styles.cardHeader, { marginBottom: 20 }]}>
                <MaterialIcons name="analytics" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Academic Overview</Text>
              </View>

              <View style={styles.chartContainer}>
                <BarChart
                  data={resultChartData}
                  barWidth={40}
                  noOfSections={4}
                  maxValue={100}
                  stepValue={25}
                  barBorderRadius={8}
                  isAnimated
                  animationDuration={800}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  yAxisTextStyle={{ color: colors.outline, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.outline, fontSize: 9, textAlign: 'center' }}
                  backgroundColor="transparent"
                  spacing={30}
                  disableScroll={true}
                  initialSpacing={15}
                />
              </View>

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
                  <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Units</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Final Result</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column Equivalent: Payment History */}
          <View style={[styles.card, styles.paymentCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
            <View style={[styles.paymentHeader, { borderBottomColor: colors.surfaceVariant }]}>
              <View>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Payment History</Text>
                </View>
                <Text style={[styles.cardSubtitle, { color: colors.outline, marginTop: 4 }]}>{new Date().getFullYear()}-{new Date().getFullYear() + 1} ACADEMIC YEAR</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push(`/student/payment-history/${id}`)}
                style={[styles.viewAllButton, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}
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
                  ₹{fees.reduce((sum, f) => sum + (f.status !== 'waived' ? f.due_amount : 0), 0).toFixed(0)}
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
                          <MaterialIcons name={fee.status === 'paid' ? 'check-circle' : fee.status === 'waived' ? 'money-off' : fee.status === 'partial' ? 'adjust' : 'schedule'} size={12} color={fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.onSurfaceVariant : fee.status === 'partial' ? colors.onPrimaryContainer : colors.onErrorContainer} />
                          <Text style={[styles.statusBadgeText, { color: fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.onSurfaceVariant : fee.status === 'partial' ? colors.onPrimaryContainer : colors.onErrorContainer, textTransform: 'capitalize' }]}>
                            {fee.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.td, { color: fee.due_amount > 0 ? colors.error : colors.outline, width: 70, fontWeight: '700' }]}>
                        ₹{fee.due_amount.toFixed(0)}
                      </Text>

                      {/* Action Column */}
                      <View style={{ width: 80 }}>
                        {(fee.status === 'due' || fee.status === 'partial') && (
                          <TouchableOpacity
                            style={[styles.payButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleOpenPayment(fee)}
                          >
                            <Text style={[styles.payButtonText, { color: colors.onPrimary }]}>Pay</Text>
                          </TouchableOpacity>
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

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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
                    {(() => {
                      try {
                        if (selectedFee.month.includes('-')) {
                          const [year, month] = selectedFee.month.split('-');
                          return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
                        }
                        return selectedFee.month;
                      } catch (e) {
                        return selectedFee.month;
                      }
                    })()}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 12,
  },
  studentName: {
    fontSize: 28,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItemSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallIconBg: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextSimple: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  bentoGrid: {
    gap: 24,
  },
  leftCol: {
    gap: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  attendanceCard: {
    borderTopWidth: 4,
  },
  paymentCard: {
    borderTopWidth: 4,
    padding: 0,
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
  rateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  rateValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  rateLabel: {
    fontSize: 14,
    paddingBottom: 6,
  },
  statsList: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  guardianItem: {
    marginBottom: 12,
  },
  guardianLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  guardianValue: {
    fontSize: 16,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 2,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
    marginBottom: 8, // Added space here
  },
  infoText: {
    fontSize: 14,
  },
  table: {
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 10,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  td: {
    fontSize: 14,
  },
  tdActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
    fontSize: 10,
  },
  payButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '700',
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
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    gap: 16,
  },
  feeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeInfoLabel: {
    fontSize: 14,
  },
  feeInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountInputWrapper: {
    marginTop: 16,
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  paymentInput: {
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '700',
  },
  confirmButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalDueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  totalDueLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalDueValue: {
    fontSize: 32,
    fontWeight: '800',
  },
});