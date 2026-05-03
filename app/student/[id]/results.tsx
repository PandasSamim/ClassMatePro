import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResults, StudentResult } from '@/hooks/useResults';
import { Card } from '@/components/ui/Card';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function StudentResultsScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { results, fetchResultsByStudent, addResult, bulkAddResults } = useResults();

  const [selectedTerm, setSelectedTerm] = useState<string>('All');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [form, setForm] = useState({
    term: 'First Unit',
    totalMarks: '100',
    subjectCount: '1',
    subjects: [{ subject: '', marks: '' }]
  });

  const unitOptions = ['First Unit', 'Second Unit', 'Final Result'];

  useEffect(() => {
    if (id) {
      fetchResultsByStudent(Number(id));
    }
  }, [id, fetchResultsByStudent]);

  // Handle subject count change and regenerate rows
  const handleSubjectCountChange = (countStr: string) => {
    const count = parseInt(countStr) || 0;
    const limitedCount = Math.min(Math.max(count, 0), 15); // Limit to 15 subjects
    
    setForm(prev => {
      const newSubjects = [...prev.subjects];
      if (limitedCount > newSubjects.length) {
        // Add rows
        for (let i = newSubjects.length; i < limitedCount; i++) {
          newSubjects.push({ subject: '', marks: '' });
        }
      } else if (limitedCount < newSubjects.length) {
        // Remove rows
        newSubjects.splice(limitedCount);
      }
      return { ...prev, subjectCount: countStr, subjects: newSubjects };
    });
  };

  const updateSubject = (index: number, field: 'subject' | 'marks', value: string) => {
    setForm(prev => {
      const newSubjects = [...prev.subjects];
      newSubjects[index] = { ...newSubjects[index], [field]: value };
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleAddResult = async () => {
    const { subjects, totalMarks, term } = form;
    
    // Validation
    if (subjects.some(s => !s.subject || !s.marks)) {
      Alert.alert('Error', 'Please fill all subject names and marks');
      return;
    }

    const totalNum = parseInt(totalMarks);
    const preparedSubjects = subjects.map(s => ({
      subject: s.subject,
      marks: parseInt(s.marks)
    }));

    if (isNaN(totalNum) || preparedSubjects.some(s => isNaN(s.marks))) {
      Alert.alert('Error', 'Marks must be valid numbers');
      return;
    }

    const success = await bulkAddResults(Number(id), preparedSubjects, totalNum, term);
    if (success) {
      setAddModalVisible(false);
      setForm({ 
        term: 'First Unit', 
        totalMarks: '100', 
        subjectCount: '1', 
        subjects: [{ subject: '', marks: '' }] 
      });
      Alert.alert('Success', 'All results added successfully');
    } else {
      Alert.alert('Error', 'Failed to add results');
    }
  };

  const terms = useMemo(() => {
    const uniqueTerms = Array.from(new Set(results.map(r => r.term)));
    return ['All', ...uniqueTerms];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedTerm === 'All') return results;
    return results.filter(r => r.term === selectedTerm);
  }, [results, selectedTerm]);

  const stats = useMemo(() => {
    if (filteredResults.length === 0) return { total: 0, obtained: 0, percentage: 0, grade: 'N/A' };
    const obtained = filteredResults.reduce((sum, r) => sum + r.marks, 0);
    const total = filteredResults.reduce((sum, r) => sum + r.total_marks, 0);
    const percentage = (obtained / total) * 100;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    return { total, obtained, percentage, grade };
  }, [filteredResults]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.duration(600).springify()}
        style={[styles.header, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.surfaceVariant }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Academic Performance</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>{name}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={[styles.addButton, { backgroundColor: colors.primaryContainer }]}
        >
          <MaterialIcons name="add" size={24} color={colors.onPrimaryContainer} />
        </TouchableOpacity>

        <View style={[styles.avatar, { backgroundColor: colors.secondaryContainer, marginLeft: 12 }]}>
          <Text style={[styles.avatarText, { color: colors.onSecondaryContainer }]}>
            {String(name || 'S').charAt(0)}
          </Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Term Selector */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.termSelector}>
            {terms.map(term => (
              <TouchableOpacity
                key={term}
                onPress={() => setSelectedTerm(term)}
                style={[
                  styles.termItem,
                  { backgroundColor: selectedTerm === term ? colors.primary : colors.surfaceContainerHigh },
                ]}
              >
                <Text style={[
                  styles.termText,
                  { color: selectedTerm === term ? colors.onPrimary : colors.onSurfaceVariant }
                ]}>
                  {term}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>PERCENTAGE</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{stats.percentage.toFixed(1)}%</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.surfaceVariant }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>TOTAL GRADE</Text>
                <Text style={[styles.summaryValue, { color: colors.secondary }]}>{stats.grade}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.surfaceVariant }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>SCORE</Text>
                <Text style={[styles.summaryValue, { color: colors.onSurface }]}>{stats.obtained}/{stats.total}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Results Table */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Card style={styles.tableCard}>
            <View style={[styles.tableHeader, { borderBottomColor: colors.surfaceVariant }]}>
              <Text style={[styles.th, styles.thSubject, { color: colors.outline }]}>SUBJECT</Text>
              <Text style={[styles.th, styles.thMarks, { color: colors.outline }]}>MARKS</Text>
              <Text style={[styles.th, styles.thGrade, { color: colors.outline }]}>GRADE</Text>
            </View>
            
            {filteredResults.length > 0 ? filteredResults.map((result, idx) => {
              const perc = (result.marks / result.total_marks) * 100;
              let g = 'F';
              if (perc >= 90) g = 'A+';
              else if (perc >= 80) g = 'A';
              else if (perc >= 70) g = 'B';
              else if (perc >= 60) g = 'C';
              else if (perc >= 50) g = 'D';

              return (
                <View key={idx} style={[styles.tr, { borderBottomColor: colors.surfaceVariant }]}>
                  <View style={styles.tdSubject}>
                    <Text style={[styles.subjectText, { color: colors.onSurface }]}>{result.subject}</Text>
                    <Text style={[styles.termTag, { color: colors.onSurfaceVariant }]}>{result.term}</Text>
                  </View>
                  <Text style={[styles.tdMarks, { color: colors.onSurface }]}>{result.marks}/{result.total_marks}</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: perc >= 50 ? colors.secondaryContainer : colors.errorContainer }]}>
                    <Text style={[styles.gradeText, { color: perc >= 50 ? colors.onSecondaryContainer : colors.onErrorContainer }]}>{g}</Text>
                  </View>
                </View>
              );
            }) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="event-note" size={48} color={colors.outlineVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No results found for this term.</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Remarks Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Card style={styles.remarksCard}>
            <View style={styles.remarksHeader}>
              <MaterialIcons name="comment" size={20} color={colors.primary} />
              <Text style={[styles.remarksTitle, { color: colors.onSurface }]}>Teacher's Remarks</Text>
            </View>
            <Text style={[styles.remarksText, { color: colors.onSurfaceVariant }]}>
              {stats.percentage >= 80 
                ? "Excellent performance! The student is showing great interest in all subjects and maintaining a high standard."
                : stats.percentage >= 60
                ? "Good progress. With a bit more focus on core concepts, the student can definitely achieve higher grades."
                : "Needs improvement. Regular practice and extra attention to the subjects with lower scores are recommended."}
            </Text>
          </Card>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Result Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Add Batch Result</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>1. SELECT UNIT/TERM</Text>
                <View style={styles.unitGrid}>
                  {unitOptions.map(unit => (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setForm(prev => ({...prev, term: unit}))}
                      style={[
                        styles.unitItem,
                        { 
                          borderColor: form.term === unit ? colors.primary : colors.outlineVariant,
                          backgroundColor: form.term === unit ? `${colors.primary}15` : 'transparent'
                        }
                      ]}
                    >
                      <Text style={[
                        styles.unitText, 
                        { color: form.term === unit ? colors.primary : colors.onSurfaceVariant }
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>2. TOTAL MARKS</Text>
                  <TextInput
                    style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                    placeholder="100"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={form.totalMarks}
                    onChangeText={(text) => setForm(prev => ({...prev, totalMarks: text}))}
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>3. NO. OF SUBJECTS</Text>
                  <TextInput
                    style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={form.subjectCount}
                    onChangeText={handleSubjectCountChange}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant, marginBottom: 16 }]}>4. ENTER SUBJECT DETAILS</Text>
              
              {form.subjects.map((subj, index) => (
                <View key={index} style={styles.subjectRow}>
                  <View style={{ flex: 2 }}>
                    <TextInput
                      style={[styles.inputSmall, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                      placeholder={`Subject ${index + 1}`}
                      placeholderTextColor={colors.outline}
                      value={subj.subject}
                      onChangeText={(text) => updateSubject(index, 'subject', text)}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.inputSmall, { color: colors.onSurface, borderColor: colors.outlineVariant, textAlign: 'center' }]}
                      placeholder="Marks"
                      placeholderTextColor={colors.outline}
                      keyboardType="numeric"
                      value={subj.marks}
                      onChangeText={(text) => updateSubject(index, 'marks', text)}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleAddResult}
              >
                <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>Save All Results</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
  },
  backButton: {
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  termSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  termItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  termText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 10,
  },
  tableCard: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  thSubject: { flex: 2 },
  thMarks: { flex: 1, textAlign: 'center' },
  thGrade: { flex: 1, textAlign: 'right' },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  tdSubject: {
    flex: 2,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
  },
  termTag: {
    fontSize: 11,
    marginTop: 2,
  },
  tdMarks: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  gradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  remarksCard: {
    padding: 24,
    borderRadius: 20,
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  remarksTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  remarksText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  unitItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subjectRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  inputSmall: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
