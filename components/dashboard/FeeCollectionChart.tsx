import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClassSeries } from '@/hooks/useDashboard';

const VIBRANT_PALETTE = ['#b5c4ff', '#9ff2cc', '#d3baff', '#ffb594', '#82d3e0', '#ffb77c'];
const BG_PALETTE = ['#003fb1', '#006c4b', '#5e00cd', '#8b2500', '#006874', '#6e2f00'];

export function FeeCollectionChart({ data = [], delay = 0 }: { data?: ClassSeries[], delay?: number }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  const chartData = useMemo(() => {
    if (data.length === 0) return null;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = data[0].data.map(p => {
      const monthIdx = parseInt(p.label) - 1;
      return monthNames[monthIdx] || p.label;
    });
    const datasets = data.map((series, index) => ({
      data: series.data.map(p => p.value),
      color: (opacity = 1) => VIBRANT_PALETTE[index % VIBRANT_PALETTE.length],
      strokeWidth: 2.5,
    }));
    return { labels, datasets };
  }, [data]);

  const legendItems = useMemo(() =>
    data.map((series, index) => ({
      name: series.className,
      color: VIBRANT_PALETTE[index % VIBRANT_PALETTE.length],
      bg: BG_PALETTE[index % BG_PALETTE.length],
    })),
    [data]
  );

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#003fb1',
    backgroundGradientTo: '#003fb1',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: () => 'rgba(255,255,255,0.12)',
    labelColor: () => 'rgba(255,255,255,0.5)',
    propsForDots: { r: '4', strokeWidth: '2', stroke: 'rgba(255,255,255,0.3)' },
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.outerWrapper}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.headerIconBox, { backgroundColor: '#003fb1' }]}>
          <MaterialIcons name="show-chart" size={20} color="#b5c4ff" />
        </View>
        <View style={styles.headerTexts}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Fee Revenue</Text>
          <Text style={[styles.cardSubtitle, { color: colors.outline }]}>Monthly collection by class</Text>
        </View>
      </View>

      {/* Dark Chart Card */}
      <View style={styles.darkCard}>
        {/* Glow circles */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Legend */}
        {legendItems.length > 0 && (
          <View style={styles.legendRow}>
            {legendItems.map((item, i) => (
              <View key={i} style={[styles.legendChip, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Chart */}
        <View style={styles.chartWrap}>
          {chartData && chartData.datasets.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth - 56}
              height={190}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={{ marginLeft: -12, borderRadius: 0 }}
              fromZero
              withInnerLines={false}
              withOuterLines={false}
              withShadow={false}
            />
          ) : (
            <View style={styles.emptyChart}>
              <MaterialIcons name="bar-chart" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No data for this period</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  darkCard: {
    backgroundColor: '#003fb1',
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(181,196,255,0.1)',
    top: -60,
    right: -40,
  },
  glowBottom: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,63,177,0.3)',
    bottom: -30,
    left: -20,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrap: {
    alignItems: 'center',
  },
  emptyChart: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
});