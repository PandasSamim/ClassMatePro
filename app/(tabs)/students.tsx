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
import { ActivityIndicator, Alert, FlatList, InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

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

  const StudentSkeleton = ({ colors }: { colors: any }) => (
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
      const task = InteractionManager.runAfterInteractions(() => {
        setOffset(0);
        fetchClasses();
        fetchStudents(selectedClassId, searchQuery, LIMIT, 0);
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

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TopNavbar />

      <FlatList
        data={students}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(600)}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
              <View>
                <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Students</Text>
                <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Directory & Management</Text>
              </View>
              <View style={[styles.statsCard, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.statsNumber, { color: colors.onPrimaryContainer }]}>{students.length}</Text>
                <Text style={[styles.statsLabel, { color: colors.onPrimaryContainer }]}>Total</Text>
              </View>
            </View>

            {/* Integrated Search */}
            <View style={[styles.searchWrapper, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <MaterialIcons name="search" size={22} color={colors.primary} />
              <TextInput
                style={[styles.searchInput, { color: colors.onSurface }]}
                placeholder="Search students..."
                placeholderTextColor={colors.outline}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="cancel" size={20} color={colors.outline} />
                </TouchableOpacity>
              )}
            </View>

            {/* Horizontal Classes List */}
            <View style={styles.classesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Groups</Text>
                <TouchableOpacity
                  style={[styles.addClassButton, { backgroundColor: colors.secondaryContainer }]}
                  onPress={() => setAddClassVisible(true)}
                >
                  <MaterialIcons name="add" size={18} color={colors.onSecondaryContainer} />
                  <Text style={[styles.addClassText, { color: colors.onSecondaryContainer }]}>New</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ id: 'all', name: 'All Students' }, ...classes]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isAll = item.id === 'all';
                  const isActive = isAll ? !selectedClassId : selectedClassId === item.id;
                  return (
                    <ClassItem
                      name={item.name}
                      count={isAll ? `${students.length} Total` : `${(item as any).student_count || 0} Students`}
                      isActive={isActive}
                      onPress={() => setSelectedClassId(isAll ? undefined : item.id as number)}
                      onDelete={isAll ? undefined : () => handleDeleteClass(item.id as number, item.name)}
                    />
                  );
                }}
                contentContainerStyle={styles.classesContent}
              />
            </View>

            <View style={styles.rosterHeader}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Student Roster</Text>
              <Text style={[styles.countBadge, { color: colors.primary }]}>
                {selectedClassId ? classes.find(c => c.id === selectedClassId)?.name : 'All Records'}
              </Text>
            </View>
          </Animated.View>
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: s, index }) => (
          <StudentRow
            index={index}
            name={`${s.first_name} ${s.last_name}`}
            avatarInitials={`${s.first_name[0]}${s.last_name[0]}`}
            avatarUrl={s.avatar_url || undefined}
            avatarBg={colors.primaryContainer}
            avatarText={colors.onPrimaryContainer}
            status={s.status}
            statusVariant={s.status.toLowerCase() === 'enrolled' ? 'success' : s.status.toLowerCase() === 'absent' ? 'error' : 'neutral'}
            badgeIcon={s.status.toLowerCase() === 'enrolled' ? 'verified' : undefined}
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
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12, marginTop: 12 }}>
              {[1, 2, 3, 4, 5].map(i => <StudentSkeleton key={i} colors={colors} />)}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <MaterialIcons name="person-off" size={64} color={colors.outlineVariant} />
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No Students Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>Try adjusting your search or filters.</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && students.length > 0 ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : <View style={{ height: 100 }} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/add-student')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="person-add" size={24} color={colors.onPrimary} />
      </TouchableOpacity>

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
    paddingTop: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  statsCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  classesSection: {
    marginBottom: 24,
    marginTop: -8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addClassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 4,
  },
  addClassText: {
    fontSize: 13,
    fontWeight: '700',
  },
  classesContent: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    paddingRight: 40, // Extra space at end of scroll
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 70,
    height: 24,
    borderRadius: 12,
  },
});
