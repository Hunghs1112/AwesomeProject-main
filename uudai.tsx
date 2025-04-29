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

export interface UuDaiProps {
  activeMenu: string;
  handleMenuPress: (menu: string) => void;
}

interface Promotion {
  id: number;
  title: string;
  datetime: string;    // ISO 8601
  imageUri: string;    // URL ảnh
}

const UuDai: React.FC<UuDaiProps> = ({ activeMenu, handleMenuPress }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const promotions: Promotion[] = [
    {
      id: 1,
      title: 'Giảm 10% cho đơn đầu tiên',
      datetime: '2025-04-18T10:00:00',
      imageUri:
        'https://scontent.fhan20-1.fna.fbcdn.net/v/t39.30808-6/485657018_3984003828552059_3831725034961247967_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=nmO3W260alUQ7kNvwHDeDRe&_nc_oc=AdksrUNd-4nc-ZGyllNE7DWZdTyEEoscxft34yoyfPOBcgoh3V25pknhd2IOSibr68e2VOqA_Snly0tb2h4fy2jG&_nc_zt=23&_nc_ht=scontent.fhan20-1.fna&_nc_gid=BJOXOnA3pdyjM_fecQwupQ&oh=00_AfHgwHz5Fq-_GZ_KT7bey6VroHjAhsiXrFH6P7IJk9ngBw&oe=680A4766',
    },
    {
      id: 2,
      title: 'Mua 1 tặng 1',
      datetime: '2025-04-18T09:00:00',
      imageUri:
        'https://hondaotovinhphuc-vinhyen.vn/wp-content/uploads/2023/08/fanpage_900x900.jpg',
    },
    {
      id: 3,
      title: 'Miễn phí ship',
      datetime: '2025-04-17T14:30:00',
      imageUri:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw9e1VlAw8fQpRvsqc1wbGvJtdd2pU4IqlfZ4IwNyL8VQzXx3D_NUVeJjgegkLHY39wCc&usqp=CAU',
    },
    {
      id: 4,
      title: 'Quà tặng bất ngờ',
      datetime: '2025-04-16T18:45:00',
      imageUri:
        'https://hondaotobienhoa.com.vn/vnt_upload/news/09_2023/Honda___KV___Promotion_T9_Resize_950x450px.jpg',
    },
    {
      id: 4,
      title: 'Quà tặng bất ngờ',
      datetime: '2025-04-16T18:45:00',
      imageUri:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PdmBt6tdxSpJVOzruJVmL4Csi-cn3SeuLSp5d_eaQgqvw6HTPnLHmk_vMigTtKyYTbY&usqp=CAU',
    },
    {
      id: 4,
      title: 'Quà tặng bất ngờ',
      datetime: '2025-04-16T18:45:00',
      imageUri:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdXYTeZNrxnSq5jDT1Na-R7CAXlmTvUW82Cw&s',
    },
    {
      id: 4,
      title: 'Quà tặng bất ngờ',
      datetime: '2025-04-16T18:45:00',
      imageUri:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ_RY_awVpfeS4KWng0HCUGIEtepYvpwvztQ&s',
    },
    
  ];

  // Format ngày-tháng-năm và sort giảm dần
  const sorted = promotions
    .map(p => {
      const dt = new Date(p.datetime);
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const yyyy = dt.getFullYear();
      return {
        ...p,
        timestamp: dt.getTime(),
        dateOnly: `${dd}/${mm}/${yyyy}`,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#f5f7fa' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#111' : '#fff' }]}>
        <TouchableOpacity onPress={() => handleMenuPress('Trang chủ')}>
          <Image
            source={require('./image/drop.png')}
            style={[styles.backIcon, { tintColor: isDarkMode ? '#fff' : '#2c3e50' }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#2c3e50' }]}>
          Chương trình ưu đãi
        </Text>
      </View>

      {/* Danh sách ưu đãi */}
      <ScrollView contentContainerStyle={styles.cardsWrapper}>
        <View style={styles.cardsContainer}>
          {sorted.map((p, idx) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? '#222' : '#fff',
                  marginRight: idx % 2 === 0 ? 10 : 0,
                },
              ]}
            >
              <Image
                source={{ uri: p.imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#000' }]}>
                  {p.title}
                </Text>
                <View style={styles.dateRow}>
                  <Image
                    source={require('./image/lich.png')}
                    style={styles.dateIcon}
                  />
                  <Text style={[styles.cardDate, { color: '#000' }]}>
                    {p.dateOnly}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Menu bottom */}
      <Menu activeMenu={activeMenu} handleMenuPress={handleMenuPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '180deg' }],
    marginTop: 25,
    marginLeft: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Urwdin 400',
    marginRight: 20,
    marginTop: 25,
  },

  cardsWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardContent: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 6,
    fontFamily: 'Urwdin 400',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  cardDate: {
    fontSize: 12,
    textAlign: 'left',
    fontFamily: 'Urwdin 400',
  },
});

export default UuDai;
