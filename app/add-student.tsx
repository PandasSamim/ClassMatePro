import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView, Modal, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStudents } from '@/hooks/useStudents';
import { useEffect } from 'react';

export default function AddStudentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [monthlyFees, setMonthlyFees] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const [joiningDate, setJoiningDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { addStudent, classes, fetchClasses } = useStudents();
  const [classId, setClassId] = useState(1);
  const [isClassModalVisible, setClassModalVisible] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const selectedClass = classes.find(c => c.id === classId);
  const studentClassName = selectedClass ? selectedClass.name : 'Select Class';

  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setJoiningDate(formattedDate);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter the student\'s full name.');
      return;
    }
    
    const names = fullName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

    const success = await addStudent({
      first_name: firstName,
      last_name: lastName || 'Unknown',
      class_id: classId,
      status: 'Enrolled',
      phone: contactNumber,
      guardian_name: 'Not Provided',
      guardian_phone: contactNumber,
      avatar_url: imageUri || undefined
    });

    if (success) {
      Alert.alert('Success', 'Student added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to save student.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      
      {/* Top App Bar */}
      <View style={[styles.header, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.surfaceVariant }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Add New Student</Text>
        <TouchableOpacity style={styles.textButton} onPress={handleSave}>
          <Text style={[styles.textButtonLabel, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.formContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          
          {/* Photo Upload Section */}
          <View style={[styles.photoSection, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}>
            <TouchableOpacity 
              style={styles.avatarWrapper}
              onPress={pickImage}
            >
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }, imageUri ? {borderStyle: 'solid'} : {}]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: 124, height: 124, borderRadius: 62 }} />
                ) : (
                  <MaterialIcons name="person" size={48} color={colors.outline} />
                )}
              </View>
              <View style={[styles.avatarBadge, { backgroundColor: colors.primary, borderColor: colors.surfaceContainerLowest }]}>
                <MaterialIcons name="add-a-photo" size={16} color={colors.onPrimary} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoText, { color: colors.onSurfaceVariant }]}>UPLOAD PORTRAIT</Text>
          </View>

          {/* Form Fields Section */}
          <View style={styles.formFields}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Student Full Name</Text>
              <TextInput
                style={[styles.input, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                placeholderTextColor={colors.outline}
              />
            </View>

            {/* Mobile Layout: Stacked vertically instead of side-by-side */}
            
            {/* Class */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Class</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dropdownInput, { borderBottomColor: colors.outlineVariant }]}
                onPress={() => setClassModalVisible(true)}
              >
                <Text style={{ color: colors.onSurface, fontSize: 16 }}>{studentClassName}</Text>
                <MaterialIcons name="expand-more" size={24} color={colors.outline} />
              </TouchableOpacity>
            </View>

            {/* Monthly Fees */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Monthly Fees</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={[styles.prefix, { color: colors.onSurfaceVariant }]}>$</Text>
                <TextInput
                  style={[styles.input, styles.inputPrefixed, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                  value={monthlyFees}
                  onChangeText={setMonthlyFees}
                  keyboardType="numeric"
                  placeholder="500"
                  placeholderTextColor={colors.outline}
                />
              </View>
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Contact Number</Text>
              <TextInput
                style={[styles.input, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                placeholder="+91 9339049348"
                placeholderTextColor={colors.outline}
              />
            </View>

            {/* Joining Date */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Joining Date</Text>
                <Text style={[styles.hint, { color: colors.outline }]}>Tap to edit</Text>
              </View>
              <TouchableOpacity 
                style={styles.inputWithIcon}
                onPress={() => setShowDatePicker(true)}
              >
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                  value={joiningDate}
                  editable={false}
                  pointerEvents="none"
                />
                <MaterialIcons name="calendar-today" size={20} color={colors.outline} style={styles.suffixIcon} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(joiningDate)}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>

          </View>

          {/* Action Button Section */}
          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <MaterialIcons name="person-add" size={20} color={colors.onPrimary} />
              <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>Add Student</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Class Selection Modal */}
      <Modal
        visible={isClassModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setClassModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setClassModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Select Class</Text>
            {classes.map((cls) => (
              <TouchableOpacity 
                key={cls.id} 
                style={[styles.modalOption, { borderBottomColor: colors.surfaceVariant }]}
                onPress={() => {
                  setClassId(cls.id);
                  setClassModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText, 
                  { color: colors.onSurface },
                  classId === cls.id && { color: colors.primary, fontWeight: '700' }
                ]}>
                  {cls.name}
                </Text>
                {classId === cls.id && (
                  <MaterialIcons name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64, // h-16
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8, // p-2
  },
  textButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textButtonLabel: {
    fontSize: 12, // text-label-md
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700', // font-bold
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24, // p-gutter
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 768, // max-w-3xl
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  photoSection: {
    padding: 40, // p-lg
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12, // mt-sm
  },
  avatarPlaceholder: {
    width: 128, // w-32
    height: 128, // h-32
    borderRadius: 64, // rounded-full
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  photoText: {
    fontSize: 12, // text-label-md
    fontWeight: '600',
    letterSpacing: 1, // tracking-widest
  },
  formFields: {
    padding: 40, // p-lg
    gap: 24, // gap-gutter
  },
  inputGroup: {
    gap: 4, // gap-xs
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12, // text-label-md
    fontWeight: '600',
  },
  hint: {
    fontSize: 10, // text-label-sm
    fontWeight: '400',
  },
  input: {
    backgroundColor: '#F3F4F6', // bg-[#F3F4F6]
    borderBottomWidth: 2,
    borderTopLeftRadius: 6, // rounded-t-md
    borderTopRightRadius: 6,
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    fontSize: 16, // text-body-md
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
    paddingLeft: 32, // pl-8
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithIconPadding: {
    paddingRight: 40,
  },
  suffixIcon: {
    position: 'absolute',
    right: 16, // right-4
  },
  footer: {
    padding: 40, // p-lg
    borderTopWidth: 1,
    alignItems: 'flex-end', // justify-end (flex-row equivalent)
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 64, // px-xl
    paddingVertical: 12, // py-sm
    borderRadius: 9999, // rounded-full
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 12, 
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
