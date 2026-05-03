import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, StatusBar, Alert, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClassItem } from '@/components/students/ClassItem';
import { StudentRow } from '@/components/students/StudentRow';
import { AddClassModal } from '@/components/students/AddClassModal';
import { useRouter, useFocusEffect } from 'expo-router';
import { useStudents } from '@/hooks/useStudents';
import { useEffect, useCallback } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { TopNavbar } from '@/components/dashboard/TopNavbar';

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [isAddClassVisible, setAddClassVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { classes, students, loading, fetchClasses, fetchStudents, addClass, deleteStudent, deleteClass } = useStudents();
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const StudentSkeleton = () => (
    <View style={[styles.skeletonRow, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant }]}>
      <View style={[styles.skeletonAvatar, { backgroundColor: colors.surfaceVariant }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { width: '60%', height: 14, backgroundColor: colors.surfaceVariant }]} />
        <View style={[styles.skeletonLine, { width: '40%', height: 10, backgroundColor: colors.surfaceVariant }]} />
      </View>
      <View style={[styles.skeletonBadge, { backgroundColor: colors.surfaceVariant }]} />
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      setOffset(0);
      fetchClasses();
      fetchStudents(selectedClassId, searchQuery, LIMIT, 0);
    }, [selectedClassId, searchQuery])
  );

  const handleLoadMore = () => {
    if (loading || students.length < LIMIT + offset) return;
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchStudents(selectedClassId, searchQuery, LIMIT, nextOffset);
  };

  const handleAddClass = async (className: string, fees: string) => {
    const success = await addClass(className, 'TBD', parseFloat(fees) || 0);
    if (success) {
      Alert.alert("Success", `Class ${className} added!`);
      setAddClassVisible(false);
    } else {
      Alert.alert("Error", "Failed to add class.");
    }
  };

  const handleDeleteClass = (id: number, name: string) => {
    Alert.alert(
      "Delete Class",
      `Are you sure you want to delete ${name}? All student associations will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const success = await deleteClass(id);
            if (success) {
              if (selectedClassId === id) setSelectedClassId(undefined);
              Alert.alert("Success", "Class deleted successfully.");
            } else {
              Alert.alert("Error", "Could not delete class.");
            }
          } 
        }
      ]
    );
  };

  const handleDeleteStudent = (id: number, name: string) => {
    Alert.alert(
      "Delete Student",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const success = await deleteStudent(id);
            if (success) {
              Alert.alert("Success", "Student deleted successfully.");
            } else {
              Alert.alert("Error", "Could not delete student.");
            }
          } 
        }
      ]
    );
  };


  const Header = () => (
    <>
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
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: !selectedClassId ? colors.primaryContainer : 'transparent', borderRadius: 8 }]}
              onPress={() => setSelectedClassId(undefined)}
            >
              <MaterialIcons name="all-inclusive" size={20} color={!selectedClassId ? colors.onPrimaryContainer : colors.primary} />
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
            <ClassItem 
              key={c.id} 
              name={c.name} 
              count={`${c.student_count || 0} Students`} 
              isActive={selectedClassId === c.id} 
              onPress={() => setSelectedClassId(c.id)}
              onDelete={() => handleDeleteClass(c.id, c.name)}
            />
          )) : (
            <Text style={{ padding: 12, color: colors.onSurfaceVariant }}>No classes found.</Text>
          )}
        </View>
      </View>

      {/* Student List Section Header */}
      <View style={[styles.rosterCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
        <View style={styles.rosterHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Student Roster</Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
              {selectedClassId ? classes.find(c => c.id === selectedClassId)?.name : 'All Students'}
            </Text>
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
      </View>
    </>
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TopNavbar />
      <FlatList
        data={students}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Header />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: s, index }) => {
          const isOdd = index % 2 !== 0;
          const brandTint = `${colors.primary}0D`;
          const zebraColor = isOdd ? brandTint : colors.surfaceContainerLowest;

          return (
            <View style={{ backgroundColor: zebraColor, paddingHorizontal: 12, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.outlineVariant }}>
              <StudentRow 
                name={`${s.first_name} ${s.last_name}`}
                avatarInitials={`${s.first_name[0]}${s.last_name[0]}`}
                avatarUrl={s.avatar_url || undefined}
                avatarBg={colors.primaryContainer}
                avatarText={colors.onPrimaryContainer}
                status={s.status}
                statusVariant={s.status.toLowerCase() === 'absent' ? 'error' : s.status.toLowerCase() === 'enrolled' ? 'neutral' : 'success'}
                statusOutlined={s.status.toLowerCase() === 'absent'}
                onPress={() => router.push({ 
                  pathname: '/student/[id]', 
                  params: { 
                    id: s.id, 
                    name: `${s.first_name} ${s.last_name}`,
                    avatarUrl: s.avatar_url || ''
                  } 
                })}
                onDelete={() => handleDeleteStudent(s.id, `${s.first_name} ${s.last_name}`)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12, marginTop: 12, paddingHorizontal: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => <StudentSkeleton key={i} />)}
            </View>
          ) : (
            <View style={{ padding: 48, alignItems: 'center', gap: 16, backgroundColor: colors.surfaceContainerLowest, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.outlineVariant, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
              <MaterialIcons name="person-off" size={48} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, fontWeight: '600' }}>No students found.</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && students.length > 0 ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : students.length > 0 ? (
             <View style={{ height: 20, backgroundColor: colors.surfaceContainerLowest, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.outlineVariant, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 40, marginTop: -1 }} />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <AddClassModal 
        visible={isAddClassVisible}
        onClose={() => setAddClassVisible(false)}
        onAdd={handleAddClass}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 60,
    height: 20,
    borderRadius: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  rosterCard: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    marginTop: 8,
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
    marginHorizontal: 12,
    marginBottom: 16,
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
