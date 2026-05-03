import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (className: string, fees: string) => void;
}

export function AddClassModal({ visible, onClose, onAdd }: AddClassModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [className, setClassName] = useState('');
  const [monthlyFees, setMonthlyFees] = useState('');

  const handleAdd = () => {
    if (!className.trim()) {
      Alert.alert('Validation Error', 'Please enter a class name.');
      return;
    }
    if (!monthlyFees.trim()) {
      Alert.alert('Validation Error', 'Please enter the monthly fees.');
      return;
    }
    
    onAdd(className, monthlyFees);
    setClassName('');
    setMonthlyFees('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <View style={[styles.header, { borderBottomColor: colors.surfaceVariant }]}>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Add New Class</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Class Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                value={className}
                onChangeText={setClassName}
                placeholder="e.g. Class 12B"
                placeholderTextColor={colors.outline}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Monthly Fees</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={[styles.prefix, { color: colors.onSurfaceVariant }]}>₹</Text>
                <TextInput
                  style={[styles.input, styles.inputPrefixed, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                  value={monthlyFees}
                  onChangeText={setMonthlyFees}
                  keyboardType="numeric"
                  placeholder="500"
                  placeholderTextColor={colors.outline}
                />
              </View>
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: colors.surfaceVariant, backgroundColor: colors.surface }]}>
            <SafeAreaView style={styles.footerSafeArea}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelButton, { borderColor: colors.outline }]} 
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: colors.onSurface }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.footerButton, styles.applyButton, { backgroundColor: colors.primary }]} 
                onPress={handleAdd}
              >
                <MaterialIcons name="add" size={16} color={colors.onPrimary} style={{marginRight: 4}} />
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>ADD CLASS</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWithPrefix: {
    position: 'relative',
    justifyContent: 'center',
  },
  prefix: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    zIndex: 1,
  },
  inputPrefixed: {
    paddingLeft: 32,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  footerSafeArea: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  applyButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
