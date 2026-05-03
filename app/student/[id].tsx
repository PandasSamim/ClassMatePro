// Location: ClassMatePro/app/student/[id].tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAttendance } from '@/hooks/useAttendance';
import { useFees } from '@/hooks/useFees';
import { useResults } from '@/hooks/useResults';
import { Student, useStudents } from '@/hooks/useStudents';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { StudentProfileHeader } from '@/components/student/StudentProfileHeader';
import { StudentHeroCard } from '@/components/student/StudentHeroCard';
import { AttendanceStatsCard } from '@/components/student/AttendanceStatsCard';
import { GuardianInfoCard } from '@/components/student/GuardianInfoCard';
import { AcademicOverviewCard } from '@/components/student/AcademicOverviewCard';
import { PaymentHistoryCard } from '@/components/student/PaymentHistoryCard';
import { PaymentModal } from '@/components/student/PaymentModal';

export default function StudentProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id, name, avatarUrl } = useLocalSearchParams();

  const { fetchStudentById } = useStudents();
  const { fees, calculateFees, processPayment, fetchFeesByStudent } = useFees();
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

        if (hasCalculatedRef.current !== studentId) {
          calculateFees(studentId).then(() => {
            hasCalculatedRef.current = studentId;
          });
        }
      }
    }, [id, calculateFees, fetchStudentById])
  );

  useEffect(() => {
    if (id) {
      fetchMonthlyStats(selectedMonth);
    }
  }, [id, selectedMonth, fetchMonthlyStats]);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    const today = new Date();
    if (newDate > new Date(today.getFullYear(), today.getMonth(), 1)) return;
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
      return {
        label: unit,
        value: Math.round((obtained / total) * 100),
        frontColor: unit === 'Final Result' ? colors.primary : colors.secondary,
      };
    });
  }, [results, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <StudentProfileHeader 
        colors={colors}
        studentName={studentName}
        studentId={id ? String(id) : ''}
        onEditPress={() => router.push({ pathname: '/add-student', params: { id } })}
        onResultsPress={() => router.push({ pathname: '/student/[id]/results', params: { id, name: studentName } })}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <StudentHeroCard 
          studentName={studentName}
          studentStatus={student?.status || 'Enrolled'}
          studentClass={student?.class_name || 'Class'}
          studentId={`CMP#${new Date().getFullYear().toString().slice(-2)}-${String(student?.id).padStart(3, '0')}`}
          studentPhone={student?.phone || 'No Phone'}
          avatarUrl={student?.avatar_url || (avatarUrl ? String(avatarUrl) : undefined)}
        />

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Left Column Equivalent */}
          <View style={styles.leftCol}>
            <AttendanceStatsCard 
              colors={colors}
              attendanceRate={attendanceRate}
              stats={stats}
              selectedMonth={selectedMonth}
              isCurrentMonth={isCurrentMonth}
              onNavigateMonth={navigateMonth}
            />

            <GuardianInfoCard 
              colors={colors}
              guardianName={student?.guardian_name || ''}
              guardianPhone={student?.guardian_phone || ''}
            />

            <AcademicOverviewCard 
              colors={colors}
              chartData={resultChartData}
            />
          </View>
        </View>

        <PaymentHistoryCard 
          colors={colors}
          fees={fees}
          onPayPress={handleOpenPayment}
          onViewAll={() => router.push({
            pathname: '/student/payment-history',
            params: { id: student?.id, name: student?.name }
          })}
        />
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 20,
  },
  bentoGrid: {
    gap: 16,
    marginBottom: 24,
  },
  leftCol: {
    gap: 16,
  },
  rightCol: {
    gap: 16,
  },
});