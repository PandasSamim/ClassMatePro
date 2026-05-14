import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResults, StudentResult } from '@/hooks/useResults';
import { Card } from '@/components/ui/Card';
import Animated, { FadeInDown, FadeInUp, Layout, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

const CircularProgress = ({ size, strokeWidth, percentage, color, textColor }: { size: number, strokeWidth: number, percentage: number, color: string, textColor: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.percentageContainer}>
        <Text style={[styles.percentageText, { color: textColor }]}>{Math.round(percentage)}%</Text>
      </View>
    </View>
  );
};

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

  const handleSubjectCountChange = (countStr: string) => {
    const count = parseInt(countStr) || 0;
    const limitedCount = Math.min(Math.max(count, 0), 15);
    
    setForm(prev => {
      const newSubjects = [...prev.subjects];
      if (limitedCount > newSubjects.length) {
        for (let i = newSubjects.length; i < limitedCount; i++) {
          newSubjects.push({ subject: '', marks: '' });
        }
      } else if (limitedCount < newSubjects.length) {
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
      setForm({ term: 'First Unit', totalMarks: '100', subjectCount: '1', subjects: [{ subject: '', marks: '' }] });
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

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return colors.secondary;
    if (percentage >= 60) return colors.primary;
    if (percentage >= 40) return colors.tertiary;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Background Decor */}
      <View style={[styles.bgDecor, { backgroundColor: colors.primary, opacity: 0.03 }]} />

      {/* Header */}
      <Animated.View 
        entering={FadeInUp.duration(600).springify()}
        style={[styles.header]}
      >
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]}>
          <MaterialIcons name="chevron-left" size={28} color={colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Performance</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{name}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Term Chips */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.termSelector} contentContainerStyle={{ paddingRight: 20 }}>
            {terms.map(term => (
              <TouchableOpacity
                key={term}
                onPress={() => setSelectedTerm(term)}
                style={[
                  styles.termItem,
                  { 
                    backgroundColor: selectedTerm === term ? colors.primary : colors.surfaceContainerLow,
                    borderColor: selectedTerm === term ? colors.primary : colors.outlineVariant,
                    borderWidth: 1
                  },
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

        {/* Dashboard Overview Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dashboardCard}
          >
            <View style={styles.dashboardHeader}>
              <View>
                <Text style={styles.dashboardTitle}>Academic Status</Text>
                <Text style={styles.dashboardSubtitle}>{selectedTerm === 'All' ? 'Overall Performance' : selectedTerm}</Text>
              </View>
              <View style={styles.gradeBadgeMain}>
                <Text style={styles.gradeTextMain}>{stats.grade}</Text>
              </View>
            </View>

            <View style={styles.dashboardContent}>
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Obtained</Text>
                  <Text style={styles.statValue}>{stats.obtained}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statValue}>{stats.total}</Text>
                </View>
              </View>
              
              <CircularProgress 
                size={100} 
                strokeWidth={10} 
                percentage={stats.percentage} 
                color="#FFFFFF" 
                textColor="#FFFFFF" 
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Results List */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Subject Records</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>{filteredResults.length} Subjects</Text>
        </View>

        {filteredResults.length > 0 ? (
          filteredResults.map((result, idx) => {
            const perc = (result.marks / result.total_marks) * 100;
            const statusColor = getGradeColor(perc);
            
            return (
              <Animated.View 
                key={`${result.id}-${idx}`} 
                entering={SlideInRight.delay(300 + idx * 100).duration(500)}
                layout={Layout.springify()}
              >
                <Card style={styles.subjectCard}>
                  <View style={styles.subjectRow}>
                    <View style={[styles.subjectIcon, { backgroundColor: statusColor + '20' }]}>
                      <FontAwesome5 name="book-open" size={16} color={statusColor} />
                    </View>
                    <View style={styles.subjectInfo}>
                      <Text style={[styles.subjectName, { color: colors.onSurface }]}>{result.subject}</Text>
                      <Text style={[styles.termTag, { color: colors.onSurfaceVariant }]}>{result.term}</Text>
                    </View>
                    <View style={styles.marksContainer}>
                      <Text style={[styles.marksValue, { color: colors.onSurface }]}>{result.marks}</Text>
                      <Text style={[styles.marksTotal, { color: colors.onSurfaceVariant }]}>/{result.total_marks}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${perc}%`, backgroundColor: statusColor }
                      ]} 
                    />
                  </View>
                </Card>
              </Animated.View>
            );
          })
        ) : (
          <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Ionicons name="documents-outline" size={48} color={colors.outline} />
            </View>
            <Text style={[styles.emptyText, { color: colors.onSurface }]}>No Results Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              Add student performance records to see insights here.
            </Text>
          </Animated.View>
        )}

        {/* Remarks Section */}
        {filteredResults.length > 0 && (
          <Animated.View entering={FadeInUp.delay(600)}>
            <Card style={[styles.remarksCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.remarksHeader}>
                <Ionicons name="chatbox-ellipses" size={24} color={colors.primary} />
                <Text style={[styles.remarksTitle, { color: colors.onSurface }]}>Academic Insight</Text>
              </View>
              <View style={[styles.remarksBubble, { backgroundColor: colors.surfaceContainerLowest }]}>
                <Text style={[styles.remarksText, { color: colors.onSurfaceVariant }]}>
                  {stats.percentage >= 80 
                    ? "Exceptional work! This student consistently exceeds expectations and shows a deep understanding of the curriculum."
                    : stats.percentage >= 60
                    ? "Steady progress observed. Encouraging more participation in challenging subjects could further boost performance."
                    : "Focus on foundational concepts is needed. We recommend regular revision and setting specific study goals."}
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modern Add Result Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderInner}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>New Performance Record</Text>
              <TouchableOpacity 
                onPress={() => setAddModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceContainerHigh }]}
              >
                <MaterialIcons name="close" size={20} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.outline }]}>EXAM TERM</Text>
                <View style={styles.unitGrid}>
                  {unitOptions.map(unit => (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setForm(prev => ({...prev, term: unit}))}
                      style={[
                        styles.unitChip,
                        { 
                          backgroundColor: form.term === unit ? colors.primary : colors.surfaceContainerLow,
                          borderColor: form.term === unit ? colors.primary : colors.outlineVariant,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.unitChipText, 
                        { color: form.term === unit ? colors.onPrimary : colors.onSurfaceVariant }
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formLabel, { color: colors.outline }]}>MAX MARKS</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow }]}
                    placeholder="100"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={form.totalMarks}
                    onChangeText={(text) => setForm(prev => ({...prev, totalMarks: text}))}
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formLabel, { color: colors.outline }]}>SUBJECTS</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow }]}
                    placeholder="Count"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={form.subjectCount}
                    onChangeText={handleSubjectCountChange}
                  />
                </View>
              </View>

              <Text style={[styles.formLabel, { color: colors.outline, marginTop: 12 }]}>SUBJECT DETAILS</Text>
              
              {form.subjects.map((subj, index) => (
                <Animated.View 
                  key={index} 
                  entering={FadeInUp.delay(index * 50)}
                  style={styles.subjectEntryRow}
                >
                  <View style={{ flex: 3 }}>
                    <TextInput
                      style={[styles.formInput, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow, height: 48 }]}
                      placeholder={`Name e.g. Math`}
                      placeholderTextColor={colors.outline}
                      value={subj.subject}
                      onChangeText={(text) => updateSubject(index, 'subject', text)}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1.5 }}>
                    <TextInput
                      style={[styles.formInput, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow, height: 48, textAlign: 'center' }]}
                      placeholder="Score"
                      placeholderTextColor={colors.outline}
                      keyboardType="numeric"
                      value={subj.marks}
                      onChangeText={(text) => updateSubject(index, 'marks', text)}
                    />
                  </View>
                </Animated.View>
              ))}

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleAddResult}
              >
                <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>Submit Performance</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
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
  bgDecor: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    paddingBottom: 15,
    gap: 15,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: -2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    padding: 20,
  },
  termSelector: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  termItem: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  termText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dashboardCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    opacity: 0.95,
  },
  dashboardSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gradeBadgeMain: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  gradeTextMain: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  dashboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flex: 1,
  },
  statBox: {
    marginBottom: 10,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  statDivider: {
    height: 1,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  percentageContainer: {
    position: 'absolute',
  },
  percentageText: {
    fontSize: 22,
    fontWeight: '900',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  subjectCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInfo: {
    flex: 1,
    marginLeft: 15,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
  },
  termTag: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  marksValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  marksTotal: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  remarksCard: {
    marginTop: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 0,
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  remarksTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  remarksBubble: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  remarksText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formInput: {
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  subjectEntryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
