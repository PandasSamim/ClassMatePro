import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { AddClassModal } from '@/components/students/AddClassModal';
import { StudentRow } from '@/components/students/StudentRow';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudents } from '@/hooks/useStudents';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ACCENT_PALETTES = [
  { bg: '#003fb1', icon: '#b5c4ff' },
  { bg: '#006c4b', icon: '#9ff2cc' },
  { bg: '#5e00cd', icon: '#d3baff' },
  { bg: '#8b2500', icon: '#ffb594' },
  { bg: '#006874', icon: '#82d3e0' },
  { bg: '#6e2f00', icon: '#ffb77c' },
];

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
      Alert.alert('Success', `Class ${className} added!`);
      setAddClassVisible(false);
    } else {
      Alert.alert('Error', 'Failed to add class.');
    }
  };

  const handleDeleteClass = (id: number, name: string) => {
    Alert.alert('Delete Class', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteClass(id);
          if (selectedClassId === id) setSelectedClassId(undefined);
        },
      },
    ]);
  };

  const handleDeleteStudent = (id: number, name: string) => {
    Alert.alert('Delete Student', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => { await deleteStudent(id); },
      },
    ]);
  };

  const selectedClass = selectedClassId ? classes.find((c) => c.id === selectedClassId) : null;

  // ─── View 1: Folder Explorer ──────────────────────────────────────────────
  const renderFolders = () => (
    <Animated.View entering={FadeInUp.duration(700)} style={styles.view}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View>
            <Text style={[styles.heroLabel, { color: colors.outline }]}>STUDENT EXPLORER</Text>
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>My Classes</Text>
          </View>
          <View style={[styles.heroPill, { backgroundColor: colors.primaryFixed }]}>
            <MaterialIcons name="folder" size={14} color={colors.onPrimaryFixed} />
            <Text style={[styles.heroPillText, { color: colors.onPrimaryFixed }]}>
              {classes.length} Folders
            </Text>
          </View>
        </View>

        {/* Horizontal Album Cards */}
        <FlatList
          data={classes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.albumList}
          renderItem={({ item, index }) => {
            const pal = ACCENT_PALETTES[index % ACCENT_PALETTES.length];
            return (
              <Animated.View entering={FadeInUp.delay(index * 80).springify()}>
                <TouchableOpacity
                  style={[styles.albumCard, { backgroundColor: pal.bg }]}
                  onPress={() => {
                    setSelectedClassId(item.id);
                    fetchStudents(item.id, '', LIMIT, 0);
                  }}
                  onLongPress={() => handleDeleteClass(item.id, item.name)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.glowCircle1, { backgroundColor: pal.icon }]} />
                  <View style={[styles.glowCircle2, { backgroundColor: pal.icon }]} />

                  <View style={styles.albumBadge}>
                    <Text style={styles.albumBadgeText}>{item.student_count || 0}</Text>
                  </View>

                  <View style={styles.albumIconBox}>
                    <MaterialIcons name="folder" size={40} color={pal.icon} />
                  </View>

                  <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.albumFooter}>
                    <Text style={styles.albumMeta}>{item.student_count || 0} students</Text>
                    <View style={styles.albumArrow}>
                      <MaterialIcons name="arrow-forward" size={14} color="rgba(255,255,255,0.9)" />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}

        />

        {/* All Folders List */}
        <View style={styles.allList}>
          <Text style={[styles.allListLabel, { color: colors.onSurface }]}>All Folders</Text>
          {classes.map((item, index) => {
            const pal = ACCENT_PALETTES[index % ACCENT_PALETTES.length];
            return (
              <Animated.View key={item.id} entering={FadeInUp.delay(50 + index * 60)}>
                <TouchableOpacity
                  style={[styles.folderRow, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
                  onPress={() => {
                    setSelectedClassId(item.id);
                    fetchStudents(item.id, '', LIMIT, 0);
                  }}
                >
                  <View style={[styles.folderRowIcon, { backgroundColor: pal.bg }]}>
                    <MaterialIcons name="folder" size={20} color={pal.icon} />
                  </View>
                  <View style={styles.folderRowInfo}>
                    <Text style={[styles.folderRowName, { color: colors.onSurface }]}>{item.name}</Text>
                    <Text style={[styles.folderRowMeta, { color: colors.outline }]}>
                      {item.student_count || 0} students · ₹{(item.monthly_fees || 0).toLocaleString()} /mo
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          {classes.length === 0 && !loading && (
            <View style={styles.emptyView}>
              <MaterialIcons name="folder-open" size={56} color={colors.outlineVariant} />
              <Text style={{ color: colors.outline, marginTop: 12 }}>No classes yet. Tap New Class to create.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Class Button */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setAddClassVisible(true)}
        >
          <MaterialIcons name="create-new-folder" size={26} color={colors.onPrimary} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  // ─── View 2: Student Roster ────────────────────────────────────────────────
  const renderRoster = () => {
    const classIndex = classes.findIndex(c => c.id === selectedClassId);
    const pal = ACCENT_PALETTES[classIndex % ACCENT_PALETTES.length];

    return (
      <Animated.View entering={SlideInRight.duration(400)} style={styles.view}>
        {/* Class Banner Header */}
        <View style={[styles.rosterBanner, { backgroundColor: pal.bg }]}>
          <View style={styles.rosterBannerTop}>
            <TouchableOpacity
              style={styles.rosterBackBtn}
              onPress={() => setSelectedClassId(undefined)}
            >
              <MaterialIcons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <View style={styles.rosterBannerInfo}>
              <Text style={styles.rosterBannerLabel}>CLASS DIRECTORY</Text>
              <Text style={styles.rosterBannerTitle} numberOfLines={1}>{selectedClass?.name}</Text>
            </View>
            <View style={[styles.rosterCountBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.rosterCountText}>{students.length}</Text>
              <Text style={styles.rosterCountLabel}>FILES</Text>
            </View>
          </View>

          {/* Search Bar inside banner */}
          <View style={[styles.rosterSearch, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.rosterSearchInput}
              placeholder="Search student name..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.rosterListContent}
          ListHeaderComponent={
            <View style={styles.rosterListHeader}>
              <Text style={[styles.rosterListLabel, { color: colors.outline }]}>
                {students.length} RECORDS FOUND
              </Text>
            </View>
          }
          renderItem={({ item: s, index }) => (
            <StudentRow
              index={index}
              name={`${s.first_name} ${s.last_name}`}
              dueAmount="₹500"
              onPress={() =>
                router.push({
                  pathname: '/student/[id]',
                  params: { id: s.id, name: `${s.first_name} ${s.last_name}` },
                })
              }
              onDelete={() => handleDeleteStudent(s.id, `${s.first_name} ${s.last_name}`)}
            />
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
            ) : (
              <View style={styles.emptyView}>
                <MaterialIcons name="person-off" size={56} color={colors.outlineVariant} />
                <Text style={{ color: colors.outline, marginTop: 12 }}>No students in this folder.</Text>
              </View>
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />

        <Animated.View entering={FadeInDown.delay(300)} style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: pal.bg }]}
            onPress={() => router.push('/add-student')}
          >
            <MaterialIcons name="person-add" size={26} color="rgba(255,255,255,0.95)" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <TopNavbar />
      {selectedClassId ? renderRoster() : renderFolders()}
      <AddClassModal
        visible={isAddClassVisible}
        onClose={() => setAddClassVisible(false)}
        onAdd={handleAddClass}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  view: { flex: 1 },

  // Hero
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Album Cards (horizontal scroll)
  albumList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  albumCard: {
    width: 160,
    height: 200,
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glowCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    right: -30,
    opacity: 0.15,
  },
  glowCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    bottom: 20,
    left: -20,
    opacity: 0.1,
  },
  albumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 'auto' as any,
  },
  albumBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  albumIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 'auto' as any,
  },
  albumName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  albumFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  albumMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  albumArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumAddCard: {
    width: 100,
    height: 200,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  albumAddCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumAddText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },

  // All Folders list
  allList: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  allListLabel: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  folderRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderRowInfo: { flex: 1 },
  folderRowName: { fontSize: 15, fontWeight: '700' },
  folderRowMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  emptyView: {
    paddingVertical: 60,
    alignItems: 'center',
    opacity: 0.4,
  },

  // Roster
  rosterBanner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  rosterBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rosterBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterBannerInfo: {
    flex: 1,
  },
  rosterBannerLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  rosterBannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  rosterCountBadge: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  rosterCountText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  rosterCountLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rosterSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  rosterSearchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  rosterListContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  rosterListHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  rosterListLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 32,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
});
