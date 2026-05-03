import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (year: number | undefined, month: number | undefined) => void;
  initialYear?: string;
  initialMonth?: string;
}
 
export function FilterModal({ visible, onClose, onApply, initialYear, initialMonth }: FilterModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
 
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
 
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || currentMonth);
 
  const years = [(parseInt(currentYear) - 1).toString(), currentYear];
  const months = [
    { label: 'Jan', value: '1' }, { label: 'Feb', value: '2' }, { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' }, { label: 'May', value: '5' }, { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' }, { label: 'Aug', value: '8' }, { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' },
  ];
 
  const handleApply = () => {
    onApply(parseInt(selectedYear), parseInt(selectedMonth));
    onClose();
  };

  const handleAllTime = () => {
    (onApply as any)(undefined, undefined);
    onClose();
  };
 
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop to close modal when tapped */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.bottomSheet, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.surfaceVariant }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Filter Period</Text>
              <TouchableOpacity onPress={handleAllTime} style={{ marginTop: 4 }}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>SHOW ALL TIME</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
 
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Year Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>YEAR</Text>
              <View style={styles.grid}>
                {years.map(year => {
                  const isSelected = selectedYear === year;
                  const isFuture = parseInt(year) > parseInt(currentYear);
                  return (
                    <TouchableOpacity
                      key={year}
                      disabled={isFuture}
                      style={[
                        styles.gridItem,
                        { borderColor: colors.outlineVariant, backgroundColor: colors.surface },
                        isSelected && { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
                        isFuture && { opacity: 0.3 }
                      ]}
                      onPress={() => {
                        setSelectedYear(year);
                        // If moving to current year and selected month is in future, reset to current month
                        if (parseInt(year) === parseInt(currentYear) && parseInt(selectedMonth) > parseInt(currentMonth)) {
                          setSelectedMonth(currentMonth);
                        }
                      }}
                    >
                      <Text style={[
                        styles.gridItemText,
                        { color: colors.onSurface },
                        isSelected && { color: colors.onPrimaryContainer, fontWeight: '600' }
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
 
            {/* Month Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>MONTH</Text>
              <View style={styles.grid}>
                {months.map(month => {
                  const isSelected = selectedMonth === month.value;
                  const isFuture = parseInt(selectedYear) === parseInt(currentYear) && parseInt(month.value) > parseInt(currentMonth);
                  
                  return (
                    <TouchableOpacity
                      key={month.value}
                      disabled={isFuture}
                      style={[
                        styles.gridItem,
                        { borderColor: colors.outlineVariant, backgroundColor: colors.surface },
                        isSelected && { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
                        isFuture && { opacity: 0.3 }
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text style={[
                        styles.gridItemText,
                        { color: colors.onSurface },
                        isSelected && { color: colors.onPrimaryContainer, fontWeight: '600' }
                      ]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={{height: 20}} />
          </ScrollView>
 
          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.surfaceVariant, backgroundColor: colors.surface }]}>
            <SafeAreaView style={styles.footerSafeArea}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelButton, { borderColor: colors.outline }]} 
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: colors.onSurface }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.footerButton, styles.applyButton, { backgroundColor: colors.primary }]} 
                onPress={handleApply}
              >
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>APPLY FILTERS</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '30%', // roughly 3 per row as per HTML for 3-col layout
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  gridItemText: {
    fontSize: 16,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  footerSafeArea: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  applyButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
