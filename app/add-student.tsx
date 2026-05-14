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
          if (student.enrollment_date) {
            setJoiningDate(student.enrollment_date.split('T')[0]);
          }
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

    let success: boolean | number = false;
    if (isEditing) {
      success = await updateStudent(Number(id), studentData);
    } else {
      success = await addStudent(studentData);
    }

    if (success) {
      router.back();
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
          backgroundColor: colors.surface, 
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 
        }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back-ios" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{isEditing ? 'Edit Student' : 'New Student'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.headerSaveButton}
          onPress={handleSave}
        >
          <Text style={[styles.headerSaveText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInUp.delay(100).duration(600).springify()} style={[styles.formContainer, { backgroundColor: colors.surfaceContainerLowest }]}>

            {/* Photo Upload Section */}
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={pickImage}
              >
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }, imageUri ? { borderStyle: 'solid', borderWidth: 0 } : {}]}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, borderRadius: 60 }} />
                  ) : (
                    <MaterialIcons name="camera-alt" size={40} color={colors.outline} />
                  )}
                </View>
                {!imageUri && (
                  <View style={[styles.avatarBadge, { backgroundColor: colors.primary, borderColor: colors.surfaceContainerLowest }]}>
                    <MaterialIcons name="add" size={18} color={colors.onPrimary} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.photoText, { color: colors.onSurfaceVariant }]}>{imageUri ? 'Tap to change photo' : 'Upload Student Photo'}</Text>
            </View>

            {/* Form Fields Section */}
            <View style={styles.formFields}>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Full Name <Text style={{color: colors.error}}>*</Text></Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={colors.outline}
                />
              </View>

              {/* Class */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Class <Text style={{color: colors.error}}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownInput, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                  onPress={() => setClassModalVisible(true)}
                >
                  <Text style={{ color: classId ? colors.onSurface : colors.outline, fontSize: 16 }}>{classId ? studentClassName : 'Select a class'}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.outline} />
                </TouchableOpacity>
              </View>

              {/* Monthly Fees */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Monthly Fees</Text>
                  <Text style={[styles.hint, { color: colors.outline }]}>Auto-filled</Text>
                </View>
                <View style={styles.inputWithPrefix}>
                  <Text style={[styles.prefix, { color: colors.onSurface }]}>₹</Text>
                  <TextInput
                    style={[styles.input, styles.inputPrefixed, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                    value={monthlyFees}
                    onChangeText={setMonthlyFees}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.outline}
                    editable={!isEditing}
                  />
                </View>
              </View>

              {/* Contact Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Contact Number</Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                  placeholder="10-digit mobile number"
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
                  style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                  value={guardianName}
                  onChangeText={setGuardianName}
                  placeholder="e.g. Robert Doe"
                  placeholderTextColor={colors.outline}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Guardian Phone</Text>
                <TextInput
                  style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
                  keyboardType="phone-pad"
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.outline}
                />
              </View>

              {/* Joining Date */}
               <View style={styles.inputGroup}>
                 <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Joining Date</Text>
                 <TouchableOpacity
                   style={styles.inputWithIcon}
                   onPress={() => setShowDatePicker(true)}
                 >
                   <TextInput
                     style={[styles.input, styles.inputWithIconPadding, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }]}
                     value={joiningDate}
                     editable={false}
                     pointerEvents="none"
                   />
                   <MaterialIcons name="event" size={22} color={colors.outline} style={styles.suffixIcon} />
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
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>{isEditing ? 'Save Changes' : 'Add Student'}</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
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
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
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
                  classId === cls.id && { color: colors.primary, fontWeight: '600' }
                ]}>
                  {cls.name}
                </Text>
                {classId === cls.id && (
                  <MaterialIcons name="check-circle" size={22} color={colors.primary} />
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 5,
    overflow: 'hidden',
  },
  photoSection: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  photoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formFields: {
    paddingHorizontal: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    paddingLeft: 36,
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
    paddingRight: 48,
  },
  suffixIcon: {
    position: 'absolute',
    right: 16,
  },
  sectionDivider: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionDividerText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  footer: {
    padding: 24,
    paddingTop: 32,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
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