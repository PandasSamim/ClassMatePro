import { FeeCollectionChart } from '@/components/dashboard/FeeCollectionChart';
import { StudentAttendanceLeaderboard } from '@/components/dashboard/StudentAttendanceLeaderboard';
import { FilterModal } from '@/components/dashboard/FilterModal';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Colors } from '@/constants/theme';
import { useGlobalSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDashboard } from '@/hooks/useDashboard';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedProps } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

import { TopNavbar } from '@/components/dashboard/TopNavbar';

function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{ year: number, month: number } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { metrics, chartData, attendanceBreakdown, studentLeaderboard, fetchMetrics, loadingMetrics, loadingCharts, loadingAttendance } = useDashboard();
  const { settings } = useGlobalSettings();

  // Counting animations
  const collectedAnim = useSharedValue(0);
  const duesAnim = useSharedValue(0);
  const studentsAnim = useSharedValue(0);
  const attendanceAnim = useSharedValue(0);

  useEffect(() => {
    collectedAnim.value = withSpring(metrics?.totalFeesCollected || 0, { damping: 15, stiffness: 100 });
    duesAnim.value = withSpring(metrics?.totalDues || 0, { damping: 15, stiffness: 100 });
    studentsAnim.value = withSpring(metrics?.totalStudents || 0, { damping: 15, stiffness: 100 });
    attendanceAnim.value = withSpring(metrics?.attendancePercentage || 0, { damping: 15, stiffness: 100 });
  }, [metrics]);

  const collectedProps = useAnimatedProps(() => ({ text: `₹${Math.round(collectedAnim.value).toLocaleString()}`, defaultValue: `₹${Math.round(collectedAnim.value).toLocaleString()}` } as any));
  const duesProps = useAnimatedProps(() => ({ text: `₹${Math.round(duesAnim.value).toLocaleString()}`, defaultValue: `₹${Math.round(duesAnim.value).toLocaleString()}` } as any));
  const studentsProps = useAnimatedProps(() => ({ text: `${Math.round(studentsAnim.value)}`, defaultValue: `${Math.round(studentsAnim.value)}` } as any));
  const attendanceProps = useAnimatedProps(() => ({ text: `${attendanceAnim.value.toFixed(1)}%`, defaultValue: `${attendanceAnim.value.toFixed(1)}%` } as any));

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        fetchMetrics(undefined, activeFilter?.year, activeFilter?.month);
      });
      return () => task.cancel();
    }, [fetchMetrics, activeFilter])
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
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
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
      
      .revenue-chart {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 200px;
        padding: 20px 40px;
        background: #f8fafc;
        border-radius: 12px;
        margin-bottom: 40px;
        gap: 15px;
      }
      
      .bar-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
      }
      
      .bar-container {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin: 8px 0;
      }
      
      .bar-fill {
        width: 30px;
        background: #1a56db;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        transition: height 0.3s ease;
      }
      
      .bar-label { font-size: 9px; font-weight: 700; color: #1a56db; margin-bottom: 4px; }
      .bar-name { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
      
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
    
    <div class="chart-section">
      <div class="section-header">Fee Revenue Analysis</div>
      <div class="revenue-chart">
        ${(() => {
          // Aggregate data by label across all series
          const totalsByLabel: Record<string, number> = {};
          chartData.forEach(series => {
            series.data.forEach(p => {
              totalsByLabel[p.label] = (totalsByLabel[p.label] || 0) + p.value;
            });
          });

          const labels = Object.keys(totalsByLabel);
          const maxVal = Math.max(...Object.values(totalsByLabel), 1);
          const monthMap: Record<string, string> = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
          };

          return labels.map(label => `
            <div class="bar-group">
              <div class="bar-label">₹${(totalsByLabel[label] / 1000).toFixed(1)}k</div>
              <div class="bar-container">
                <div class="bar-fill" style="height: ${(totalsByLabel[label] / maxVal) * 100}%"></div>
              </div>
              <div class="bar-name">${monthMap[label] || label}</div>
            </div>
          `).join('');
        })()}
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
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNavbar />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        <View
          style={styles.pageHeader}
        >
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Dashboard Overview</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Monitor key academic and financial metrics.</Text>
        </View>

        <View
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
            style={[styles.reportButton, { backgroundColor: colors.primaryContainer, opacity: isGeneratingPdf ? 0.6 : 1 }]}
            onPress={handleDownloadReport}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="download" size={18} color={colors.onPrimary} />
                <Text style={[styles.reportButtonText, { color: colors.onPrimary }]}>Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Metric Strip ────────────────────────────── */}
        <View style={styles.metricsStrip}>
          <View style={[styles.metricTile, { backgroundColor: '#003fb1', overflow: 'hidden' }]}>
            <View style={[styles.tileGlow, { backgroundColor: '#b5c4ff' }]} />
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialIcons name="account-balance-wallet" size={22} color="#b5c4ff" />
            </View>
            <View>
              <AnimatedTextInput
                underlineColorAndroid="transparent"
                editable={false}
                style={styles.tileValue}
                animatedProps={collectedProps}
              />
              <Text style={styles.tileLabel}>COLLECTED</Text>
            </View>
          </View>

          <View style={[styles.metricTile, { backgroundColor: '#8b2500', overflow: 'hidden' }]}>
            <View style={[styles.tileGlow, { backgroundColor: '#ffb594' }]} />
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialIcons name="warning" size={22} color="#ffb594" />
            </View>
            <View>
              <AnimatedTextInput
                underlineColorAndroid="transparent"
                editable={false}
                style={styles.tileValue}
                animatedProps={duesProps}
              />
              <Text style={styles.tileLabel}>DUES</Text>
            </View>
          </View>

          <View style={[styles.metricTile, { backgroundColor: '#5e00cd', overflow: 'hidden' }]}>
            <View style={[styles.tileGlow, { backgroundColor: '#d3baff' }]} />
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialIcons name="groups" size={22} color="#d3baff" />
            </View>
            <View>
              <AnimatedTextInput
                underlineColorAndroid="transparent"
                editable={false}
                style={styles.tileValue}
                animatedProps={studentsProps}
              />
              <Text style={styles.tileLabel}>STUDENTS</Text>
            </View>
          </View>

          <View style={[styles.metricTile, { backgroundColor: '#006c4b', overflow: 'hidden' }]}>
            <View style={[styles.tileGlow, { backgroundColor: '#9ff2cc' }]} />
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialIcons name="check-circle" size={22} color="#9ff2cc" />
            </View>
            <View>
              <AnimatedTextInput
                underlineColorAndroid="transparent"
                editable={false}
                style={styles.tileValue}
                animatedProps={attendanceProps}
              />
              <Text style={styles.tileLabel}>ATTENDANCE</Text>
            </View>
          </View>
        </View>

        <FeeCollectionChart
          data={chartData}
        />

        <StudentAttendanceLeaderboard data={studentLeaderboard} />

        <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricWrapper: {
    width: '48.5%',
  },
  metricsStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  metricTile: {
    width: '47%',
    height: 140,
    borderRadius: 24,
    padding: 18,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  tileGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -20,
    right: -20,
    opacity: 0.15,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tileLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
