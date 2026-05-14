import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';

interface YearlyFeeCardProps {
  colors: ThemeColors;
  fees: any[];
  joiningDate?: string;
  onCardPress?: (fee: any, action: 'pay' | 'details') => void;
}

export function YearlyFeeCard({ colors, fees, joiningDate, onCardPress }: YearlyFeeCardProps) {
  const getEffectiveStatus = (fee: any) => {
    if ((fee.attendance_rate || 0) <= 0.1 && (fee.paid_amount || 0) === 0) return 'waived';
    return fee.status;
  };

  let joinYear = 0;
  if (joiningDate) {
    const d = new Date(joiningDate);
    if (!isNaN(d.getTime())) {
      joinYear = d.getFullYear();
    }
  }

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const now = new Date();

  const calendarMonths = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(selectedYear, i, 1);
    calendarMonths.push({
      year: selectedYear,
      month: i,
      key: `${selectedYear}-${String(i + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short' }),
    });
  }

  const feeMap = new Map<string, any>();
  fees.forEach((fee) => {
    let key = fee.month.replace('Invalid Date ', '');
    if (key.includes(' ')) {
      const parts = key.split(' ');
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const mIdx = monthNames.findIndex(n => n.startsWith(parts[0].toLowerCase()));
      if (mIdx !== -1 && parts[1]) {
        key = `${parts[1]}-${String(mIdx + 1).padStart(2, '0')}`;
      }
    }
    feeMap.set(key, fee);
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.primary }]}>
      <View style={[styles.header, { borderBottomColor: colors.surfaceVariant }]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="calendar-month" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onSurface }]}>Yearly Fee Tracker</Text>
        </View>

        <View style={styles.yearControl}>
          <TouchableOpacity 
            onPress={() => setSelectedYear(y => y - 1)} 
            style={[styles.arrowButton, (joinYear > 0 && selectedYear <= joinYear) && { opacity: 0.3 }]}
            disabled={joinYear > 0 && selectedYear <= joinYear}
          >
            <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.yearText, { color: colors.onSurface }]}>{selectedYear}</Text>
          <TouchableOpacity 
            onPress={() => setSelectedYear(y => y + 1)} 
            style={[styles.arrowButton, selectedYear >= now.getFullYear() && { opacity: 0.3 }]}
            disabled={selectedYear >= now.getFullYear()}
          >
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {calendarMonths.map((m) => {
          const fee = feeMap.get(m.key);
          const effStatus = fee ? getEffectiveStatus(fee) : null;
          
          let cardBg = colors.surface;
          let borderColor = colors.surfaceVariant;
          let accentColor = colors.outline;
          let statusLabel = 'N/A';
          let amount = '';
          let iconName: any = null;
          let isUpcoming = false;
          let isPreJoin = false;
          let isClickable = false;
          let action: 'pay' | 'details' = 'details';

          if (joiningDate) {
            const joinD = new Date(joiningDate);
            if (!isNaN(joinD.getTime())) {
              if (selectedYear < joinD.getFullYear() || (selectedYear === joinD.getFullYear() && m.month < joinD.getMonth())) {
                isPreJoin = true;
              }
            }
          }

          if (selectedYear > now.getFullYear() || (selectedYear === now.getFullYear() && m.month > now.getMonth())) {
            isUpcoming = true;
          }

          if (fee && !isPreJoin) {
            const effStatus = getEffectiveStatus(fee);
            amount = effStatus === 'paid' ? `₹${fee.total_amount}` : `₹${fee.due_amount}`;
            if (effStatus === 'paid') {
              cardBg = '#f0fdfa'; // Very light green
              borderColor = '#0d9488'; // Teal/Green
              accentColor = '#0d9488';
              statusLabel = 'Paid';
              iconName = null; // Removed pen icon
              isClickable = true;
              action = 'details';
            } else if (effStatus === 'waived') {
              cardBg = '#fff7ed'; // Very light orange
              borderColor = '#ea580c'; // Orange
              accentColor = '#ea580c';
              statusLabel = 'No Fees';
              iconName = 'block'; // Keep block icon for low attendance
              isClickable = false;
            } else {
              // Both Due and Partial should be Red according to rules
              const isPartial = effStatus === 'partial';
              cardBg = '#fef2f2'; // Very light red
              borderColor = '#dc2626'; // Red
              accentColor = '#dc2626';
              statusLabel = isPartial ? 'Partial Paid' : 'Due';
              iconName = null; // Removed block icon from due/partial
              isClickable = true;
              action = 'pay';
            }
          }

          const isDisabled = isUpcoming || isPreJoin || !fee;

          return (
            <Pressable 
              key={m.key}
              style={({ pressed }) => [
                styles.monthCard,
                { backgroundColor: cardBg, borderColor: borderColor },
                isDisabled && { opacity: 0.5 },
                pressed && isClickable && { transform: [{ scale: 0.98 }] }
              ]}
              disabled={!isClickable || !onCardPress}
              onPress={() => {
                if (onCardPress) {
                  // If it's a paid/partial card, clicking the body shows details
                  // If it's a due card with no payment, it might as well show pay
                  const showDetails = effStatus === 'paid' || (effStatus === 'partial' && fee.paid_amount > 0);
                  onCardPress(fee, showDetails ? 'details' : 'pay');
                }
              }}
            >
              {iconName && (
                <View style={[styles.topIcon, { backgroundColor: accentColor }]}>
                  <MaterialIcons name={iconName} size={10} color="#fff" />
                </View>
              )}
              
              <Text style={[styles.monthLabel, { color: isDisabled ? colors.outline : colors.onSurface }]}>
                {m.label}
              </Text>

              {!isDisabled && (
                <>
                  <Text style={[styles.amountText, { color: accentColor }]}>{amount}</Text>
                  
                  <View style={[styles.badge, { backgroundColor: cardBg === colors.surface ? colors.surfaceVariant : cardBg, borderColor: borderColor }]}>
                     <Text style={[styles.badgeText, { color: accentColor }]}>{statusLabel}</Text>
                  </View>

                  {(effStatus === 'due' || effStatus === 'partial') && (
                    <TouchableOpacity 
                      style={[styles.payButton, { backgroundColor: accentColor }]}
                      onPress={(e) => {
                        e.stopPropagation(); // Don't trigger the card body press
                        onCardPress && onCardPress(fee, 'pay');
                      }}
                    >
                       <Text style={styles.payButtonText}>+Pay</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {isDisabled && (
                 <Text style={styles.naText}>N/A</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderTopWidth: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  yearControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowButton: {
    padding: 4,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '31.5%',
    aspectRatio: 0.85,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  topIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  payButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  naText: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: '700',
    marginTop: 4,
  }
});
