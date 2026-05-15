import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalSettings } from '@/context/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopNavbarProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function TopNavbar({ title, onBack, rightElement }: TopNavbarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { settings } = useGlobalSettings();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View 
      entering={FadeInUp.duration(600).springify()}
      style={[styles.header, { 
        backgroundColor: colors.surfaceContainerLowest, 
        borderBottomColor: colors.surfaceVariant,
        paddingTop: insets.top,
        height: insets.top + 64,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }]}
    >
      <View style={styles.headerLeft}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Explorer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brand}>
            <MaterialIcons name="school" size={24} color={colors.primaryContainer} />
            <Text style={[styles.headerTitle, { color: colors.primaryContainer }]}>
              {title || "ClassMatePro"}
            </Text>
          </View>
        )}
        
        {onBack && title && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[styles.navTitle, { color: colors.onSurface }]} numberOfLines={1}>
              {title}
            </Text>
          </>
        )}
      </View>

      <View style={styles.headerRight}>
        {rightElement || (
          <View style={[styles.avatar, { 
            borderColor: colors.outlineVariant, 
            backgroundColor: colors.surfaceVariant 
          }]}>
            {settings?.admin_avatar ? (
              <Image source={{ uri: settings.admin_avatar }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={22} color={colors.outline} />
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    width: 1.5,
    height: 18,
    marginRight: 12,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
