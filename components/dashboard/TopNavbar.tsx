import React from 'react';
import { View, Text, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalSettings } from '@/context/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TopNavbar() {
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
        <MaterialIcons name="school" size={24} color={colors.primaryContainer} />
        <Text style={[styles.headerTitle, { color: colors.primaryContainer }]}>
          ClassMatePro
        </Text>
      </View>
      <View style={[styles.avatar, { 
        borderColor: colors.outlineVariant, 
        backgroundColor: colors.surfaceVariant 
      }]}>
        {settings?.admin_avatar ? (
          <Image source={{ uri: settings.admin_avatar }} style={styles.avatarImage} />
        ) : (
          <MaterialIcons name="person" size={24} color={colors.outline} />
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
