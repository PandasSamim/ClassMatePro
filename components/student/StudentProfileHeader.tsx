import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ThemeColors } from '@/constants/theme';

interface StudentProfileHeaderProps {
  colors: ThemeColors;
  studentName: string;
  studentId: string | number;
  onEditPress: () => void;
  onResultsPress: () => void;
}

export function StudentProfileHeader({ 
  colors, 
  studentName, 
  studentId, 
  onEditPress, 
  onResultsPress 
}: StudentProfileHeaderProps) {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={[styles.header, {
        backgroundColor: colors.surfaceContainerLowest,
        borderBottomColor: colors.surfaceVariant,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
        height: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 64 : 84),
      }]}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
        <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Student Profile</Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {studentName}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.actionIcon, { backgroundColor: colors.surfaceContainerHigh }]}
          onPress={onEditPress}
        >
          <MaterialIcons name="edit" size={20} color={colors.onSurface} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionIcon, { backgroundColor: colors.secondaryContainer, marginLeft: 12 }]}
          onPress={onResultsPress}
        >
          <MaterialIcons name="assessment" size={20} color={colors.onSecondaryContainer} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
