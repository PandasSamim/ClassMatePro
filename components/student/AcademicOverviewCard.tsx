import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { ThemeColors } from '@/constants/theme';

interface AcademicOverviewCardProps {
  colors: ThemeColors;
  chartData: any[];
}

export function AcademicOverviewCard({ colors, chartData }: AcademicOverviewCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="insights" size={24} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Academic Performance</Text>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={45}
          noOfSections={4}
          maxValue={100}
          barBorderRadius={8}
          frontColor={colors.primary}
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          yAxisTextStyle={{ color: colors.outline, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10, width: 80, marginLeft: -15 }}
          isAnimated
          animationDuration={1000}
          backgroundColor="transparent"
          width={240}
          height={120}
          spacing={25}
          initialSpacing={10}
        />
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
          <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Units</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Finals</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderTopWidth: 4,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    marginLeft: -20,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
