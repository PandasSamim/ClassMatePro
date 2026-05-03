import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Image, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useFees } from '@/hooks/useFees';
import { useStudents } from '@/hooks/useStudents';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function UpdateFeesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const studentName = name ? String(name) : 'Student';
  const [newAmount, setNewAmount] = useState('');
  const [applyWaiver, setApplyWaiver] = useState(false);
  const [notes, setNotes] = useState('');
  const { addOrUpdateFee } = useFees();
  const { fetchStudentById } = useStudents();
  const [student, setStudent] = useState<any>(null);

  React.useEffect(() => {
    if (id) {
      fetchStudentById(Number(id)).then(setStudent);
    }
  }, [id]);

  const currentFee = 450.00; // This could also be fetched from a settings table if needed
  
  let estimatedTotal = newAmount ? parseFloat(newAmount) : currentFee;
  if (applyWaiver && !isNaN(estimatedTotal)) {
    estimatedTotal = estimatedTotal * 0.9;
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <Animated.View 
        entering={FadeInUp.duration(600).springify()}
        style={[styles.header, { 
          backgroundColor: colors.surfaceContainerLowest, 
          borderBottomColor: colors.surfaceVariant,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20 
        }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Update Fees</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>{studentName}</Text>
        </View>

        <View style={{ width: 40 }} />
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.studentContext}>
            {student?.avatar_url ? (
              <Image 
                source={{ uri: student.avatar_url }} 
                style={[styles.avatar, { borderColor: colors.outlineVariant }]} 
              />
            ) : (
              <View style={[styles.avatar, { borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="person" size={32} color={colors.outline} />
              </View>
            )}
            <View>
              <Text style={[styles.studentName, { color: colors.onSurface }]}>{studentName}</Text>
              <View style={styles.gradeRow}>
                <MaterialIcons name="school" size={18} color={colors.onSurfaceVariant} />
                <Text style={[styles.gradeText, { color: colors.onSurfaceVariant }]}>{student?.class_name || 'Loading...'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>CURRENT MONTHLY FEE</Text>
            <View style={styles.feeAmountRow}>
              <Text style={[styles.feeAmount, { color: colors.primary }]}>₹{currentFee.toFixed(2)}</Text>
              <Text style={[styles.feeUnit, { color: colors.onSurfaceVariant }]}>/ month</Text>
            </View>
            <View style={[styles.activeBillingRow, { borderTopColor: colors.surfaceVariant }]}>
              <MaterialIcons name="check-circle" size={16} color={colors.secondary} />
              <Text style={[styles.activeBillingText, { color: colors.onSurfaceVariant }]}>Active Billing</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Fee Adjustment</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Enter New Amount</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceContainerLow, borderBottomColor: colors.outlineVariant }]}>
                <Text style={[styles.currencySymbol, { color: colors.onSurfaceVariant }]}>₹</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.onSurface }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.outline}
                  keyboardType="decimal-pad"
                  value={newAmount}
                  onChangeText={setNewAmount}
                />
              </View>
            </View>

            <View style={[styles.rulesSection, { borderTopColor: colors.surfaceVariant }]}>
              <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>FEE RULES & WAIVERS</Text>
              
              <TouchableOpacity 
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => setApplyWaiver(!applyWaiver)}
              >
                <View style={[styles.checkbox, { 
                  backgroundColor: applyWaiver ? colors.primary : colors.surfaceContainerLowest,
                  borderColor: applyWaiver ? colors.primary : colors.outlineVariant 
                }]}>
                  {applyWaiver ? <MaterialIcons name="check" size={16} color={colors.onPrimary} /> : null}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.onSurface }]}>Apply Low Attendance Waiver (-10%)</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Special Notes</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.surfaceContainerLow, borderBottomColor: colors.outlineVariant, color: colors.onSurface }]}
                  placeholder="Reason for adjustment..."
                  placeholderTextColor={colors.outline}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>EFFECTIVE FROM</Text>
              <Text style={[styles.summaryValue, { color: colors.onSurface }]}>{currentMonth}</Text>
            </View>
            <View style={[styles.summaryItem, { alignItems: 'flex-end' }]}>
              <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>ESTIMATED NEW TOTAL</Text>
              <Text style={[styles.summaryTotal, { color: colors.primary }]}>
                {isNaN(estimatedTotal) ? 'Pending Input' : `₹${estimatedTotal.toFixed(2)}`}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { backgroundColor: colors.surfaceContainerLowest, borderTopColor: colors.surfaceVariant }]}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color={colors.outline} />
          <Text style={[styles.bottomButtonText, { color: colors.outline }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomButtonPrimary, { backgroundColor: colors.primaryContainer }]}
          onPress={async () => {
            if (id) {
              const success = await addOrUpdateFee(Number(id), estimatedTotal, currentMonth);
              if (success) {
                router.back();
              } else {
                alert('Failed to update fee');
              }
            }
          }}
        >
          <MaterialIcons name="check-circle" size={24} color={colors.onPrimaryContainer} />
          <Text style={[styles.bottomButtonTextPrimary, { color: colors.onPrimaryContainer }]}>Confirm Adjustment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  contentContainer: {
    padding: 24,
  },
  studentContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeText: {
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  feeAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  feeAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  feeUnit: {
    fontSize: 14,
  },
  activeBillingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  activeBillingText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    height: '100%',
  },
  rulesSection: {
    paddingTop: 24,
    borderTopWidth: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  textArea: {
    borderBottomWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  bottomButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomButtonPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bottomButtonTextPrimary: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
