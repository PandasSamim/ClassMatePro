import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

interface ClassItemProps {
  name: string;
  count: string;
  pendingCount?: string;
  amount?: string;
  isActive?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  index?: number;
}

export function ClassItem({ 
  name, count, pendingCount = "0", amount = "₹0", isActive, onPress, onDelete, onDownload, index = 0 
}: ClassItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).duration(400)}
      layout={Layout.springify()}
    >
      <TouchableOpacity 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: isActive ? colors.primary : 'transparent',
            borderWidth: isActive ? 1.5 : 0,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.leftSection}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerLow }]}>
            <MaterialIcons name="folder" size={24} color={colors.primary} />
          </View>
          
          <View style={styles.contentArea}>
            <Text style={[styles.title, { color: colors.onSurface }]}>{name}</Text>
            <Text style={[styles.subtitle, { color: colors.outline }]}>
              {count.split(' ')[0]} students · {pendingCount} pending
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.amountBadge, { backgroundColor: '#FFF0F0' }]}>
            <Text style={[styles.amountText, { color: '#B03535' }]}>{amount}</Text>
          </View>

          <MaterialIcons name="expand-more" size={24} color={colors.outlineVariant} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
