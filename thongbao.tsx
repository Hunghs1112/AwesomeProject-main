import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  useColorScheme,
} from 'react-native';
import Menu from './menu';

export interface ThongBaoProps {
  activeMenu: string;
  handleMenuPress: (menu: string) => void;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  datetime: string; // ISO 8601: YYYY-MM-DDTHH:mm:ss
}

const ThongBao: React.FC<ThongBaoProps> = ({ activeMenu, handleMenuPress }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const notifications: Notification[] = [
    {
      id: 1,
      title: 'Đang chờ bàn giao',
      content: 'Xe của quý khách đã sửa xong, chúng tôi có thể bàn giao.',
      datetime: '2025-04-18T10:15:00',
    },

    {
      id: 2,
      title: 'Khuyến mãi đặc biệt',
      content: 'Giảm 20% cho tất cả các sản phẩm trong tuần này!',
      datetime: '2025-04-18T10:15:00',
    },
    {
      id: 3,
      title: 'Cập nhật hệ thống',
      content: 'Hệ thống sẽ bảo trì từ 2:00 đến 4:00 ngày 20/04/2025.',
      datetime: '2025-04-17T09:00:00',
    },
    {
      id: 4,
      title: 'Sản phẩm mới',
      content: 'Khám phá dòng sản phẩm mới vừa ra mắt!',
      datetime: '2025-04-16T18:45:00',
    },
    // Thêm thông báo khác tại đây...
  ];

  // Xử lý format và sort
  const sortedNotifications = notifications
    .map(n => {
      const dt = new Date(n.datetime);
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const yyyy = dt.getFullYear();
      const hh = String(dt.getHours()).padStart(2, '0');
      const mi = String(dt.getMinutes()).padStart(2, '0');
      return {
        ...n,
        timestamp: dt.getTime(),
        formatted: `${dd}/${mm}/${yyyy} lúc ${hh}:${mi}`,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMenuPress('Trang chủ')}>
          <Image source={require('./image/drop.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.notificationsTitle}>Tất cả thông báo</Text>

        {sortedNotifications.length > 0 ? (
          sortedNotifications.map(n => (
            <View key={n.id} style={styles.notificationCard}>
              {/* Ảnh bên trái */}
              <Image
                source={require('./image/tatcathongbao.png')}
                style={styles.notificationIcon}
              />
              {/* Nội dung */}
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{n.title}</Text>
                <Text style={styles.notificationDescription}>{n.content}</Text>
                <Text style={styles.notificationDate}>{n.formatted}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noNotificationsText}>
            Không có thông báo nào
          </Text>
        )}
      </ScrollView>

      {/* Menu bottom */}
      <Menu activeMenu={activeMenu} handleMenuPress={handleMenuPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '180deg' }],
    marginTop: 30,
    marginLeft: -10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 105,
    marginTop: 30,
    fontFamily: 'Urwdin 400',
  },
  scrollContainer: { flex: 1 },
  notificationsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4abab9',
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontFamily: 'Urwdin 400',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: 'visible',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    marginLeft: 12,
    marginVertical: 12,
  },
  notificationContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
    marginTop: 8,
    fontFamily: 'Urwdin 400',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
    fontFamily: 'Urwdin 400',
  },
  notificationDate: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'Urwdin 400',
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'Urwdin 400',
  },
});

export default ThongBao;
