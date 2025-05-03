import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Menu from './menu';
import Login from './login';
import User from './user';
import Service from './service';
import ThongBao from './thongbao';
import UuDai from './uudai';
import DatLich from './datlich'; // Import the new DatLich component

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

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeMenu, setActiveMenu] = useState('Trang chủ');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleMenuPress = (menu: string) => {
    setActiveMenu(menu);
  };

  if (activeMenu === 'Tài khoản') {
    if (userData) {
      return (
        <User
          userName={userData.ho_ten || ''}
          profileData={userData}
          handleMenuPress={handleMenuPress}
          onLogout={() => {
            setUserData(null);
            setActiveMenu('Tài khoản');
          }}
        />
      );
    } else {
      return (
        <Login
          handleMenuPress={handleMenuPress}
          onLoginSuccess={(user: UserData) => {
            setUserData(user);
            setActiveMenu('Trang chủ');
          }}
        />
      );
    }
  }

  if (activeMenu === 'Dịch vụ') {
    return (
      <Service
        userData={userData}
        activeMenu={activeMenu}
        handleMenuPress={handleMenuPress}
      />
    );
  }

  if (activeMenu === 'Thông báo') {
    return (
      <ThongBao
        activeMenu={activeMenu}
        handleMenuPress={handleMenuPress}
      />
    );
  }

  if (activeMenu === 'Ưu đãi') {
    return (
      <UuDai
        activeMenu={activeMenu}
        handleMenuPress={handleMenuPress}
      />
    );
  }

  if (activeMenu === 'Đặt lịch') {
    return (
      <DatLich
        userData={userData}
        handleMenuPress={handleMenuPress}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBackground}>
          <Text style={styles.greetingText}>
            Xin chào{' '}
            <Text style={styles.nameText}>
              {userData && userData.ho_ten ? userData.ho_ten : 'Quý khách'}
            </Text>
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>
              Điểm thưởng: <Text style={styles.pointsBold}>100 điểm</Text>
            </Text>
            <View style={styles.iconsRow}>
              <TouchableOpacity
                style={styles.iconItem}
                onPress={() => handleMenuPress('Ưu đãi')}
              >
                <Image source={require('./image/uudai.png')} style={styles.iconImage} />
                <Text style={styles.iconText}>Ưu đãi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconItem}
                onPress={() => handleMenuPress('Thông báo')}
              >
                <Image source={require('./image/thongbao.png')} style={styles.iconImage} />
                <Text style={styles.iconText}>Thông báo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.productsTitle}>Sản Phẩm</Text>
        <View style={styles.productsContainer}>
          {[
            {
              uri: 'https://mamxeaz.com/wp-content/uploads/2020/12/lazang-oto-13-inch-mau-az-01.jpg',
              name: 'Sản phẩm 1',
            },
            {
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOypgnt8d4jPsPJ7HhxwFl0YdYQF3ds4Jayg&s',
              name: 'Sản phẩm 2',
            },
            {
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlyUR_SaHZOudy0-dtJUFLo8xRrCF-wf75-A&s',
              name: 'Sản phẩm 3',
            },
            {
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0WGdsD5cHl3optdzGgjqLJjY05_yclWa5VA&s',
              name: 'Sản phẩm 4',
            },
            {
              uri: 'https://vinawash.vn/wp-content/uploads/2024/04/thay-guong-chieu-hau-o-to-1-1024x683.jpg.webp',
              name: 'Sản phẩm 5',
            },
            {
              uri: 'https://otohathanh.com/upload/images/phu-kien-o-to/boc-vo-lang-o-to-ha-noi-7-1.jpg',
              name: 'Sản phẩm 6',
            },
          ].map((product, index) => (
            <TouchableOpacity key={index} style={styles.productBox}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: product.uri }} style={styles.productImage} />
                <View style={styles.imageBorder} />
              </View>
              <Text style={styles.productName}>{product.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Menu
        activeMenu={activeMenu}
        handleMenuPress={handleMenuPress}
        isLoggedIn={!!userData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  headerBackground: {
    backgroundColor: '#4abab9',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#3a8c8c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  greetingText: {
    position: 'absolute',
    top: 60,
    left: 20,
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Urwdin 400',
  },
  nameText: {
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Urwdin 400',
  },
  pointsContainer: {
    backgroundColor: 'white',
    width: '90%',
    height: 120,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 130,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pointsText: {
    fontSize: 20,
    fontFamily: 'Urwdin 400',
    color: '#333',
    marginBottom: 15,
  },
  pointsBold: {
    fontWeight: 'bold',
    fontFamily: 'Urwdin 400',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  iconItem: {
    alignItems: 'center',
    padding: 5,
  },
  iconText: {
    fontSize: 14,
    marginTop: 8,
    color: 'black',
    fontFamily: 'Urwdin 400',
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  productsTitle: {
    fontSize: 26,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    color: '#333',
    fontFamily: 'Urwdin 400',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
    marginRight: 5,
    marginLeft: 5,
  },
  productBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imageBorder: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontFamily: 'Urwdin 400',
  },
});

export default App;