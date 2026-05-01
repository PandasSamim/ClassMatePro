import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClassItem } from '@/components/students/ClassItem';
import { StudentRow } from '@/components/students/StudentRow';
import { AddClassModal } from '@/components/students/AddClassModal';
import { useRouter } from 'expo-router';
import { useStudents } from '@/hooks/useStudents';
import { useEffect } from 'react';

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [isAddClassVisible, setAddClassVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { classes, students, fetchClasses, fetchStudents, addClass } = useStudents();

  useEffect(() => {
    fetchClasses();
    fetchStudents(undefined, searchQuery);
  }, [fetchClasses, fetchStudents, searchQuery]);

  const handleAddClass = async (className: string, fees: string) => {
    const success = await addClass(className, 'TBD');
    if (success) {
      Alert.alert("Success", `Class ${className} added!`);
      setAddClassVisible(false);
    } else {
      Alert.alert("Error", "Failed to add class.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Student Directory</Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Manage classes, academic records, and student profiles.</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-student')}
          >
            <MaterialIcons name="person-add" size={18} color={colors.onPrimary} />
            <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Add Student</Text>
          </TouchableOpacity>
        </View>

        {/* Classes List */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.surfaceVariant }]}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Classes</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="filter-list" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: colors.primaryContainer, borderRadius: 8 }]}
                onPress={() => setAddClassVisible(true)}
              >
                <MaterialIcons name="add" size={20} color={colors.onPrimaryContainer} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.classesList}>
            {classes.length > 0 ? classes.map((c) => (
              <ClassItem key={c.id} name={c.name} count={`${c.student_count || 0} Students`} isActive={c.id === 1} />
            )) : (
              <Text style={{ padding: 12, color: colors.onSurfaceVariant }}>No classes found.</Text>
            )}
          </View>
        </View>

        {/* Student List */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <View style={styles.rosterHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Student Roster</Text>
              <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>All Students</Text>
            </View>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainerLow }]}>
            <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
            <TextInput 
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder="Search students..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={[styles.studentsList, { borderTopColor: colors.surfaceVariant }]}>
            {students.length > 0 ? students.map((s) => (
              <StudentRow 
                key={s.id}
                name={`${s.first_name} ${s.last_name}`}
                avatarInitials={`${s.first_name[0]}${s.last_name[0]}`}
                avatarBg={colors.primaryContainer}
                avatarText={colors.onPrimaryContainer}
                status={s.status}
                statusVariant={s.status.toLowerCase() === 'absent' ? 'error' : 'success'}
                statusOutlined={s.status.toLowerCase() === 'absent'}
                onPress={() => router.push({ pathname: '/student/[id]', params: { id: s.id, name: `${s.first_name} ${s.last_name}` } })}
              />
            )) : (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: colors.onSurfaceVariant }}>No students found.</Text>
              </View>
            )}
          </View>

          {/* Pagination */}
          <View style={styles.pagination}>
            <Text style={[styles.paginationText, { color: colors.onSurfaceVariant }]}>Total {students.length} students</Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity style={styles.paginationButton} disabled>
                <MaterialIcons name="chevron-left" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.paginationButton}>
                <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>

      <AddClassModal 
        visible={isAddClassVisible}
        onClose={() => setAddClassVisible(false)}
        onAdd={handleAddClass}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  sectionContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  classesList: {
    padding: 12,
    gap: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  studentsList: {
    borderTopWidth: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  paginationText: {
    fontSize: 12,
  },
  paginationControls: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationButton: {
    padding: 4,
    borderRadius: 4,
  },
});
