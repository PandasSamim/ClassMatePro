import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalSettings } from '@/context/SettingsContext';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { clearDatabase, DB_NAME } from '@/services/database';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceVariant }, style]}>
      {children}
    </View>
  );
};

import { TopNavbar } from '@/components/dashboard/TopNavbar';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { settings, fetchSettings, updateSettings } = useGlobalSettings();
  const db = useSQLiteContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    admin_name: '',
    admin_email: '',
    admin_avatar: ''
  });




  useEffect(() => {
    if (settings) {
      setEditForm({
        admin_name: settings.admin_name,
        admin_email: settings.admin_email,
        admin_avatar: settings.admin_avatar || ''
      });
    }
  }, [settings]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setEditForm(prev => ({ ...prev, admin_avatar: uri }));
      // If not in editing mode, save immediately
      if (!isEditing) {
        await updateSettings({ ...editForm, admin_avatar: uri });
      }
    }
  };

  const handleSaveSettings = async () => {
    const success = await updateSettings(editForm);
    if (success) {
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } else {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleWipeData = async () => {
    Alert.alert(
      "Wipe All Data",
      "This will permanently delete EVERYTHING (Students, Classes, Attendance) from your phone. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Wipe Data", 
          style: "destructive",
          onPress: async () => {
            const success = await clearDatabase(db);
            if (success) Alert.alert("Success", "All local data has been cleared.");
          }
        }
      ]
    );
  };
 
  const handleImportDatabase = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/x-sqlite3', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });
 
      if (result.canceled) return;
 
      const selectedFile = result.assets[0];
      
      // Basic validation: check file extension if possible
      if (!selectedFile.name.endsWith('.db')) {
        const confirm = await new Promise((resolve) => {
          Alert.alert(
            "Warning", 
            "Selected file doesn't have a .db extension. Are you sure it's a valid database?",
            [
              { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
              { text: "Import Anyway", onPress: () => resolve(true) }
            ]
          );
        });
        if (!confirm) return;
      }
 
      Alert.alert(
        "Import Database",
        "This will OVERWRITE all your current data. This cannot be undone. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Import & Overwrite", 
            style: "destructive",
            onPress: async () => {
              try {
                const dbPath = `${(FileSystem as any).documentDirectory}SQLite/${DB_NAME}`;
                
                // Ensure SQLite directory exists
                const dirInfo = await FileSystem.getInfoAsync(`${(FileSystem as any).documentDirectory}SQLite/`);
                if (!dirInfo.exists) {
                  await FileSystem.makeDirectoryAsync(`${(FileSystem as any).documentDirectory}SQLite/`, { intermediates: true });
                }
 
                // Overwrite the database file
                await FileSystem.copyAsync({
                  from: selectedFile.uri,
                  to: dbPath
                });
 
                Alert.alert(
                  "Success", 
                  "Database imported successfully! Please RESTART the app to apply changes.",
                  [{ text: "OK" }]
                );
              } catch (e) {
                console.error('Import process failed:', e);
                Alert.alert("Error", "Failed to overwrite database file.");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert("Error", "Failed to select or process the database file.");
    }
  };

  const handleExportDatabase = async () => {
    try {
      const dbPath = `${(FileSystem as any).documentDirectory}SQLite/${DB_NAME}`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!fileInfo.exists) {
        Alert.alert("Error", "Database file not found. Try adding some data first.");
        return;
      }
 
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert("Permission Required", "You need to grant permission to save the file to your device.");
          return;
        }
 
        try {
          const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            DB_NAME,
            'application/x-sqlite3'
          );
          
          const base64 = await FileSystem.readAsStringAsync(dbPath, { 
            encoding: (FileSystem as any).EncodingType.Base64 
          });
          
          await FileSystem.writeAsStringAsync(destinationUri, base64, { 
            encoding: (FileSystem as any).EncodingType.Base64 
          });
          
          Alert.alert("Success", "Database has been saved to your selected folder.");
        } catch (e) {
          console.error('Android Save Error:', e);
          Alert.alert("Error", "Failed to save file. Make sure you selected a valid folder.");
        }
      } else {
        // iOS: sharing is the standard way to "Save to Files"
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert("Error", "Sharing is not available on this device.");
          return;
        }
 
        await Sharing.shareAsync(dbPath, {
          mimeType: 'application/x-sqlite3',
          dialogTitle: 'Save Database Backup',
          UTI: 'public.database'
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert("Error", "Failed to export database. Please try again.");
    }
  };



  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TopNavbar />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Settings</Text>
          <Text style={[styles.pageSubtitle, { color: colors.outline }]}>Manage your administrator profile and application data.</Text>
          
        </View>

        <View style={styles.contentLayout}>
          
          {/* Left Column: Admin Profile */}
          <View style={styles.leftColumn}>
            <Card>
              <View style={styles.adminProfileHeader}>
                <View style={styles.profileImageContainer}>
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                    <View style={[styles.avatarContainer, { borderColor: colors.primary, backgroundColor: colors.surfaceVariant }]}>
                      {editForm.admin_avatar || settings?.admin_avatar ? (
                        <Image 
                          source={{ uri: editForm.admin_avatar || settings?.admin_avatar }} 
                          style={styles.avatarImage} 
                        />
                      ) : (
                        <MaterialIcons name="person" size={48} color={colors.outline} />
                      )}
                      <View style={[styles.addPhotoOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                        <MaterialIcons name="camera-alt" size={18} color="white" />
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editButton, { backgroundColor: isEditing ? colors.primary : colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]}
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <MaterialIcons name={isEditing ? "close" : "edit"} size={16} color={isEditing ? colors.onPrimary : colors.onSurface} />
                  </TouchableOpacity>
                </View>

                {isEditing ? (
                  <TextInput 
                    style={[styles.adminNameInput, { color: colors.onSurface, borderBottomColor: colors.primary }]}
                    value={editForm.admin_name}
                    onChangeText={(text) => setEditForm(prev => ({...prev, admin_name: text}))}
                    placeholder="Administrator Name"
                    autoFocus
                  />
                ) : (
                  <Text style={[styles.adminName, { color: colors.onSurface }]}>{settings?.admin_name || 'Administrator'}</Text>
                )}
                <Text style={[styles.adminRole, { color: colors.primary }]}>SYSTEM ADMINISTRATOR</Text>
              </View>

              <View style={styles.infoFields}>
                <View style={[styles.infoField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceVariant }]}>
                  <Text style={[styles.infoFieldLabel, { color: colors.outline }]}>EMAIL ADDRESS</Text>
                  {isEditing ? (
                    <TextInput 
                      style={[styles.infoFieldValueInput, { color: colors.onSurface }]}
                      value={editForm.admin_email}
                      onChangeText={(text) => setEditForm(prev => ({...prev, admin_email: text}))}
                      placeholder="admin@example.com"
                      keyboardType="email-address"
                    />
                  ) : (
                    <Text style={[styles.infoFieldValue, { color: colors.onSurface }]} numberOfLines={1}>{settings?.admin_email || 'not set'}</Text>
                  )}
                </View>
              </View>

              {isEditing && (
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.primary, marginTop: 24 }]}
                  onPress={handleSaveSettings}
                >
                  <MaterialIcons name="save" size={18} color={colors.onPrimary} />
                  <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Save Profile</Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>

          {/* Right Column: Data & Info */}
          <View style={styles.rightColumn}>

            <Card>
              <Text style={[styles.sectionTitle, { color: colors.onSurface, borderBottomColor: colors.surfaceVariant }]}>Data Management</Text>
              
              <View style={styles.dataManagementStack}>
                <TouchableOpacity 
                  style={[styles.uploadButton, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant, borderWidth: 1 }]}
                  onPress={handleImportDatabase}
                >
                  <MaterialIcons name="file-upload" size={18} color={colors.primary} />
                  <Text style={[styles.uploadButtonText, { color: colors.onSurface }]}>Import Database</Text>
                </TouchableOpacity>
 
                <TouchableOpacity 
                  style={[styles.uploadButton, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant, borderWidth: 1 }]}
                  onPress={handleExportDatabase}
                >
                  <MaterialIcons name="storage" size={18} color={colors.primary} />
                  <Text style={[styles.uploadButtonText, { color: colors.onSurface }]}>Download Database</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.uploadButton, { backgroundColor: colors.errorContainer, borderColor: colors.error, borderWidth: 1 }]}
                  onPress={handleWipeData}
                >
                  <MaterialIcons name="delete-forever" size={18} color={colors.onErrorContainer} />
                  <Text style={[styles.uploadButtonText, { color: colors.onErrorContainer }]}>Wipe All Data</Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Card>
              <Text style={[styles.sectionTitleWithoutBorder, { color: colors.onSurface }]}>System Info</Text>
              <View style={styles.aboutList}>
                <View style={[styles.aboutListItem, { borderBottomColor: colors.surfaceVariant }]}>
                  <Text style={[styles.aboutListLabel, { color: colors.outline }]}>Version</Text>
                  <Text style={[styles.aboutListValue, { color: colors.onSurface }]}>1.0.0</Text>
                </View>
                <View style={[styles.aboutListItem, { borderBottomColor: colors.surfaceVariant }]}>
                  <Text style={[styles.aboutListLabel, { color: colors.outline }]}>Database</Text>
                  <Text style={[styles.aboutListValue, { color: colors.onSurface }]}>SQLite</Text>
                </View>
                <View style={[styles.aboutListItem, styles.aboutListItemLast]}>
                  <Text style={[styles.aboutListLabel, { color: colors.outline }]}>Storage</Text>
                  <Text style={[styles.aboutListValue, { color: colors.onSurface }]}>Offline</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    ...(Platform.OS === 'web' ? { flex: 1.5 } : {}),
  },
  rightColumn: {
    flex: 1,
    gap: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  adminProfileHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  adminName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  adminNameInput: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    borderBottomWidth: 2,
    paddingVertical: 4,
    width: '100%',
    textAlign: 'center',
  },
  adminRole: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 6,
    opacity: 0.8,
  },
  infoFields: {
    marginTop: 32,
    gap: 16,
  },
  infoField: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoFieldValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoFieldValueInput: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 2,
  },
  saveButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  sectionTitleWithoutBorder: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  dataManagementStack: {
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  aboutList: {
    gap: 16,
  },
  aboutListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  aboutListItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  aboutListLabel: {
    fontSize: 15,
  },
  aboutListValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
