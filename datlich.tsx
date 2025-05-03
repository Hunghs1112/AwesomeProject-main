import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import Menu from './menu';

interface UserData {
  id?: number;
  ho_ten?: string;
  phone_email?: string;
  gioi_tinh?: string;
  ngay_sinh?: string;
  so_dien_thoai?: string;
  email?: string;
  tinh?: string;
  quan?: string;
  phuong?: string;
  dia_chi?: string;
}

interface DatLichProps {
  userData: UserData | null;
  handleMenuPress: (menu: string) => void;
}

// Component for the header
const BookingHeader: React.FC = () => {
  return (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Đặt lịch</Text>
    </View>
  );
};

// Custom Picker Item Component
interface PickerItem {
  value: number;
  label: string;
}

const PickerWheel = memo(
  ({ items, selectedValue, onValueChange }: {
    items: PickerItem[];
    selectedValue: number;
    onValueChange: (value: number) => void;
  }) => {
    const animatedScale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(animatedScale, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.value.toString()}
        showsVerticalScrollIndicator={false}
        style={styles.pickerWheel}
        snapToInterval={40}
        decelerationRate={0.85}
        initialNumToRender={8}
        windowSize={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.pickerItem,
              item.value === selectedValue && styles.pickerItemSelected,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => onValueChange(item.value)}
          >
            <Animated.Text
              style={[
                styles.pickerItemText,
                item.value === selectedValue && styles.pickerItemTextSelected,
                { transform: [{ scale: animatedScale }] },
              ]}
            >
              {item.label}
            </Animated.Text>
          </TouchableOpacity>
        )}
        getItemLayout={(data, index) => ({
          length: 40,
          offset: 40 * index,
          index,
        })}
        initialScrollIndex={items.findIndex((item) => item.value === selectedValue)}
      />
    );
  }
);

const DatLich: React.FC<DatLichProps> = ({ userData, handleMenuPress }) => {
  const isLoggedIn = !!userData;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [serviceType, setServiceType] = useState<string>('Bảo dưỡng');
  const [notes, setNotes] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState<boolean>(false);
  const slideAnim = useState(new Animated.Value(300))[0];

  // Picker states
  const [pickerDay, setPickerDay] = useState<number>(1);
  const [pickerMonth, setPickerMonth] = useState<number>(1);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());
  const [pickerHour, setPickerHour] = useState<number>(8);
  const [pickerMinute, setPickerMinute] = useState<number>(0);

  // Generate picker items
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString().padStart(2, '0'),
  }));
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString().padStart(2, '0'),
  }));
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year, label: year.toString() };
  });
  const hours = Array.from({ length: 16 }, (_, i) => ({
    value: i + 8,
    label: (i + 8).toString().padStart(2, '0'),
  }));
  const minutes = [0, 15, 30, 45].map((m) => ({
    value: m,
    label: m.toString().padStart(2, '0'),
  }));

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Chọn ngày';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (time: Date | null): string => {
    if (!time) return 'Chọn giờ';
    return time.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Handle modal animation
  const openModal = (type: 'date' | 'time') => {
    if (type === 'date') setDatePickerVisibility(true);
    else setTimePickerVisibility(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = (type: 'date' | 'time') => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (type === 'date') setDatePickerVisibility(false);
      else setTimePickerVisibility(false);
    });
  };

  // Handle date picker confirmation
  const handleDateConfirm = () => {
    const newDate = new Date(pickerYear, pickerMonth - 1, pickerDay);
    if (newDate >= new Date()) {
      setSelectedDate(newDate);
    }
    closeModal('date');
  };

  // Handle time picker confirmation
  const handleTimeConfirm = () => {
    const newTime = new Date();
    newTime.setHours(pickerHour, pickerMinute, 0);
    setSelectedTime(newTime);
    closeModal('time');
  };

  // Validate date
  useEffect(() => {
    const daysInMonth = new Date(pickerYear, pickerMonth, 0).getDate();
    if (pickerDay > daysInMonth) {
      setPickerDay(daysInMonth);
    }
  }, [pickerMonth, pickerYear]);

  // Handle form submission
  const handleSubmit = () => {
    console.log({
      customerName: userData?.ho_ten,
      phone: userData?.so_dien_thoai || userData?.phone_email,
      date: selectedDate,
      time: selectedTime,
      serviceType,
      notes,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMenuPress('Trang chủ')}>
          <Image source={require('./image/drop.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <BookingHeader />
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {!isLoggedIn ? (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Vui lòng đăng nhập để đặt lịch.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => handleMenuPress('Tài khoản')}
            >
              <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              {/* Customer Information */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên khách hàng</Text>
                <TextInput
                  style={styles.input}
                  value={userData?.ho_ten || ''}
                  editable={false}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={userData?.so_dien_thoai || userData?.phone_email || ''}
                  editable={false}
                />
              </View>

              {/* Date and Time Selection */}
              <View style={styles.dateTimeContainer}>
                <View style={[styles.inputContainer, styles.dateTimeInput]}>
                  <Text style={styles.label}>Ngày đặt lịch</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => openModal('date')}
                  >
                    <Text style={styles.pickerText}>{formatDate(selectedDate)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputContainer, styles.dateTimeInput]}>
                  <Text style={styles.label}>Giờ đặt lịch</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => openModal('time')}
                  >
                    <Text style={styles.pickerText}>{formatTime(selectedTime)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Picker Modal */}
              <Modal
                visible={isDatePickerVisible}
                animationType="none"
                transparent
                onRequestClose={() => closeModal('date')}
              >
                <View style={styles.modalOverlay}>
                  <TouchableOpacity
                    style={styles.modalOverlayTouchable}
                    activeOpacity={1}
                    onPress={() => closeModal('date')}
                  />
                  <Animated.View
                    style={[
                      styles.modalContent,
                      { transform: [{ translateY: slideAnim }] },
                    ]}
                  >
                    <Text style={styles.modalTitle}>Chọn ngày</Text>
                    <View style={styles.pickerContainer}>
                      <View style={styles.pickerColumn}>
                        <PickerWheel
                          items={days}
                          selectedValue={pickerDay}
                          onValueChange={setPickerDay}
                        />
                        <Text style={styles.pickerLabel}>Ngày</Text>
                      </View>
                      <View style={styles.pickerColumn}>
                        <PickerWheel
                          items={months}
                          selectedValue={pickerMonth}
                          onValueChange={setPickerMonth}
                        />
                        <Text style={styles.pickerLabel}>Tháng</Text>
                      </View>
                      <View style={styles.pickerColumn}>
                        <PickerWheel
                          items={years}
                          selectedValue={pickerYear}
                          onValueChange={setPickerYear}
                        />
                        <Text style={styles.pickerLabel}>Năm</Text>
                      </View>
                    </View>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleDateConfirm}
                      >
                        <Text style={styles.modalButtonText}>Xác nhận</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </View>
              </Modal>

              {/* Time Picker Modal */}
              <Modal
                visible={isTimePickerVisible}
                animationType="none"
                transparent
                onRequestClose={() => closeModal('time')}
              >
                <View style={styles.modalOverlay}>
                  <TouchableOpacity
                    style={styles.modalOverlayTouchable}
                    activeOpacity={1}
                    onPress={() => closeModal('time')}
                  />
                  <Animated.View
                    style={[
                      styles.modalContent,
                      { transform: [{ translateY: slideAnim }] },
                    ]}
                  >
                    <Text style={styles.modalTitle}>Chọn giờ</Text>
                    <View style={styles.pickerContainer}>
                      <View style={styles.pickerColumn}>
                        <PickerWheel
                          items={hours}
                          selectedValue={pickerHour}
                          onValueChange={setPickerHour}
                        />
                        <Text style={styles.pickerLabel}>Giờ</Text>
                      </View>
                      <View style={styles.pickerColumn}>
                        <PickerWheel
                          items={minutes}
                          selectedValue={pickerMinute}
                          onValueChange={setPickerMinute}
                        />
                        <Text style={styles.pickerLabel}>Phút</Text>
                      </View>
                    </View>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleTimeConfirm}
                      >
                        <Text style={styles.modalButtonText}>Xác nhận</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </View>
              </Modal>

              {/* Service Type Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Loại dịch vụ</Text>
                <View style={styles.serviceTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.serviceTypeButton,
                      serviceType === 'Bảo dưỡng' && styles.serviceTypeButtonActive,
                    ]}
                    onPress={() => setServiceType('Bảo dưỡng')}
                  >
                    <Text
                      style={[
                        styles.serviceTypeText,
                        serviceType === 'Bảo dưỡng' && styles.serviceTypeTextActive,
                      ]}
                    >
                      Bảo dưỡng
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.serviceTypeButton,
                      serviceType === 'Sửa chữa/Nâng cấp' && styles.serviceTypeButtonActive,
                    ]}
                    onPress={() => setServiceType('Sửa chữa/Nâng cấp')}
                  >
                    <Text
                      style={[
                        styles.serviceTypeText,
                        serviceType === 'Sửa chữa/Nâng cấp' && styles.serviceTypeTextActive,
                      ]}
                    >
                      Sửa chữa/Nâng cấp
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Nhập ghi chú (nếu có)"
                  placeholderTextColor="#666"
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      selectedDate && selectedTime ? '#4abab9' : '#a9a9a9',
                  },
                ]}
                onPress={handleSubmit}
                disabled={!selectedDate || !selectedTime}
              >
                <Text style={styles.submitButtonText}>Xác nhận đặt lịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      <Menu
        activeMenu="Đặt lịch"
        handleMenuPress={handleMenuPress}
        isLoggedIn={isLoggedIn}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    zIndex: 1000,
    marginTop: -60,
  },
  backIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '180deg' }],
    marginLeft: 10,
    marginTop: 30,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 0,
    marginLeft: -140,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    fontFamily: 'Urwdin 400',
    marginLeft: 115,
    marginTop: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  loginPromptText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Urwdin 400',
  },
  loginButton: {
    backgroundColor: '#4abab9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Urwdin 400',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Urwdin 400',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f6f6',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Urwdin 400',
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeInput: {
    width: '48%',
  },
  pickerButton: {
    backgroundColor: '#f5f6f6',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Urwdin 400',
    textAlign: 'center',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  serviceTypeButtonActive: {
    backgroundColor: '#4abab9',
    borderColor: '#4abab9',
  },
  serviceTypeText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Urwdin 400',
  },
  serviceTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Urwdin 400',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Urwdin 400',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 160,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerWheel: {
    width: '200%',
  },
  pickerItem: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 5,
  },
  pickerItemSelected: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef5350',
    elevation: 3,
    shadowColor: '#ef5350',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  pickerItemText: {
    fontSize: 20,
    color: '#666',
    fontFamily: 'Urwdin 400',
  },
  pickerItemTextSelected: {
    color: '#ef5350',
    fontWeight: '600',
  },
  pickerLabel: {
    marginTop: 10,
    fontSize: 20,
    color: '#333',
    fontFamily: 'Urwdin 400',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4abab9',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Urwdin 400',
  },
});

export default DatLich;