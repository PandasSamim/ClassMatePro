import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StudentHeroCardProps {
  studentName: string;
  studentStatus: string;
  studentClass: string;
  studentId: string;
  studentPhone: string;
  avatarUrl?: string;
}

export function StudentHeroCard({
  studentName,
  studentStatus,
  studentClass,
  studentId,
  studentPhone,
  avatarUrl,
}: StudentHeroCardProps) {
  return (
    <View style={styles.profileCard}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 24 }}
      >
        <View style={styles.profileHeaderContent}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={48} color="white" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.studentName}>{studentName}</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{studentStatus.toUpperCase()}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={[styles.smallIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <MaterialIcons name="class" size={14} color="#34d399" />
                </View>
                <Text style={styles.detailText}>{studentClass}</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.smallIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <MaterialIcons name="badge" size={14} color="#60a5fa" />
                </View>
                <Text style={styles.detailText}>{studentId}</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.smallIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <MaterialIcons name="call" size={14} color="#fbbf24" />
                </View>
                <Text style={styles.detailText}>{studentPhone}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusBadge: {
    backgroundColor: '#fcd34d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    color: '#78350f',
    fontSize: 10,
    fontWeight: '900',
  },
  detailsGrid: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});
