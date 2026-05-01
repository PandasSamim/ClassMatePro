import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SummaryCard } from '@/components/attendance/SummaryCard';
import { AttendanceCard, AttendanceStatus } from '@/components/attendance/AttendanceCard';

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [aliceStatus, setAliceStatus] = useState<AttendanceStatus>('present');
  const [brianStatus, setBrianStatus] = useState<AttendanceStatus>('absent');
  const [charlieStatus, setCharlieStatus] = useState<AttendanceStatus>('present');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header & Date Controls */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTitles}>
            <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Daily Attendance</Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Class 10-A • Mathematics</Text>
          </View>
          
          <View style={[styles.dateControls, { backgroundColor: colors.surfaceContainer }]}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="chevron-left" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            
            <View style={[styles.dateDisplay, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="calendar-today" size={16} color={colors.onSurface} />
              <Text style={[styles.dateText, { color: colors.onSurface }]}>Today, Oct 24</Text>
            </View>
            
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Summary */}
        <View style={styles.summaryGrid}>
          <SummaryCard 
            label="TOTAL ENROLLED"
            value={32}
            valueColor={colors.onSurface}
          />
          <SummaryCard 
            label="PRESENT"
            value={28}
            topBorderColor={colors.secondary}
            valueColor={colors.secondary}
          />
          <SummaryCard 
            label="ABSENT"
            value={4}
            topBorderColor={colors.error}
            valueColor={colors.error}
          />
          <SummaryCard 
            label="DAY OFF"
            value={0}
            topBorderColor={colors.primary}
            valueColor={colors.primary}
          />
        </View>

        {/* Student List Header */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.onSurface }]}>Student List</Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity style={[styles.bulkButton, { backgroundColor: colors.secondaryContainer, borderColor: colors.secondaryContainer }]}>
              <Text style={[styles.bulkButtonText, { color: colors.onSecondaryContainer }]}>Mark All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bulkButton, { backgroundColor: colors.errorContainer, borderColor: colors.errorContainer }]}>
              <Text style={[styles.bulkButtonText, { color: colors.onErrorContainer }]}>Mark All Day Off</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student Cards List */}
        <View style={styles.studentCardsContainer}>
          <AttendanceCard 
            name="Alice Anderson"
            id="ID: 2024-001"
            avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAVEFl_WGhBQG3NrgayHqOh3btkZdGDhXzAbyqQ3t1h1WqD35CxbLQQnyVJeIVUPbF581Jmm8B3-bJPlh6_s-rRsBHP0wbl0Im6lQd-A39EgSTJ7CgUUnCdcQUiI4lbNIzAhtcrxHBKtXqZtocNiGaZbMeEDrKWnc0M7RW9AP9VLxF9aI4K3yCeSLYWRpu_SzGG8lST0_g3vh9xwTDuOgptQio4qiML2jGzctH3AeGuBQzqlyT3PXVKfgL9ds6kyhupNz30we40kW0"
            status={aliceStatus}
            onStatusChange={setAliceStatus}
          />

          <AttendanceCard 
            name="Brian Carter"
            id="ID: 2024-002"
            avatarInitials="BC"
            status={brianStatus}
            onStatusChange={setBrianStatus}
          />

          <AttendanceCard 
            name="Charlie Davis"
            id="ID: 2024-003"
            avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBGnpjBd5r_n7RLEnn7XFAOahjnOSWD7IDG1qjhC07K7BmLl_gXTNd6JtEYLJ7_Pc27hovxmqv0QeqKIR1XEAeWaEFv-vI8qeoVi7wVG8q4rH-a0NR2V-tHLWhacEe6UI97KVfm-gHOOpcloHznydfFS44gBd0GujmdzbA3bd-TZL_4s4JKqs9P2eaLgpqtc0iIqcNB9ICBwhb-SeAYCs4f7mSXK-6TshxhS-7UGx_zOdlL_zdLtxTTDFtLHJxi-T9LedqfxmXvJrI"
            status={charlieStatus}
            onStatusChange={setCharlieStatus}
          />
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
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'column',
    marginBottom: 32,
    gap: 16,
    ...(Platform.OS === 'web' ? { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } : {}),
  },
  headerTitles: {
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  listHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
    ...(Platform.OS === 'web' ? { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } : {}),
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bulkButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  studentCardsContainer: {
    gap: 12,
  },
});
