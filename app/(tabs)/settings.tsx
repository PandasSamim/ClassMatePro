import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Settings</Text>
          <Text style={[styles.pageSubtitle, { color: colors.outline }]}>Manage system preferences, data backups, and administrator details.</Text>
        </View>

        <View style={styles.contentLayout}>
          
          {/* Left Column: Data Management */}
          <View style={styles.leftColumn}>
            <Card>
              <Text style={[styles.sectionTitle, { color: colors.onSurface, borderBottomColor: colors.surfaceVariant }]}>Data Management</Text>
              
              <View style={[styles.dataManagementBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceVariant }]}>
                <View style={styles.dataStatusInfo}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
                    <MaterialIcons name="backup" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.dataTextContent}>
                    <Text style={[styles.dataTitle, { color: colors.onSurface }]}>Cloud Backup Status</Text>
                    <Text style={[styles.dataSubtitle, { color: colors.outline }]}>Automated daily backups are currently active. Your last successful sync was today at 02:00 AM.</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.secondaryContainer }]}>
                      <MaterialIcons name="check-circle" size={14} color={colors.onSecondaryContainer} />
                      <Text style={[styles.statusBadgeText, { color: colors.onSecondaryContainer }]}>Healthy</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="cloud-upload" size={18} color={colors.onPrimary} />
                  <Text style={[styles.uploadButtonText, { color: colors.onPrimary }]}>Upload Data to Drive</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* Right Column: Admin & Info */}
          <View style={styles.rightColumn}>
            
            {/* Admin Details */}
            <Card>
              <View style={styles.adminProfileHeader}>
                <View style={styles.profileImageContainer}>
                  <Avatar 
                    imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBfQCFNWiETYbdQkwdCnsWz9hbn_Yl1MYv0N_HTfBMFS_M9Z61M-oORY4vjCIF62bkv4lzednI6Vb8-jiKzuX4Hz5XjWfOLACJGIkG_o-rmS0eaQMYOmhs_QlC39SkK4_RCHdyXE1HxmmDq4y-afL7jFUnBhizl8kX82q6u3fyIz0Ym3CY9cIW2_zao8oh8Pl9hpwXFfwWos-U-oqwetD4rBZ0ehKozEGQ4dr1lFFd7QsXsYExbJX6mn0LbsTfkVMOwjupzkkptEFU"
                    size={96}
                    style={{ borderWidth: 4, borderColor: colors.surface }}
                  />
                  <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]}>
                    <MaterialIcons name="edit" size={16} color={colors.onSurface} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.adminName, { color: colors.onSurface }]}>Dr. Sarah Jenkins</Text>
                <Text style={[styles.adminRole, { color: colors.primary }]}>Principal Administrator</Text>
              </View>

              <View style={styles.infoFields}>
                <View style={[styles.infoField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceVariant }]}>
                  <Text style={[styles.infoFieldLabel, { color: colors.outline }]}>EMAIL ADDRESS</Text>
                  <Text style={[styles.infoFieldValue, { color: colors.onSurface }]} numberOfLines={1}>s.jenkins@edumanager.edu</Text>
                </View>
                <View style={[styles.infoField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceVariant }]}>
                  <Text style={[styles.infoFieldLabel, { color: colors.outline }]}>INSTITUTION ID</Text>
                  <Text style={[styles.infoFieldValue, { color: colors.onSurface }]}>EDU-DIST-0492</Text>
                </View>
              </View>
            </Card>

            {/* About System */}
            <Card>
              <Text style={[styles.sectionTitleWithoutBorder, { color: colors.onSurface }]}>About System</Text>
              <View style={styles.aboutList}>
                <View style={[styles.aboutListItem, { borderBottomColor: colors.surfaceVariant }]}>
                  <Text style={[styles.aboutListLabel, { color: colors.outline }]}>Version</Text>
                  <Text style={[styles.aboutListValue, { color: colors.onSurface }]}>3.4.1 (Build 892)</Text>
                </View>
                <View style={[styles.aboutListItem, { borderBottomColor: colors.surfaceVariant }]}>
                  <Text style={[styles.aboutListLabel, { color: colors.outline }]}>Database</Text>
                  <Text style={[styles.aboutListValue, { color: colors.onSurface }]}>Connected</Text>
                </View>
                <View style={[styles.aboutListItem, styles.aboutListItemLast]}>
                  <Text style={[styles.aboutListLabel, { color: colors.outline }]}>License</Text>
                  <Text style={[styles.aboutListValue, { color: colors.onSurface }]}>Enterprise Tier</Text>
                </View>
              </View>
            </Card>

          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
  },
  contentLayout: {
    flexDirection: 'column',
    gap: 24,
    ...(Platform.OS === 'web' ? { flexDirection: 'row' } : {}),
  },
  leftColumn: {
    flex: 1,
    ...(Platform.OS === 'web' ? { flex: 2 } : {}),
  },
  rightColumn: {
    flex: 1,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  sectionTitleWithoutBorder: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  dataManagementBox: {
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    flexDirection: 'column',
    gap: 20,
    ...(Platform.OS === 'web' ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } : {}),
  },
  dataStatusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataTextContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  dataSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  adminProfileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminName: {
    fontSize: 20,
    fontWeight: '600',
  },
  adminRole: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  infoFields: {
    gap: 12,
  },
  infoField: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  infoFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoFieldValue: {
    fontSize: 16,
  },
  aboutList: {
    flexDirection: 'column',
  },
  aboutListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  aboutListItemLast: {
    borderBottomWidth: 0,
  },
  aboutListLabel: {
    fontSize: 14,
  },
  aboutListValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
