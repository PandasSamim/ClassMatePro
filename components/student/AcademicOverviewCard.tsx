import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { ThemeColors } from '@/constants/theme';

interface AcademicOverviewCardProps {
  colors: ThemeColors;
  chartData: any[];
}

export function AcademicOverviewCard({ colors, chartData }: AcademicOverviewCardProps) {
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.surfaceContainerLowest,
    backgroundGradientTo: colors.surfaceContainerLowest,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.onSurfaceVariant,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const data = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        data: chartData.map(d => d.value),
        colors: chartData.map(d => (opacity = 1) => d.frontColor || colors.primary)
      }
    ]
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="insights" size={24} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Academic Performance</Text>
      </View>

      <View style={styles.chartContainer}>
        {chartData.length > 0 ? (
          <BarChart
            data={data}
            width={Dimensions.get('window').width - 72}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              marginLeft: -10,
            }}
            withCustomBarColorFromData={true}
            flatColor={true}
            fromZero={true}
            showValuesOnTopOfBars={true}
            withInnerLines={false}
          />
        ) : (
          <Text style={{ color: colors.onSurfaceVariant, padding: 20 }}>No academic data available</Text>
        )}
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
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
