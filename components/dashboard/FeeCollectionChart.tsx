import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClassSeries, ChartDataPoint } from '@/hooks/useDashboard';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function FeeCollectionChart({ data = [], delay = 0 }: { data?: ClassSeries[], delay?: number }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 1000;
    let highest = 0;
    data.forEach(series => {
      series.data.forEach(point => {
        if (point.value > highest) highest = point.value;
      });
    });
    return Math.max(Math.ceil(highest * 1.2 / 100) * 100, 500);
  }, [data]);

  const VIBRANT_PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const chartLines = useMemo(() => {
    return data.map((series, index) => ({
      data: series.data.map(p => ({ value: p.value, label: p.label })),
      color: VIBRANT_PALETTE[index % VIBRANT_PALETTE.length],
      thickness: 3,
    }));
  }, [data]);

  const legendItems = useMemo(() => {
    return data.map((series, index) => ({
      name: series.className,
      color: VIBRANT_PALETTE[index % VIBRANT_PALETTE.length],
    }));
  }, [data]);

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600).springify()}>
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
          {chartLines.length > 0 ? (
            <LineChart
              data={chartLines[0].data}
              data2={chartLines[1]?.data}
              data3={chartLines[2]?.data}
              data4={chartLines[3]?.data}
              data5={chartLines[4]?.data}
              color={chartLines[0].color}
              color2={chartLines[1]?.color}
              color3={chartLines[2]?.color}
              color4={chartLines[3]?.color}
              color5={chartLines[4]?.color}
              dataPointsColor1={chartLines[0].color}
              dataPointsColor2={chartLines[1]?.color}
              dataPointsColor3={chartLines[2]?.color}
              dataPointsColor4={chartLines[3]?.color}
              dataPointsColor5={chartLines[4]?.color}
              thickness={3}
              noOfSections={4}
              maxValue={maxValue}
              height={180}
              width={Dimensions.get('window').width - 100}
              initialSpacing={20}
              spacing={50}
              yAxisThickness={0}
              xAxisThickness={0}
              rulesColor={colors.surfaceVariant}
              rulesType="dashed"
              yAxisTextStyle={{ color: colors.outline, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.outline, fontSize: 10 }}
              yAxisLabelPrefix="₹"
              hideDataPoints={false}
              dataPointsRadius={4}
              showValuesAsDataPointsText={false}
              animateOnDataChange
              animationDuration={1000}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.onSurfaceVariant }}>No collection data for this period</Text>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
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