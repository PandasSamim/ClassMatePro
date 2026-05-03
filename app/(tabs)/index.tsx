import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { FeeCollectionChart } from '@/components/dashboard/FeeCollectionChart';
import { AttendanceOverview } from '@/components/dashboard/AttendanceOverview';
import { FilterModal } from '@/components/dashboard/FilterModal';
import { useDashboard } from '@/hooks/useDashboard';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useSettings } from '@/hooks/useSettings';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { TopNavbar } from '@/components/dashboard/TopNavbar';

function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{year: number, month: number} | null>(null);
  const { metrics, chartData, attendanceBreakdown, fetchMetrics, loadingMetrics, loadingCharts, loadingAttendance } = useDashboard();
  const { settings, fetchSettings } = useSettings();
 
  useFocusEffect(
    useCallback(() => {
      fetchMetrics(undefined, activeFilter?.year, activeFilter?.month);
      fetchSettings();
    }, [fetchMetrics, fetchSettings, activeFilter])
  );
 
  const handleApplyFilter = (year: number | undefined, month: number | undefined) => {
    if (year === undefined || month === undefined) {
      setActiveFilter(null);
      fetchMetrics(undefined, undefined, undefined);
    } else {
      setActiveFilter({ year, month });
      fetchMetrics(undefined, year, month);
    }
  };
 
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const filterLabel = activeFilter 
    ? `${monthNames[activeFilter.month - 1]} ${activeFilter.year}`
    : 'All Time';
 
  const handleDownloadReport = async () => {
    try {
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Dashboard Report</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      @page {
        margin: 20mm;
      }
      
      body { 
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        color: #1a1c1e;
        background-color: #fff;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 40px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f1f5f9;
      }
      
      .brand-box h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a56db;
        letter-spacing: -0.02em;
      }
      
      .brand-box p {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.1em;
      }
      
      .report-info { text-align: right; }
      .report-info p { font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }
      .report-info .date { font-weight: 700; color: #0f172a; font-size: 14px; }
      
      .hero-section {
        background: #1a56db;
        background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
        border-radius: 16px;
        padding: 40px;
        color: white;
        margin-bottom: 40px;
        text-align: center;
      }
      
      .hero-title { font-size: 12px; font-weight: 700; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
      .hero-period { font-size: 36px; font-weight: 800; }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 40px;
      }
      
      .metric-card {
        padding: 24px;
        border-radius: 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .metric-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
      .metric-value { font-size: 24px; font-weight: 700; color: #0f172a; }
      
      .section-header { 
        font-size: 16px; 
        font-weight: 700; 
        color: #0f172a; 
        margin-bottom: 24px; 
        padding-left: 12px;
        border-left: 4px solid #1a56db;
      }
      
      .table-container {
        flex-grow: 1;
      }
      
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; font-size: 11px; font-weight: 700; color: #64748b; padding: 12px 16px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; }
      td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      
      .class-name { font-weight: 600; color: #0f172a; }
      .percentage-box { display: flex; align-items: center; gap: 15px; }
      .percentage-text { font-weight: 700; color: #1a56db; width: 50px; text-align: right; }
      
      .progress-bg { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
      .progress-fill { height: 100%; border-radius: 3px; background: #1a56db; }
      
      .footer {
        margin-top: auto;
        padding-top: 30px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #94a3b8;
        font-size: 10px;
        font-weight: 600;
      }
      
      @media print {
        .hero-section { -webkit-print-color-adjust: exact; }
        .progress-fill { -webkit-print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="brand-box">
        <h1>ClassMatePro</h1>
        <p>Academic Excellence Manager</p>
      </div>
      <div class="report-info">
        <p>GENERATED ON</p>
        <p class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </div>
    
    <div class="hero-section">
      <div class="hero-title">Dashboard Overview Report</div>
      <div class="hero-period">${filterLabel}</div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Fees Collected</div>
        <div class="metric-value">₹${metrics.totalFeesCollected.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Outstanding Dues</div>
        <div class="metric-value" style="color: #ba1a1a;">₹${metrics.totalDues.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Active Students</div>
        <div class="metric-value">${metrics.totalStudents}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Average Attendance</div>
        <div class="metric-value">${metrics.attendancePercentage.toFixed(1)}%</div>
      </div>
    </div>

    <div class="attendance-section">
      <div class="section-header">Class-wise Attendance Analysis</div>
      <table>
        <thead>
          <tr>
            <th>CLASS / GRADE</th>
            <th>ATTENDANCE PERFORMANCE</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceBreakdown.map(b => `
            <tr>
              <td class="class-name">${b.grade}</td>
              <td>
                <div class="percentage-box">
                  <span class="percentage-text">${b.percentage.toFixed(1)}%</span>
                  <div class="progress-bg">
                    <div class="progress-fill" style="width: ${b.percentage}%"></div>
                  </div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div>&copy; ${new Date().getFullYear()} ClassMatePro School Management</div>
      <div>CONFIDENTIAL DOCUMENT</div>
    </div>
  </body>
</html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      // Rename the file to something meaningful
      const fileName = `ClassMatePro_Report_${filterLabel.replace(/\s+/g, '_')}.pdf`;
      const finalUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: uri,
        to: finalUri
      });

      await Sharing.shareAsync(finalUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Download ${filterLabel} Report`,
        UTI: 'com.adobe.pdf'
      });
    } catch (e) {
      console.error('PDF generation failed:', e);
      Alert.alert("Error", "Failed to generate PDF report.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNavbar />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.pageHeader}
        >
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Dashboard Overview</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Monitor key academic and financial metrics.</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.filtersRow}
        >
          <TouchableOpacity 
            style={[styles.datePicker, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
            onPress={() => setFilterVisible(true)}
          >
            <View style={styles.datePickerLeft}>
              <MaterialIcons name="calendar-today" size={18} color={colors.onSurface} />
              <Text style={[styles.datePickerText, { color: colors.onSurface }]}>{filterLabel}</Text>
            </View>
            <MaterialIcons name="expand-more" size={20} color={colors.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.reportButton, { backgroundColor: colors.primaryContainer }]}
            onPress={handleDownloadReport}
          >
            <MaterialIcons name="download" size={18} color={colors.onPrimary} />
            <Text style={[styles.reportButtonText, { color: colors.onPrimary }]}>Report</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.cardsContainer}>
          {loadingMetrics ? (
            <View style={{ padding: 40 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <MetricCard 
                label="TOTAL FEES COLLECTED"
                value={`₹${metrics.totalFeesCollected.toLocaleString()}`}
                iconName="account-balance-wallet"
                iconBgColor={colors.primaryFixed}
                iconColor={colors.onPrimaryFixed}
                trendIcon="trending-up"
                trendText="Synchronized"
                trendColor={colors.secondary}
                delay={300}
              />

              <MetricCard 
                label="TOTAL DUES"
                value={`₹${metrics.totalDues.toLocaleString()}`}
                iconName="warning"
                iconBgColor={colors.errorContainer}
                iconColor={colors.onErrorContainer}
                trendIcon="warning"
                trendText={`${metrics.totalDues > 0 ? 'Pending dues' : 'No dues'}`}
                trendColor={metrics.totalDues > 0 ? colors.error : colors.secondary}
                topBorderColor={metrics.totalDues > 0 ? colors.error : colors.secondary}
                delay={400}
              />

              <MetricCard 
                label="NUMBER OF STUDENTS"
                value={metrics.totalStudents.toString()}
                iconName="groups"
                iconBgColor={colors.tertiaryContainer}
                iconColor={colors.onTertiaryContainer}
                trendIcon="sync"
                trendText="Latest enrollments"
                trendColor={colors.secondary}
                delay={500}
              />

              <MetricCard 
                label="ATTENDANCE %"
                value={`${metrics.attendancePercentage.toFixed(1)}%`}
                iconName="check-circle"
                iconBgColor={colors.secondaryContainer}
                iconColor={colors.onSecondaryContainer}
                trendIcon="info"
                trendText="Monthly update"
                trendColor={colors.outline}
                topBorderColor={colors.secondary}
                delay={600}
              />
            </>
          )}
        </View>

        {loadingCharts ? (
          <View style={{ padding: 40, height: 200, justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FeeCollectionChart 
            data={chartData} 
            delay={700}
          />
        )}

        {loadingAttendance ? (
          <View style={{ padding: 40, height: 150, justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <AttendanceOverview data={attendanceBreakdown} delay={800} />
        )}
        
        <View style={{height: 40}} />
      </ScrollView>

      <FilterModal 
        visible={isFilterVisible} 
        onClose={() => setFilterVisible(false)} 
        onApply={handleApplyFilter}
        initialYear={activeFilter?.year.toString()}
        initialMonth={activeFilter?.month.toString()}
      />
    </View>
  );
}

export default DashboardScreen;

const styles = StyleSheet.create({
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
    gap: 12,
    width: '100%',
  },
  datePicker: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  reportButtonText: {
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  cardsContainer: {
    gap: 16,
  },
});
