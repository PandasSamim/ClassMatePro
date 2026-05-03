// appe/tab/student/add-student.ts
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudents } from '@/hooks/useStudents';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function AddStudentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [fullName, setFullName] = useState('');
  const [monthlyFees, setMonthlyFees] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [status, setStatus] = useState('Enrolled');

  const today = new Date().toISOString().split('T')[0];
  const [joiningDate, setJoiningDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { addStudent, updateStudent, fetchStudentById, classes, fetchClasses } = useStudents();
  const [classId, setClassId] = useState(0);
  const [isClassModalVisible, setClassModalVisible] = useState(false);

  const prevClassIdRef = useRef<number | null>(null);

  // Load classes and student data (if editing)
  useEffect(() => {
    fetchClasses();
    if (isEditing) {
      fetchStudentById(Number(id)).then(student => {
        if (student) {
          setFullName(`${student.first_name} ${student.last_name}`);
          setClassId(student.class_id);
          setContactNumber(student.phone || '');
          setGuardianName(student.guardian_name || '');
          setGuardianPhone(student.guardian_phone || '');
          setImageUri(student.avatar_url || null);
          setStatus(student.status || 'Enrolled');
          // Note: In a real app we'd fetch join date from DB, using today for now
        }
      });
    }
  }, [id, isEditing]);

  // Handle class and fee initialization
  useEffect(() => {
    if (classes.length > 0 && classId === 0 && !isEditing) {
      setClassId(classes[0].id);
      setMonthlyFees(classes[0].monthly_fees.toString());
    } else if (classes.length > 0 && classId !== 0) {
      const currentClass = classes.find(c => c.id === classId);
      if (currentClass && (prevClassIdRef.current !== classId || (monthlyFees === '' && !isEditing))) {
        setMonthlyFees(currentClass.monthly_fees.toString());
        prevClassIdRef.current = classId;
      }
    }
  }, [classes, classId, isEditing]);

  const selectedClass = classes.find(c => c.id === classId);
  const studentClassName = selectedClass ? selectedClass.name : 'Select Class';

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
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

    if (!classId || classes.length === 0) {
      Alert.alert('Validation Error', 'Please select a class.');
      return;
    }

    const names = fullName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

    // THE FIX: We are now passing the selected joiningDate to the database payload
    // formatted as an ISO string so the database understands it.
    const studentData = {
      first_name: firstName,
      last_name: lastName || 'Unknown',
      class_id: classId,
      status: status,
      phone: contactNumber,
      guardian_name: guardianName || 'Not Provided',
      guardian_phone: guardianPhone || contactNumber,
      avatar_url: imageUri || undefined,
      enrollment_date: new Date(joiningDate).toISOString()
    };

    let success = false;
    if (isEditing) {
      success = await updateStudent(Number(id), studentData);
    } else {
      success = await addStudent(studentData);
    }

    if (success) {
      Alert.alert('Success', `Student ${isEditing ? 'updated' : 'added'} successfully!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} student.`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <Animated.View 
        entering={FadeInUp.duration(600).springify()}
        style={[styles.header, { 
          backgroundColor: colors.surfaceContainerLowest, 
          borderBottomColor: colors.surfaceVariant,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20 
        }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{isEditing ? 'Edit Student' : 'Add New Student'}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>Administrative Section</Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveIcon, { backgroundColor: colors.primaryContainer }]}
          onPress={handleSave}
        >
          <MaterialIcons name="check" size={24} color={colors.onPrimaryContainer} />
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>

            {/* Photo Upload Section */}
            <View style={[styles.photoSection, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={pickImage}
              >
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }, imageUri ? { borderStyle: 'solid' } : {}]}>
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
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Student Name"
                  placeholderTextColor={colors.outline}
                />
              </View>

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
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Monthly Fees</Text>
                  <Text style={[styles.hint, { color: colors.outline }]}>Auto-filled from class</Text>
                </View>
                <View style={styles.inputWithPrefix}>
                  <Text style={[styles.prefix, { color: colors.onSurface }]}>₹</Text>
                  <TextInput
                    style={[styles.input, styles.inputPrefixed, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                    value={monthlyFees}
                    onChangeText={setMonthlyFees}
                    keyboardType="numeric"
                    placeholder="0000"
                    placeholderTextColor={colors.outline}
                    editable={!isEditing} // Only editable for new students, linked to class for existing
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
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor={colors.outline}
                />
              </View>

              {/* Guardian Information */}
              <View style={styles.sectionDivider}>
                <Text style={[styles.sectionDividerText, { color: colors.primary }]}>Guardian Information</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Guardian Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                  value={guardianName}
                  onChangeText={setGuardianName}
                  placeholder="Guardian Name"
                  placeholderTextColor={colors.outline}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Guardian Phone</Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface, borderBottomColor: colors.outlineVariant }]}
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
                  keyboardType="phone-pad"
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor={colors.outline}
                />
              </View>

              {/* Joining Date (Only for new students for simplicity) */}
              {!isEditing && (
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
              )}

            </View>

            {/* Action Button Section */}
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <MaterialIcons name={isEditing ? "save" : "person-add"} size={20} color={colors.onPrimary} />
                <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>{isEditing ? 'Save Changes' : 'Add Student'}</Text>
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
                  setMonthlyFees((cls.monthly_fees || 0).toString());
                  prevClassIdRef.current = cls.id;
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  saveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 768,
    borderRadius: 12,
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
    padding: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  formFields: {
    padding: 20,
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  sectionDivider: {
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionDividerText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    fontSize: 10,
    fontWeight: '400',
  },
  input: {
    backgroundColor: '#F3F4F6',
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
    right: 16,
  },
  footer: {
    padding: 40,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 9999,
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