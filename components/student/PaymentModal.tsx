import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';

interface PaymentModalProps {
  visible: boolean;
  colors: ThemeColors;
  selectedFee: any;
  paymentAmount: string;
  onAmountChange: (amount: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModal({
  visible,
  colors,
  selectedFee,
  paymentAmount,
  onAmountChange,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  if (!selectedFee) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Make Payment</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.outline} />
            </TouchableOpacity>
          </View>

          <View style={[styles.feeSummary, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.summaryLabel, { color: colors.outline }]}>PAYING FOR</Text>
            <Text style={[styles.summaryValue, { color: colors.onSurface }]}>{selectedFee.month}</Text>
            <View style={styles.dueRow}>
              <Text style={[styles.dueLabel, { color: colors.onSurfaceVariant }]}>Due Balance:</Text>
              <Text style={[styles.dueValue, { color: colors.error }]}>₹{selectedFee.due_amount}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.outline }]}>PAYMENT AMOUNT</Text>
            <View style={[styles.amountInputWrapper, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.currencyPrefix, { color: colors.onSurfaceVariant }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.onSurface }]}
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={onAmountChange}
                placeholder="0.00"
                placeholderTextColor={colors.outlineVariant}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  feeSummary: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  dueLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dueValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontSize: 20,
    fontWeight: '700',
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
