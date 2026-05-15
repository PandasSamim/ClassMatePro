import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { StudentAttendance } from '../../hooks/useDashboard';

export function StudentAttendanceLeaderboard({ data = [] }: { data: StudentAttendance[] }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return 'rgba(255,255,255,0.2)';
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#003fb1', '#006c4b', '#5e00cd', '#8b2500', '#006874'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.cardHeader}>
        <View style={[styles.headerIconBox, { backgroundColor: '#5e00cd' }]}>
          <MaterialIcons name="emoji-events" size={22} color="#d3baff" />
        </View>
        <View style={styles.headerTexts}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Attendance Stars</Text>
          <Text style={[styles.cardSubtitle, { color: colors.outline }]}>Top students by attendance</Text>
        </View>
      </View>

      <View style={[styles.darkCard, { backgroundColor: '#5e00cd' }]}>
        <View style={styles.glowShell}>
          <View style={styles.glowTop} />
        </View>

        {data.length > 0 ? (
          <View style={styles.listContainer}>
            {data.map((item, index) => (
              <View key={item.id} style={styles.rankRow}>
                <View style={styles.rankNumberContainer}>
                  {index < 3 ? (
                    <MaterialIcons name="workspace-premium" size={24} color={getRankColor(index)} />
                  ) : (
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  )}
                </View>
                
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
                  {item.avatar_url ? (
                    <Image 
                      source={{ uri: item.avatar_url }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                  )}
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.className}>{item.className}</Text>
                </View>

                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{Math.round(item.percentage)}%</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="sentiment-neutral" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No star students yet</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  darkCard: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#5e00cd',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowShell: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(211,186,255,0.15)',
  },
  glowTop: {
    width: '100%',
    height: '100%',
  },
  listContainer: {
    gap: 10,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    borderRadius: 18,
    gap: 12,
  },
  rankNumberContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '800',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  className: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
  },
});
