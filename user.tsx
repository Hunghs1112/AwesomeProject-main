import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  useColorScheme,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import Menu from './menu';

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://64.176.84.220:3100' : 'http://64.176.84.220:3100';

type ProfileData = {
  ho_ten?: string;
  gioi_tinh?: string;
  ngay_sinh?: string;
  so_dien_thoai?: string;
  email?: string;
  tinh?: string;
  quan?: string;
  phuong?: string;
  dia_chi?: string;
  phone_email?: string;
};

type UserProps = {
  userName: string;
  profileData?: ProfileData;
  handleMenuPress: (menu: string) => void;
  onLogout: () => void;
};

function User({ userName, profileData: initialProfileData, handleMenuPress, onLogout }: UserProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [bounce] = useState(new Animated.Value(0));
  const [currentScreen, setCurrentScreen] = useState<'main' | 'profile' | 'settings'>('main');
  // Giữ profile tại User để luôn cập nhật sau khi save
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData || {});

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bounce]);

  const confirmLogout = useCallback(() => {
    Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất không?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Có', onPress: onLogout },
    ]);
  }, [onLogout]);

  const handleProfilePress = useCallback(() => setCurrentScreen('profile'), []);
  const handleSettingsPress = useCallback(() => setCurrentScreen('settings'), []);
  const handleBack = useCallback(() => setCurrentScreen('main'), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {currentScreen === 'main' && (
        <>
          <View style={styles.headerBackground2}>
            <View style={styles.pointsContainer2}>
              <Image source={require('./image/user.png')} style={styles.userImage} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{profileData.ho_ten || userName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionRow} onPress={handleProfilePress}>
              <Image source={require('./image/hoso.png')} style={styles.optionIcon} />
              <Text style={styles.optionText}>Thông tin cá nhân</Text>
              <Image source={require('./image/drop.png')} style={styles.dropdownIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow} onPress={handleSettingsPress}>
              <Image source={require('./image/caidat.png')} style={styles.optionIcon} />
              <Text style={styles.optionText}>Cài đặt tài khoản</Text>
              <Image source={require('./image/drop.png')} style={styles.dropdownIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow}>
              <Image source={require('./image/chinhsach.png')} style={styles.optionIcon} />
              <Text style={styles.optionText}>Điều khoản & chính sách</Text>
              <Image source={require('./image/drop.png')} style={styles.dropdownIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow}>
              <Image source={require('./image/thongtin.png')} style={styles.optionIcon} />
              <Text style={styles.optionText}>Thông tin ứng dụng</Text>
              <Image source={require('./image/drop.png')} style={styles.dropdownIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow} onPress={confirmLogout}>
              <Image source={require('./image/dangxuat.png')} style={styles.optionIcon} />
              <Text style={styles.optionText}>Đăng xuất</Text>
              <Image source={require('./image/drop.png')} style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>
          <Menu activeMenu="Tài khoản" handleMenuPress={handleMenuPress} bounce={bounce} />
        </>
      )}

      {currentScreen === 'profile' && (
        <>
          <ProfileScreen
            initialProfile={profileData}
            onBack={handleBack}
            onSave={(updated) => setProfileData(updated)}
          />
          <Menu activeMenu="Tài khoản" handleMenuPress={handleMenuPress} bounce={bounce} />
        </>
      )}

      {currentScreen === 'settings' && (
        <>
          <AccountSettingsScreen
            onBack={handleBack}
            phoneEmail={profileData.phone_email || ''}
          />
          <Menu activeMenu="Tài khoản" handleMenuPress={handleMenuPress} bounce={bounce} />
        </>
      )}
    </View>
  );
}

const ProfileScreen = ({
  initialProfile,
  onBack,
  onSave,
}: {
  initialProfile?: ProfileData;
  onBack: () => void;
  onSave: (newProfile: ProfileData) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialProfile || {});

  const handleUpdatePress = () => setIsEditing(true);

  const handleSavePress = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thông báo', 'Cập nhật thông tin thành công');
        onSave(formData);        // Cập nhật lên User
        setIsEditing(false);
      } else {
        Alert.alert('Lỗi', data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      console.error('Lỗi cập nhật thông tin:', error);
    }
  };

  const renderViewRow = (label: string, value?: string) => (
    <View style={styles.viewRow}>
      <Text style={styles.viewLabel}>{label}:</Text>
      <Text style={styles.viewValue}>{value || ''}</Text>
    </View>
  );

  const renderEditField = (
    label: string,
    placeholder: string,
    value?: string,
    onChange?: (text: string) => void,
    required = false
  ) => (
    <View style={styles.editFieldContainer}>
      <Text style={styles.editLabel}>
        {label}
        {required && <Text style={styles.asterisk}>*</Text>}
      </Text>
      <TextInput
        style={styles.inputUnderline}
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
      />
    </View>
  );

  const renderGenderDateRow = () => (
    <View style={styles.genderDateRow}>
      <View style={styles.genderContainer}>
        <Text style={styles.editLabel}>
          Giới tính<Text style={styles.asterisk}>*</Text>
        </Text>
        <View style={styles.radioContainer}>
          {['Nam', 'Nữ'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.radioButton,
                formData.gioi_tinh === g && styles.radioSelected,
              ]}
              onPress={() => setFormData({ ...formData, gioi_tinh: g })}
            >
              <Text>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.editLabel}>
          Ngày sinh<Text style={styles.asterisk}>*</Text>
        </Text>
        <TextInput
          style={styles.inputUnderline}
          value={formData.ngay_sinh}
          placeholder="dd/mm/yyyy"
          onChangeText={(text) => setFormData({ ...formData, ngay_sinh: text })}
        />
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.profileContainer, { paddingBottom: 200 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backContainer}>
          <Image source={require('./image/drop.png')} style={styles.backImage} />
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>Thông tin cá nhân</Text>
      </View>

      {isEditing ? (
        <>
          <View style={styles.editContainer}>
            {renderEditField(
              'Họ tên',
              'Mời bạn nhập tên',
              formData.ho_ten,
              (t) => setFormData({ ...formData, ho_ten: t }),
              true
            )}
            {renderGenderDateRow()}
            {renderEditField(
              'Số điện thoại',
              'Nhập số điện thoại',
              formData.so_dien_thoai,
              (t) => setFormData({ ...formData, so_dien_thoai: t })
            )}
            {renderEditField(
              'Email',
              'Nhập email',
              formData.email,
              (t) => setFormData({ ...formData, email: t })
            )}
          </View>
          <View style={styles.addressContainer}>
            <View style={styles.staticFieldContainer}>
              <Text style={styles.staticLabel}>Quốc gia:</Text>
              <Text style={styles.staticValue}>Việt Nam</Text>
            </View>
            {renderEditField(
              'Tỉnh/Thành phố',
              'Chọn Tỉnh/Thành phố',
              formData.tinh,
              (t) => setFormData({ ...formData, tinh: t })
            )}
            {renderEditField(
              'Quận/Huyện',
              'Chọn Quận/Huyện',
              formData.quan,
              (t) => setFormData({ ...formData, quan: t })
            )}
            {renderEditField(
              'Phường/Xã',
              'Chọn Phường/Xã',
              formData.phuong,
              (t) => setFormData({ ...formData, phuong: t })
            )}
            {renderEditField(
              'Địa chỉ',
              'Nhập địa chỉ',
              formData.dia_chi,
              (t) => setFormData({ ...formData, dia_chi: t })
            )}
          </View>
          <TouchableOpacity
            style={[styles.updateButton, { marginTop: 10 }]}
            onPress={handleSavePress}
          >
            <Text style={styles.updateButtonText}>Lưu thông tin</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.viewContainer}>
            {renderViewRow('Họ tên', formData.ho_ten)}
            {renderViewRow('Giới tính', formData.gioi_tinh)}
            {renderViewRow('Ngày sinh', formData.ngay_sinh)}
            {renderViewRow('SĐT', formData.so_dien_thoai)}
            {renderViewRow('Email', formData.email)}
          </View>
          <View style={styles.viewContainer}>
            <View style={styles.viewRow}>
              <Text style={styles.viewLabel}>Quốc gia:</Text>
              <Text style={styles.viewValue}>Việt Nam</Text>
            </View>
            {renderViewRow('Tỉnh/Thành phố', formData.tinh)}
            {renderViewRow('Quận/Huyện', formData.quan)}
            {renderViewRow('Phường/Xã', formData.phuong)}
            {renderViewRow('Địa chỉ', formData.dia_chi)}
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
            <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const AccountSettingsScreen = ({
  onBack,
  phoneEmail,
}: {
  onBack: () => void;
  phoneEmail: string;
}) => {
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [secureOld, setSecureOld] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(
      oldPassword.trim() !== '' &&
        newPassword.trim() !== '' &&
        confirmNewPassword.trim() !== ''
    );
  }, [oldPassword, newPassword, confirmNewPassword]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận không trùng khớp');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneEmail, oldPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thông báo', 'Đổi mật khẩu thành công', [
          { text: 'OK', onPress: () => setChangePasswordMode(false) },
        ]);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Alert.alert('Lỗi', data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      console.error('Lỗi đổi mật khẩu:', error);
    }
  }, [confirmNewPassword, newPassword, oldPassword, phoneEmail]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.profileContainer, { paddingBottom: 200 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backContainer}>
          <Image source={require('./image/drop.png')} style={styles.backImage} />
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>Cài đặt tài khoản</Text>
      </View>
      {!changePasswordMode ? (
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingRowNoBorder}
            onPress={() => setChangePasswordMode(true)}
          >
            <Image source={require('./image/dmk.png')} style={styles.settingIcon} />
            <Text style={styles.settingText}>Đổi mật khẩu</Text>
            <Image source={require('./image/drop.png')} style={styles.settingDropdownIcon} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.changePasswordContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại/email</Text>
            <TextInput style={styles.input} value={phoneEmail} editable={false} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                secureTextEntry={secureOld}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureOld(!secureOld)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{secureOld ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                secureTextEntry={secureNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureNew(!secureNew)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{secureNew ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                secureTextEntry={secureConfirm}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureConfirm(!secureConfirm)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{secureConfirm ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: enabled ? '#4abab9' : '#a9a9a9' },
            ]}
            onPress={handleChangePassword}
            disabled={!enabled}
          >
            <Text style={styles.submitButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  /* … giữ nguyên toàn bộ styles cũ … */
  container: { flex: 1, backgroundColor: '#fff' },
  headerBackground2: {
    backgroundColor: '#4abab9',
    height: '23%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#3a8c8c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    marginTop: 25,
    height: 80,
  },
  userImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  userInfo: {},
  userName: { color: '#4abab9', fontWeight: 'bold', fontSize: 18 },
  optionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionIcon: { width: 30, height: 30, marginRight: 10 },
  optionText: { flex: 1, fontSize: 16 },
  dropdownIcon: { width: 20, height: 20 },
  profileContainer: { padding: 20, backgroundColor: '#fff' },
  profileHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    height: 80,
    marginLeft: -50,
  },
  backContainer: { marginLeft: 40, padding: 10 },
  backImage: { width: 20, height: 20, transform: [{ scaleX: -1 }] },
  profileHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  viewContainer: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
    marginVertical: 5,
  },
  viewLabel: { fontSize: 16 },
  viewValue: { fontSize: 16, fontWeight: 'bold' },
  editContainer: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  addressContainer: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  editFieldContainer: { marginVertical: 10 },
  editLabel: { fontSize: 16, marginBottom: 5 },
  asterisk: { color: 'red' },
  inputUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    fontSize: 16,
  },
  genderDateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  genderContainer: { width: '48%' },
  dateContainer: { width: '48%' },
  radioContainer: { flexDirection: 'row', marginTop: 5 },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  radioSelected: { borderColor: '#4abab9', backgroundColor: '#e0f7f7' },
  staticFieldContainer: { marginVertical: 10 },
  staticLabel: { fontSize: 16, marginBottom: 5 },
  staticValue: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  updateButton: { backgroundColor: '#4abab9', padding: 15, alignItems: 'center', borderRadius: 5 },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 16, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginTop: 5, backgroundColor: '#fff' },
  settingsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  settingRowNoBorder: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  settingIcon: { width: 30, height: 30, marginRight: 10 },
  settingText: { flex: 1, fontSize: 16 },
  settingDropdownIcon: { width: 20, height: 20 },
  changePasswordContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputContainer: { width: '100%', marginBottom: 15 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  inputPassword: { flex: 1, padding: 10 },
  eyeIcon: { padding: 10 },
  eyeText: { fontSize: 18 },
  submitButton: { width: '100%', paddingVertical: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default User;
