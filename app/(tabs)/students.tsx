import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { AddClassModal } from '@/components/students/AddClassModal';
import { ClassItem } from '@/components/students/ClassItem';
import { StudentRow } from '@/components/students/StudentRow';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudents } from '@/hooks/useStudents';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeInDown, SlideInRight, SlideInLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [isAddClassVisible, setAddClassVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { classes, students, loading, fetchClasses, fetchStudents, addClass, deleteStudent, deleteClass } = useStudents();
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setOffset(0);
        fetchClasses();
        if (selectedClassId) {
          fetchStudents(selectedClassId, searchQuery, LIMIT, 0);
        }
      });
      return () => task.cancel();
    }, [selectedClassId, searchQuery, fetchClasses, fetchStudents])
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
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const success = await deleteClass(id);
            if (success) {
              if (selectedClassId === id) setSelectedClassId(undefined);
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
          } 
        }
      ]
    );
  };

  const selectedClass = selectedClassId ? classes.find(c => c.id === selectedClassId) : null;

  // View 1: List of Folders (Classes)
  const renderClassList = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.viewContainer}>
      <View style={styles.headerContainer}>
        <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Explorer</Text>
        <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Choose a folder to view files</Text>
      </View>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.classListContent}
        renderItem={({ item, index }) => (
          <ClassItem 
            name={item.name}
            count={`${item.student_count || 0} students`}
            pendingCount="4"
            amount={`₹${(item.monthly_fees || 0).toLocaleString()}`}
            isActive={false}
            onPress={() => {
              setSelectedClassId(item.id);
              fetchStudents(item.id, '', LIMIT, 0);
            }}
            onDelete={() => handleDeleteClass(item.id, item.name)}
            index={index}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity 
            style={[styles.addClassBtn, { backgroundColor: colors.primaryContainer }]} 
            onPress={() => setAddClassVisible(true)}
          >
            <MaterialIcons name="add" size={24} color={colors.onPrimaryContainer} />
            <Text style={[styles.addClassBtnText, { color: colors.onPrimaryContainer }]}>Create New Folder</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          !loading ? (
            <TouchableOpacity style={styles.emptyClasses} onPress={() => setAddClassVisible(true)}>
              <MaterialIcons name="create-new-folder" size={48} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>No classes found. Tap to add.</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </Animated.View>
  );

  // View 2: Inside Folder (Students)
  const renderStudentList = () => (
    <Animated.View entering={SlideInRight.duration(400)} style={styles.viewContainer}>
      <View style={styles.insideHeader}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surfaceContainerLow }]}
          onPress={() => setSelectedClassId(undefined)}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.pathContainer}>
          <Text style={[styles.pathRoot, { color: colors.onSurfaceVariant }]}>Explorer</Text>
          <MaterialIcons name="chevron-right" size={16} color={colors.outlineVariant} />
          <Text style={[styles.pathCurrent, { color: colors.primary }]}>{selectedClass?.name}</Text>
        </View>
      </View>

      <View style={[
        styles.searchWrapper, 
        { 
          backgroundColor: colors.surfaceContainerLow, 
          borderColor: isSearchFocused ? colors.primary : 'transparent',
          borderWidth: 1
        }
      ]}>
        <MaterialIcons name="search" size={20} color={isSearchFocused ? colors.primary : colors.outline} />
        <TextInput 
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search files..."
          placeholderTextColor={colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { color: colors.onSurfaceVariant }]}>NAME</Text>
        <Text style={[styles.tableHeaderText, { color: colors.onSurfaceVariant }]}>STATUS</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.studentListContent}
        renderItem={({ item: s, index }) => (
          <StudentRow 
            index={index}
            name={`${s.first_name} ${s.last_name}`}
            dueAmount="₹500" // Placeholder for demonstration
            onPress={() => router.push({ 
              pathname: '/student/[id]', 
              params: { id: s.id, name: `${s.first_name} ${s.last_name}` } 
            })}
            onDelete={() => handleDeleteStudent(s.id, `${s.first_name} ${s.last_name}`)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="folder-open" size={48} color={colors.outlineVariant} />
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>Folder is empty</Text>
            </View>
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-student')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="note-add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <TopNavbar />
      
      {selectedClassId ? renderStudentList() : renderClassList()}

      <AddClassModal 
        visible={isAddClassVisible}
        onClose={() => setAddClassVisible(false)}
        onAdd={handleAddClass}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  classListContent: {
    paddingBottom: 40,
  },
  addClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 24,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  addClassBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  insideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pathRoot: {
    fontSize: 16,
    fontWeight: '600',
  },
  pathCurrent: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.3,
  },
  studentListContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyClasses: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  }
});
