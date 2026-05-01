import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useStudents, Student } from '@/hooks/useStudents';
import { useFees } from '@/hooks/useFees';
import { useCallback, useState } from 'react';

export default function StudentProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const { fetchStudentById } = useStudents();
  const { fees, fetchFeesByStudent } = useFees();
  const [student, setStudent] = useState<Student | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchStudentById(Number(id)).then(setStudent);
        fetchFeesByStudent(Number(id));
      }
    }, [id])
  );

  const studentName = student ? `${student.first_name} ${student.last_name}` : (name ? String(name) : 'Loading...');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Actions */}
      <View style={[styles.topActions, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.outline} />
          <Text style={[styles.backText, { color: colors.outline }]}>Back to Students</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]}>
            <MaterialIcons name="edit" size={16} color={colors.onSurface} />
            <Text style={[styles.editButtonText, { color: colors.onSurface }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.messageButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.messageButtonText, { color: colors.onPrimary }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant }]}>
          <View style={styles.profileHeaderContent}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant, borderColor: colors.surfaceContainerHighest }]}>
              {student?.avatar_url ? (
                <Image 
                  source={{ uri: student.avatar_url }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="person" size={48} color={colors.outline} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.studentName, { color: colors.onSurface }]}>{studentName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.primaryFixed }]}>
                  <Text style={[styles.statusText, { color: colors.onPrimaryFixed }]}>Active</Text>
                </View>
              </View>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="class" size={16} color={colors.outline} />
                  <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{student?.class_name || 'Loading...'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="badge" size={16} color={colors.outline} />
                  <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>ID: STU-2023-{student?.id}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="call" size={16} color={colors.outline} />
                  <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{student?.phone || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          
          {/* Left Column Equivalent */}
          <View style={styles.leftCol}>
            {/* Attendance Stats Card */}
            <View style={[styles.card, styles.attendanceCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.secondary }]}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="fact-check" size={24} color={colors.secondary} />
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Attendance Overview</Text>
              </View>
              <Text style={[styles.cardSubtitle, { color: colors.outline }]}>CURRENT SEMESTER</Text>
              
              <View style={styles.rateRow}>
                <Text style={[styles.rateValue, { color: colors.secondary }]}>92%</Text>
                <Text style={[styles.rateLabel, { color: colors.onSurfaceVariant }]}>Present Rate</Text>
              </View>

              <View style={styles.statsList}>
                <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
                  <View style={styles.statLabelRow}>
                    <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
                    <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Present</Text>
                  </View>
                  <Text style={[styles.statValue, { color: colors.onSurface }]}>46 Days</Text>
                </View>
                <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
                  <View style={styles.statLabelRow}>
                    <View style={[styles.dot, { backgroundColor: colors.error }]} />
                    <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Absent</Text>
                  </View>
                  <Text style={[styles.statValue, { color: colors.onSurface }]}>4 Days</Text>
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
          </View>

          {/* Right Column Equivalent: Payment History */}
          <View style={[styles.card, styles.paymentCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
            <View style={[styles.paymentHeader, { borderBottomColor: colors.surfaceVariant }]}>
              <View>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Payment History</Text>
                </View>
                <Text style={[styles.cardSubtitle, { color: colors.outline, marginTop: 4 }]}>2023-2024 ACADEMIC YEAR</Text>
              </View>
              <TouchableOpacity>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.infoBanner, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant }]}>
              <MaterialIcons name="info" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                <Text style={{ fontWeight: '700' }}>Fee Rule:</Text> Fees are waived if monthly attendance is less than 10%.
              </Text>
            </View>

            {/* Table Mockup */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={styles.table}>
                <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceVariant }]}>
                  <Text style={[styles.th, { color: colors.outline, width: 100 }]}>MONTH</Text>
                  <Text style={[styles.th, { color: colors.outline, width: 80 }]}>ATTEN. %</Text>
                  <Text style={[styles.th, { color: colors.outline, width: 100 }]}>AMOUNT</Text>
                  <Text style={[styles.th, { color: colors.outline, width: 180 }]}>STATUS</Text>
                </View>

                {fees.map((fee) => (
                  <View key={fee.id} style={[styles.tableRow, { borderBottomColor: colors.surfaceVariant }]}>
                    <Text style={[styles.td, { color: colors.onSurface, width: 100 }]}>{fee.month.split(' ')[0]}</Text>
                    <Text style={[styles.td, { color: fee.status === 'waived' ? colors.error : colors.onSurface, width: 80 }]}>
                      {fee.status === 'waived' ? '15%' : '95%'}
                    </Text>
                    <Text style={[styles.td, { color: fee.status === 'waived' ? colors.outline : colors.onSurface, fontWeight: fee.status === 'waived' ? 'normal' : '500', textDecorationLine: fee.status === 'waived' ? 'line-through' : 'none', width: 100 }]}>
                      ${fee.amount.toFixed(2)}
                    </Text>
                    <View style={[styles.tdActions, { width: 180 }]}>
                      <View style={[styles.statusBadgeSmall, { backgroundColor: fee.status === 'paid' ? colors.secondaryContainer : fee.status === 'waived' ? colors.surfaceVariant : colors.errorContainer }]}>
                        <MaterialIcons name={fee.status === 'paid' ? 'check-circle' : fee.status === 'waived' ? 'money-off' : 'schedule'} size={12} color={fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.onSurfaceVariant : colors.onErrorContainer} />
                        <Text style={[styles.statusBadgeText, { color: fee.status === 'paid' ? colors.onSecondaryContainer : fee.status === 'waived' ? colors.onSurfaceVariant : colors.onErrorContainer, textTransform: 'capitalize' }]}>
                          {fee.status === 'due' ? `Due ${fee.due_date ? new Date(fee.due_date).getDate() : ''}` : fee.status}
                        </Text>
                      </View>
                      {fee.status === 'due' && (
                        <TouchableOpacity 
                          style={[styles.payButton, { backgroundColor: colors.primary }]}
                          onPress={() => router.push({ pathname: '/student/update-fees', params: { id, name: studentName } })}
                        >
                          <Text style={[styles.payButtonText, { color: colors.onPrimary }]}>Pay</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

              </View>
            </ScrollView>
          </View>

        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 4,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
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
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  payButtonText: {
    fontSize: 10,
  },
});
