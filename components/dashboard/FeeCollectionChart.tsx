import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function FeeCollectionChart() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Mock data for the bar chart
  const data = [
    { label: 'May', value: 30 },
    { label: 'Jun', value: 45 },
    { label: 'Jul', value: 80 },
    { label: 'Aug', value: 65 },
    { label: 'Sep', value: 85 },
    { label: 'Oct', value: 100 },
  ];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Fee Collection Trends</Text>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'transparent' }]}>
          <MaterialIcons name="more-vert" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        {/* Y-Axis */}
        <View style={styles.yAxis}>
          <Text style={[styles.yAxisLabel, { color: colors.outline }]}>$50k</Text>
          <Text style={[styles.yAxisLabel, { color: colors.outline }]}>$25k</Text>
          <Text style={[styles.yAxisLabel, { color: colors.outline }]}>$0</Text>
        </View>

        {/* Graph Area */}
        <View style={[styles.graphArea, { borderBottomColor: colors.outlineVariant }]}>
          {/* Background Grid Lines */}
          <View style={[styles.gridLine, { top: '0%', borderTopColor: colors.outlineVariant }]} />
          <View style={[styles.gridLine, { top: '50%', borderTopColor: colors.outlineVariant }]} />

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const isCurrent = index === data.length - 1;
              return (
                <View key={item.label} style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${item.value}%`, 
                        backgroundColor: isCurrent ? colors.primary : colors.primaryContainer,
                        opacity: isCurrent ? 1 : 0.6
                      }
                    ]} 
                  />
                  <Text style={[
                    styles.xLabel, 
                    { color: isCurrent ? colors.primary : colors.outline },
                    isCurrent && { fontWeight: '700' }
                  ]}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 24,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
    borderRadius: 4,
  },
  chartContainer: {
    height: 250,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxis: {
    height: '100%',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingBottom: 24, // Space for x-axis labels
  },
  yAxisLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  graphArea: {
    flex: 1,
    height: '100%',
    borderBottomWidth: 1,
    position: 'relative',
    paddingBottom: 24, // Space for x-axis labels
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    opacity: 0.3,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 32,
  },
  bar: {
    width: 24,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  xLabel: {
    fontSize: 10,
    marginTop: 8,
    position: 'absolute',
    bottom: -24,
  },
});
