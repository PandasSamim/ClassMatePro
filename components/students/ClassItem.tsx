import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ClassItemProps {
  name: string;
  count: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function ClassItem({ name, count, isActive, onPress }: ClassItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isActive && { backgroundColor: colors.primaryContainer }
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <MaterialIcons 
          name="folder" 
          size={20} 
          color={isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant} 
        />
        <Text style={[
          styles.name,
          { color: isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant }
        ]}>
          {name}
        </Text>
      </View>
      <Text style={[
        styles.count,
        { color: isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant },
        { opacity: isActive ? 0.8 : 0.6 }
      ]}>
        {count}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  count: {
    fontSize: 12,
  },
});
