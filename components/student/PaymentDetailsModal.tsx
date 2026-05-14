import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';

interface PaymentDetailsModalProps {
  visible: boolean;
  colors: ThemeColors;
  fee: any;
  onClose: () => void;
}

export function PaymentDetailsModal({
  visible,
  colors,
  fee,
  onClose,
}: PaymentDetailsModalProps) {
  if (!fee) return null;

  // Use paid_at if available, otherwise fallback to created_at
  let transactionTime = fee.paid_at || fee.created_at;
  
  // If the time doesn't have a timezone (Z or +), SQLite likely stored it as UTC
  // We append 'Z' to ensure JS parses it as UTC and converts to local time.
  if (transactionTime && !transactionTime.includes('Z') && !transactionTime.includes('+')) {
    transactionTime = transactionTime.replace(' ', 'T') + 'Z';
  }
  
  const dateObj = transactionTime ? new Date(transactionTime) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Payment Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <MaterialIcons name="close" size={24} color={colors.outline} />
            </TouchableOpacity>
          </View>

          <View style={styles.mainInfo}>
            <View style={[styles.statusBadge, { backgroundColor: '#f0fdfa', borderColor: '#0d9488' }]}>
               <MaterialIcons name="check-circle" size={16} color="#0d9488" />
               <Text style={[styles.statusText, { color: '#0d9488' }]}>SUCCESSFULLY PAID</Text>
            </View>
            
            <Text style={[styles.amount, { color: colors.onSurface }]}>₹{fee.paid_amount}</Text>
            <Text style={[styles.monthSub, { color: colors.outline }]}>For {fee.month}</Text>
          </View>

          <View style={[styles.detailsList, { backgroundColor: colors.surfaceContainerLow }]}>
            <DetailRow 
              label="Transaction Date" 
              value={dateStr} 
              icon="calendar-today" 
              colors={colors} 
            />
            <DetailRow 
              label="Transaction Time" 
              value={timeStr} 
              icon="access-time" 
              colors={colors} 
            />
            <DetailRow 
              label="Payment Status" 
              value={fee.status === 'paid' ? 'Full Payment' : 'Partial Payment'} 
              icon="verified" 
              colors={colors} 
            />
            {fee.due_amount > 0 && (
              <DetailRow 
                label="Remaining Balance" 
                value={`₹${fee.due_amount}`} 
                icon="account-balance-wallet" 
                colors={colors} 
                isLast
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value, icon, colors, isLast }: any) {
  return (
    <View style={[styles.detailRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.surfaceVariant }]}>
      <View style={styles.detailLabelRow}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
        <Text style={[styles.detailLabel, { color: colors.outline }]}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color: colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeIcon: {
    padding: 4,
  },
  mainInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  amount: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 4,
  },
  monthSub: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsList: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  doneButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
