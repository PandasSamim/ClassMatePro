import { AttendanceCard, AttendanceStatus } from '@/components/attendance/AttendanceCard';
import { SummaryCard } from '@/components/attendance/SummaryCard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAttendance } from '@/hooks/useAttendance';
import { useStudents } from '@/hooks/useStudents';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TopNavbar } from '@/components/dashboard/TopNavbar';

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  const { students, loading: studentsLoading, fetchStudents, classes, fetchClasses } = useStudents();
  const {
    attendance,
    loading: attendanceLoading,
    fetchAttendanceByDate,
    markAttendance,
    markAllStatus,
    getMonthlyExpectedSessions,
    setMonthlyExpectedSessions,
    fetchClassMonthlySummary
  } = useAttendance();

  const [currentMonthKey, setCurrentMonthKey] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const isLoading = studentsLoading || attendanceLoading;

  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [totalExpected, setTotalExpected] = useState('0');

  const loadData = useCallback(async () => {
    setOffset(0);
    await fetchClasses();
    await fetchStudents(selectedClassId || undefined, undefined, LIMIT, 0);

    if (viewMode === 'daily') {
      await fetchAttendanceByDate(selectedDate, selectedClassId || undefined, LIMIT, 0);
    } else {
      const expected = await getMonthlyExpectedSessions(selectedClassId || undefined, currentMonthKey);
      const summary = await fetchClassMonthlySummary(selectedClassId || undefined, currentMonthKey);
      
      setTotalExpected(expected > 0 ? expected.toString() : (summary[0]?.total_sessions || 0).toString());
      setMonthlyStats(summary);
    }
  }, [selectedClassId, selectedDate, viewMode, currentMonthKey, fetchClasses, fetchStudents, fetchAttendanceByDate, getMonthlyExpectedSessions, fetchClassMonthlySummary]);

  const handleLoadMore = () => {
    if (isLoading || viewMode !== 'daily' || students.length < LIMIT + offset) return;
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchStudents(selectedClassId || undefined, undefined, LIMIT, nextOffset);
    fetchAttendanceByDate(selectedDate, selectedClassId || undefined, LIMIT, nextOffset);
  };

  const handleUpdateExpected = async (val: string) => {
    setTotalExpected(val);
    if (!selectedClassId) return;
    const num = parseInt(val) || 0;
    await setMonthlyExpectedSessions(selectedClassId, currentMonthKey, num);
    const summary = await fetchClassMonthlySummary(selectedClassId, currentMonthKey);
    setMonthlyStats(summary);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      if (viewMode === 'daily') {
        setSelectedDate(`${year}-${month}-${day}`);
      } else {
        setCurrentMonthKey(`${year}-${month}`);
      }
    }
  };

  const navigateMonth = (direction: number) => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const date = new Date(y, m - 1 + direction, 1);
    
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (date > currentMonth) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonthKey(`${year}-${month}`);
  };

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (date > now) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getStatus = (studentId: number): AttendanceStatus => {
    const record = attendance.find(a => a.student_id === studentId);
    return (record?.status as AttendanceStatus) || null;
  };

  const handleStatusChange = async (studentId: number, status: AttendanceStatus) => {
    const success = await markAttendance(studentId, selectedDate, status as string);
    if (success) {
      fetchAttendanceByDate(selectedDate, selectedClassId || undefined);
    }
  };

  const handleBulkStatusChange = async (status: AttendanceStatus) => {
    if (students.length === 0) {
      Alert.alert("Info", "No students found in this class to mark.");
      return;
    }
    const studentIds = students.map(s => s.id);
    const success = await markAllStatus(studentIds, selectedDate, status as string);
    if (success) {
      await fetchAttendanceByDate(selectedDate, selectedClassId || undefined);
    } else {
      Alert.alert("Error", "Failed to update attendance records.");
    }
  };

  const currentClass = classes.find(c => c.id === selectedClassId);
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const dayOffCount = attendance.filter(a => a.status === 'dayOff').length;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMonthStr = todayStr.slice(0, 7);
  const isAtFutureEnd = viewMode === 'daily' ? selectedDate >= todayStr : currentMonthKey >= currentMonthStr;

  const AttendanceSkeleton = ({ colors }: { colors: any }) => (
    <View style={[styles.skeletonRow, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { width: '50%', height: 16, backgroundColor: colors.surfaceVariant }]} />
        <View style={[styles.skeletonLine, { width: '30%', height: 10, backgroundColor: colors.surfaceVariant }]} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.skeletonCircle, { backgroundColor: colors.surfaceVariant }]} />
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TopNavbar />
      <FlatList
        data={viewMode === 'daily' ? students : monthlyStats}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector}>
              <TouchableOpacity
                style={[
                  styles.classItem,
                  { backgroundColor: selectedClassId === null ? colors.primaryContainer : colors.surfaceContainerLowest },
                  selectedClassId === null && { borderColor: colors.primary, borderWidth: 1 }
                ]}
                onPress={() => setSelectedClassId(null)}
              >
                <Text style={[
                  styles.classItemText,
                  { color: selectedClassId === null ? colors.onPrimaryContainer : colors.outline }
                ]}>
                  All Classes
                </Text>
              </TouchableOpacity>

              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id.toString()}
                  style={[
                    styles.classItem,
                    { backgroundColor: selectedClassId === cls.id ? colors.primaryContainer : colors.surfaceContainerLowest },
                    selectedClassId === cls.id && { borderColor: colors.primary, borderWidth: 1 }
                  ]}
                  onPress={() => setSelectedClassId(cls.id)}
                >
                  <Text style={[
                    styles.classItemText,
                    { color: selectedClassId === cls.id ? colors.onPrimaryContainer : colors.outline }
                  ]}>
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.viewToggle, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant, borderWidth: 1 }]}>
              <TouchableOpacity 
                style={[styles.toggleBtn, viewMode === 'daily' && { backgroundColor: colors.primary }]} 
                onPress={() => setViewMode('daily')}
              >
                <Text style={[styles.toggleText, { color: viewMode === 'daily' ? colors.onPrimary : colors.outline }]}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, viewMode === 'monthly' && { backgroundColor: colors.primary }]} 
                onPress={() => setViewMode('monthly')}
              >
                <Text style={[styles.toggleText, { color: viewMode === 'monthly' ? colors.onPrimary : colors.outline }]}>Monthly Summary</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerContainer}>
              <View style={styles.headerTitles}>
                <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
                  {viewMode === 'daily' ? 'Daily Attendance' : 'Monthly Summary'}
                </Text>
                <Text style={[styles.pageSubtitle, { color: colors.outline }]}>{selectedClassId ? (currentClass?.name || 'Class') : 'All Classes'}</Text>
              </View>
              
              <View style={[styles.dateControls, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant, borderWidth: 1 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => viewMode === 'daily' ? navigateDate(-1) : navigateMonth(-1)}>
                  <MaterialIcons name="chevron-left" size={24} color={colors.outline} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.dateDisplay, { backgroundColor: colors.surface }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={16} color={colors.primary} />
                  <Text style={[styles.dateText, { color: colors.onSurface }]}>
                    {viewMode === 'daily' 
                      ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(currentMonthKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    }
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.iconButton, isAtFutureEnd && { opacity: 0.2 }]} 
                  onPress={() => viewMode === 'daily' ? navigateDate(1) : navigateMonth(1)}
                  disabled={isAtFutureEnd}
                >
                  <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={viewMode === 'daily' ? new Date(selectedDate) : new Date(currentMonthKey + '-01')}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>

            {viewMode === 'daily' && (
              <View style={styles.summaryGrid}>
                <SummaryCard label="STUDENTS" value={students.length} />
                <SummaryCard label="PRESENT" value={presentCount} />
                <SummaryCard label="ABSENT" value={absentCount} />
                <SummaryCard label="DAY OFF" value={dayOffCount} />
              </View>
            )}

            {viewMode === 'daily' && (
              <>
                <View style={[styles.quickActionsCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                  <View style={styles.quickHeader}>
                    <MaterialIcons name="auto-fix-high" size={14} color={colors.primary} />
                    <Text style={[styles.quickActionsTitle, { color: colors.outline }]}>BULK ATTENDANCE</Text>
                  </View>
                  <View style={styles.bulkActionsRow}>
                    <TouchableOpacity 
                      style={[styles.bulkButton, { backgroundColor: '#e6f4ea' }]}
                      onPress={() => handleBulkStatusChange('present')}
                    >
                      <MaterialIcons name="check-circle" size={18} color="#006c4b" />
                      <Text style={[styles.bulkButtonText, { color: '#006c4b' }]}>Present</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.bulkButton, { backgroundColor: '#fce8e6' }]}
                      onPress={() => handleBulkStatusChange('absent')}
                    >
                      <MaterialIcons name="cancel" size={18} color="#8b2500" />
                      <Text style={[styles.bulkButtonText, { color: '#8b2500' }]}>Absent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.bulkButton, { backgroundColor: '#f3e5f5' }]}
                      onPress={() => handleBulkStatusChange('dayOff')}
                    >
                      <MaterialIcons name="event-busy" size={18} color="#5e00cd" />
                      <Text style={[styles.bulkButtonText, { color: '#5e00cd' }]}>Day Off</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.listHeader}>
                  <Text style={[styles.listTitle, { color: colors.onSurface }]}>Student List</Text>
                </View>
              </>
            )}

            {viewMode === 'monthly' && (
              <View style={[
                styles.monthlyCard, 
                { 
                  backgroundColor: colors.surfaceContainerLowest, 
                  borderColor: colors.outlineVariant,
                  marginBottom: 0,
                  paddingBottom: 0,
                  borderBottomWidth: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }
              ]}>
                <View style={styles.monthlyInputRow}>
                  <Text style={[styles.inputLabel, { color: colors.outline }]}>EXPECTED SESSIONS</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderWidth: 1 }]}>
                    <MaterialIcons name="event-note" size={18} color={colors.primary} />
                    <TextInput
                      style={[styles.textInput, { color: colors.onSurface, textAlign: 'center' }]}
                      value={totalExpected}
                      onChangeText={handleUpdateExpected}
                      keyboardType="numeric"
                      placeholder="--"
                    />
                  </View>
                </View>

                <View style={styles.table}>
                  <View style={[styles.tableHeader, { borderBottomColor: colors.outlineVariant }]}>
                    <Text style={[styles.th, { color: colors.outline, flex: 2 }]}>STUDENT</Text>
                    <Text style={[styles.th, { color: colors.outline, flex: 0.8, textAlign: 'center' }]}>PRES</Text>
                    <Text style={[styles.th, { color: colors.outline, flex: 0.8, textAlign: 'center' }]}>TOT</Text>
                    <Text style={[styles.th, { color: colors.outline, flex: 1.2, textAlign: 'right' }]}>RATE</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        }
        keyExtractor={(item) => item.student_id?.toString() || item.id?.toString()}
        renderItem={({ item, index }) => {
          if (viewMode === 'daily') {
            const student = item;
            return (
              <View style={styles.studentCardsContainer}>
                <AttendanceCard 
                  name={`${student.first_name} ${student.last_name}`}
                  id={`CMP#${new Date().getFullYear().toString().slice(-2)}-${String(student.id).padStart(3, '0')}`}
                  avatarUrl={student.avatar_url}
                  avatarInitials={`${student.first_name[0]}${student.last_name[0]}`}
                  status={getStatus(student.id)}
                  onStatusChange={(status) => handleStatusChange(student.id, status)}
                />
              </View>
            );
          } else {
            const stats = item;
            const isLast = index === (monthlyStats.length - 1);
            const isOdd = index % 2 !== 0;
            const zebraColor = isOdd ? 'rgba(0,0,0,0.015)' : colors.background;
            
            return (
              <View style={[
                styles.tableRow, 
                { 
                  backgroundColor: zebraColor,
                  borderBottomColor: colors.outlineVariant,
                  paddingHorizontal: 20,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: colors.outlineVariant,
                  borderBottomWidth: isLast ? 1 : 1,
                  borderBottomLeftRadius: isLast ? 16 : 0,
                  borderBottomRightRadius: isLast ? 16 : 0,
                }
              ]}>
                <Text style={[styles.td, { color: colors.onSurface, flex: 2 }]} numberOfLines={1}>
                  {stats.student_name}
                </Text>
                <Text style={[styles.td, { color: colors.outline, flex: 0.8, textAlign: 'center' }]}>
                  {stats.attended}
                </Text>
                <Text style={[styles.td, { color: colors.outline, flex: 0.8, textAlign: 'center' }]}>
                  {stats.total_sessions}
                </Text>
                <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                  <View style={[styles.percentBadge, { backgroundColor: stats.percentage >= 90 ? '#e6f4ea' : stats.percentage < 50 ? '#fce8e6' : '#fef7e0' }]}>
                    <Text style={[styles.percentText, { color: stats.percentage >= 90 ? '#006c4b' : stats.percentage < 50 ? '#8b2500' : '#b06000' }]}>
                      {Math.round(stats.percentage)}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          }
        }}
        ListEmptyComponent={
          isLoading && (viewMode === 'daily' ? students.length === 0 : monthlyStats.length === 0) ? (
            <View style={{ gap: 12, paddingHorizontal: 16 }}>
              {[1, 2, 3, 4, 5].map(i => <AttendanceSkeleton key={i} colors={colors} />)}
            </View>
          ) : !isLoading && (viewMode === 'daily' ? students.length === 0 : monthlyStats.length === 0) ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="person-off" size={48} color={colors.outlineVariant} />
              <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>No records found.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && (viewMode === 'daily' ? students.length > 0 : monthlyStats.length > 0) ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : <View style={{ height: 40 }} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 12 },
  skeletonLine: { borderRadius: 4 },
  skeletonCircle: { width: 32, height: 32, borderRadius: 16 },
  headerContainer: { flexDirection: 'column', marginBottom: 32, gap: 16 },
  headerTitles: { marginBottom: 8 },
  pageTitle: { fontSize: 32, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 15, fontWeight: '500' },
  dateControls: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 4, alignSelf: 'flex-start' },
  iconButton: { padding: 8, borderRadius: 10 },
  dateDisplay: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginHorizontal: 4 },
  dateText: { marginLeft: 8, fontSize: 13, fontWeight: '700' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  listTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  quickActionsCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 32 },
  quickHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  quickActionsTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  bulkActionsRow: { flexDirection: 'row', gap: 8 },
  bulkButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  bulkButtonText: { fontSize: 10, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' },
  studentCardsContainer: { marginBottom: 1 },
  classSelector: { marginBottom: 24, flexDirection: 'row' },
  classItem: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, marginRight: 8, height: 44, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  classItemText: { fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyStateText: { fontSize: 16, fontWeight: '600' },
  viewToggle: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 24, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  monthlyCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  monthlyInputRow: { marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 52, borderRadius: 12, gap: 10 },
  textInput: { flex: 1, fontSize: 18, fontWeight: '700' },
  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, paddingHorizontal: 20 },
  th: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  td: { fontSize: 14, fontWeight: '600' },
  percentBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 54, alignItems: 'center' },
  percentText: { fontSize: 12, fontWeight: '800' },
});
