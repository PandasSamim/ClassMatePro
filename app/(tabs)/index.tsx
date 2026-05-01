import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { FeeCollectionChart } from '@/components/dashboard/FeeCollectionChart';
import { AttendanceOverview } from '@/components/dashboard/AttendanceOverview';
import { FilterModal } from '@/components/dashboard/FilterModal';
import { useDashboard } from '@/hooks/useDashboard';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isFilterVisible, setFilterVisible] = useState(false);
  const { metrics, fetchMetrics } = useDashboard();

  useFocusEffect(
    useCallback(() => {
      fetchMetrics();
    }, [fetchMetrics])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.surfaceVariant }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="school" size={24} color={colors.primaryContainer} />
          <Text style={[styles.headerTitle, { color: colors.primaryContainer }]}>EduManager</Text>
        </View>
        <Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuznLsBkCkd741bRvszsn4y7Pk1tQHdn21AdAd57f0RZI7N5WO1l92fLpV9jgs6_C7lXjEtw1mQ3XMTcr8NHpvoOX3y1EBac0kR3cRCevKrAGFciNXgvT2J_2zd0TwTJU9tFjjd2ovRIjVwc6hjS2EOHwk8NBARGEys7aEE9JZEGBn-ON5uqGwwW32pt7L0_qpTxz89ITVSgLUSwapQAgZbrnRYtHVAfswaAFtugloeEXwi_Mjo7vdWbpqSFzQ6GHk4wUt2-RmCI4' }}
          style={[styles.avatar, { borderColor: colors.outlineVariant }]}
        />
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Dashboard Overview</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Monitor key academic and financial metrics.</Text>
        </View>

        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[styles.datePicker, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
            onPress={() => setFilterVisible(true)}
          >
            <View style={styles.datePickerLeft}>
              <MaterialIcons name="calendar-today" size={18} color={colors.onSurface} />
              <Text style={[styles.datePickerText, { color: colors.onSurface }]}>October 2023</Text>
            </View>
            <MaterialIcons name="expand-more" size={20} color={colors.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.reportButton, { backgroundColor: colors.primaryContainer }]}>
            <MaterialIcons name="download" size={18} color={colors.onPrimary} />
            <Text style={[styles.reportButtonText, { color: colors.onPrimary }]}>Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          <MetricCard 
            label="TOTAL FEES COLLECTED"
            value={`$${metrics.totalFeesCollected.toLocaleString()}`}
            iconName="account-balance-wallet"
            iconBgColor={colors.primaryFixed}
            iconColor={colors.onPrimaryFixed}
            trendIcon="trending-up"
            trendText="+8.2% from last month"
            trendColor={colors.secondary}
          />

          <MetricCard 
            label="TOTAL DUES"
            value={`$${metrics.totalDues.toLocaleString()}`}
            iconName="warning"
            iconBgColor={colors.errorContainer}
            iconColor={colors.onErrorContainer}
            trendIcon="trending-up"
            trendText="+2.1% needs attention"
            trendColor={colors.error}
            topBorderColor={colors.error}
          />

          <MetricCard 
            label="NUMBER OF STUDENTS"
            value={metrics.totalStudents.toString()}
            iconName="groups"
            iconBgColor={colors.tertiaryContainer}
            iconColor={colors.onTertiaryContainer}
            trendIcon="add"
            trendText="Latest enrollments synced"
            trendColor={colors.secondary}
          />

          <MetricCard 
            label="ATTENDANCE %"
            value={`${metrics.attendancePercentage.toFixed(1)}%`}
            iconName="check-circle"
            iconBgColor={colors.secondaryContainer}
            iconColor={colors.onSecondaryContainer}
            trendIcon="horizontal-rule"
            trendText="Stable this week"
            trendColor={colors.outline}
            topBorderColor={colors.secondary}
          />
        </View>

        <FeeCollectionChart />
        <AttendanceOverview />
        
        <View style={{height: 40}} />
      </ScrollView>

      <FilterModal 
        visible={isFilterVisible} 
        onClose={() => setFilterVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 170,
  },
  datePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reportButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  cardsContainer: {
    gap: 16,
  },
});
