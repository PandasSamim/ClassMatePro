import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClassSeries } from '@/hooks/useDashboard';


export function FeeCollectionChart({ data = [], delay = 0 }: { data?: ClassSeries[], delay?: number }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const VIBRANT_PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const chartData = useMemo(() => {
    if (data.length === 0) return null;
    
    // Assuming all series have the same labels in the same order
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = data[0].data.map(p => {
      const monthIdx = parseInt(p.label) - 1;
      return monthNames[monthIdx] || p.label;
    });
    
    const datasets = data.map((series, index) => ({
      data: series.data.map(p => p.value),
      color: (opacity = 1) => VIBRANT_PALETTE[index % VIBRANT_PALETTE.length],
      strokeWidth: 3,
    }));

    return {
      labels,
      datasets,
    };
  }, [data]);

  const legendItems = useMemo(() => {
    return data.map((series, index) => ({
      name: series.className,
      color: VIBRANT_PALETTE[index % VIBRANT_PALETTE.length],
    }));
  }, [data]);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.surfaceContainerLowest,
    backgroundGradientTo: colors.surfaceContainerLowest,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.outlineVariant, // for grid lines
    labelColor: (opacity = 1) => colors.outline, // for labels
    propsForDots: {
      r: "4",
    },
    useShadowColorFromDataset: false,
  };

  return (
    <View>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.onSurface }]}>Fee Revenue Analysis</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Monthly collection by class</Text>
          </View>
          <View style={[styles.iconBadge, { backgroundColor: colors.primaryContainer }]}>
            <MaterialIcons name="show-chart" size={20} color={colors.onPrimaryContainer} />
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          {legendItems.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>{item.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartWrapper}>
          {chartData && chartData.datasets.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 90}
              height={180}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={{
                marginLeft: -10,
                borderRadius: 16
              }}
              fromZero={true}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.onSurfaceVariant }}>No collection data for this period</Text>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8, height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrapper: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  }
});