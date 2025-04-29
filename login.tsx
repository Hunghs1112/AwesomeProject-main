import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import Menu from './menu';

type Mode = 'login' | 'register' | 'reset';

interface LoginProps {
  handleMenuPress: (menu: string) => void;
  onLoginSuccess: (user: any) => void;
}

const BASE_URL = 'http://localhost:3000';

function Login({ handleMenuPress, onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [secure, setSecure] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');

  // Cập nhật enabled button dựa vào mode
  useEffect(() => {
    if (mode === 'login') {
      setEnabled(phone.trim() !== '' && password.trim() !== '');
    } else if (mode === 'register') {
      setEnabled(
        hoTen.trim() !== '' &&
          phone.trim() !== '' &&
          regPassword.trim() !== '' &&
          regConfirmPassword.trim() !== ''
      );
    } else if (mode === 'reset') {
      setEnabled(
        phone.trim() !== '' &&
          newPassword.trim() !== '' &&
          newConfirmPassword.trim() !== ''
      );
    }
  }, [
    mode,
    phone,
    password,
    hoTen,
    regPassword,
    regConfirmPassword,
    newPassword,
    newConfirmPassword,
  ]);

  const toggleSecure = () => {
    setSecure(!secure);
  };

  // Xử lý đăng nhập
  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.user);
        Alert.alert('Thông báo', data.message);
      } else {
        Alert.alert('Lỗi', data.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      console.error('Lỗi đăng nhập:', error);
    }
  };

  // Xử lý đăng ký
  const handleRegister = async () => {
    if (regPassword !== regConfirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu và mật khẩu nhắc lại không trùng khớp');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ho_ten: hoTen, phone, password: regPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thông báo', data.message, [
          {
            text: 'OK',
            onPress: () => {
              setMode('login');
              setPassword('');
              setHoTen('');
              setRegPassword('');
              setRegConfirmPassword('');
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', data.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      console.error('Lỗi đăng ký:', error);
    }
  };

  // Xử lý đổi mật khẩu
  const handleReset = async () => {
    if (newPassword !== newConfirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận không trùng khớp');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });
      const contentType = response.headers.get('Content-Type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Phản hồi không đúng định dạng JSON: ${text}`);
      }
      if (response.ok) {
        Alert.alert('Thông báo', data.message, [
          {
            text: 'OK',
            onPress: () => {
              setMode('login');
              setPassword('');
              setNewPassword('');
              setNewConfirmPassword('');
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', data.error || 'Đã có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      console.error('Lỗi đổi mật khẩu:', error);
    }
  };

  // Render giao diện theo mode
  const renderContent = () => {
    if (mode === 'login') {
      return (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại/email</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder=""
                secureTextEntry={secure}
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{secure ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setMode('reset');
              setPassword('');
              setNewPassword('');
              setNewConfirmPassword('');
            }}
          >
            <Text style={styles.forgotText}>Quên mật khẩu</Text>
          </TouchableOpacity>
        </>
      );
    } else if (mode === 'register') {
      return (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#666"
              value={hoTen}
              onChangeText={setHoTen}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại/email</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder=""
                secureTextEntry={secure}
                placeholderTextColor="#666"
                value={regPassword}
                onChangeText={setRegPassword}
              />
              <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{secure ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nhắc lại mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder=""
                secureTextEntry={secure}
                placeholderTextColor="#666"
                value={regConfirmPassword}
                onChangeText={setRegConfirmPassword}
              />
              <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{secure ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    } else if (mode === 'reset') {
      return (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại/email</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder=""
                secureTextEntry={secure}
                placeholderTextColor="#666"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{secure ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder=""
                secureTextEntry={secure}
                placeholderTextColor="#666"
                value={newConfirmPassword}
                onChangeText={setNewConfirmPassword}
              />
              <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{secure ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    }
  };

  // Xử lý nút chính theo mode
  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else if (mode === 'register') {
      handleRegister();
    } else if (mode === 'reset') {
      handleReset();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Logo */}
        <Image source={require('./image/logo.png')} style={styles.logo} />
        {/* Tiêu đề theo mode */}
        <TouchableOpacity style={styles.centerLoginButton}>
          <Text style={styles.centerLoginText}>
            {mode === 'login'
              ? 'Đăng nhập'
              : mode === 'register'
              ? 'Đăng ký'
              : 'Đổi mật khẩu'}
          </Text>
        </TouchableOpacity>
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <View style={styles.dividerGap} />
          <View style={styles.divider} />
        </View>
        {/* Nội dung form theo mode */}
        {renderContent()}
        {/* Nút xử lý chính */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: enabled ? '#4abab9' : '#a9a9a9' },
          ]}
          onPress={handleSubmit}
          disabled={!enabled}
        >
          <Text style={styles.submitButtonText}>
            {mode === 'login'
              ? 'Đăng nhập'
              : mode === 'register'
              ? 'Đăng ký'
              : 'Xác nhận'}
          </Text>
        </TouchableOpacity>
        {/* Link chuyển đổi giữa các chế độ */}
        {mode === 'login' && (
          <Text style={styles.registerContainer}>
            Bạn chưa có tài khoản?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => {
                setMode('register');
                setPassword('');
              }}
            >
              Đăng ký ngay
            </Text>
          </Text>
        )}
        {mode === 'register' && (
          <Text style={styles.registerContainer}>
            Bạn đã có tài khoản?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => {
                setMode('login');
                setHoTen('');
                setRegPassword('');
                setRegConfirmPassword('');
              }}
            >
              Đăng nhập ngay
            </Text>
          </Text>
        )}
        {mode === 'reset' && (
          <Text style={styles.registerContainer}>
            <Text
              style={styles.registerLink}
              onPress={() => {
                setMode('login');
                setNewPassword('');
                setNewConfirmPassword('');
              }}
            >
              Quay lại đăng nhập
            </Text>
          </Text>
        )}
      </View>
      {/* Menu và icon chat từ file menu.tsx */}
      <Menu activeMenu="Tài khoản" handleMenuPress={handleMenuPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: -20,
    marginTop: -60,
  },
  centerLoginButton: { marginBottom: 20 },
  centerLoginText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Urwdin 400',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgb(151, 147, 147)',
    borderStyle: 'dashed',
  },
  dividerGap: { width: 50 },
  inputContainer: { width: '80%', marginBottom: 15 },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Urwdin 400',
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#f5f6f6',
    borderRadius: 5,
    padding: 10,
    fontFamily: 'Urwdin 400',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f6',
    borderRadius: 5,
    width: '100%',
  },
  inputPassword: { flex: 1, padding: 10, fontFamily: 'Urwdin 400' },
  eyeIcon: { padding: 10 },
  eyeText: { fontSize: 18 },
  forgotText: {
    color: 'red',
    fontSize: 18,
    fontStyle: 'italic',
    fontFamily: 'Urwdin 400',
    alignSelf: 'flex-end',
    marginBottom: 15,
    marginLeft: 180,
  },
  registerContainer: {
    marginTop: 15,
    fontSize: 18,
    fontFamily: 'Urwdin 400',
    color: '#333',
    textAlign: 'center',
  },
  registerLink: {
    color: '#4abab9',
    textDecorationLine: 'none',
    fontFamily: 'Urwdin 400',
  },
  submitButton: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'Urwdin 400',
  },
});

export default Login;