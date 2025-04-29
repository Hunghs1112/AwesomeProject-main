import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import Menu from './menu';

export interface UserData {
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

interface ServiceProps {
  userData: UserData | null;
  activeMenu: string;
  handleMenuPress: (menu: string) => void;
}

// Component riêng cho tiêu đề "Chi tiết dịch vụ"
const ServiceDetailHeader: React.FC = () => {
  return (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
    </View>
  );
};

// Hàm định dạng thời gian từ timestamp
const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return {
    createdDate: `${day}/${month}/${year}`,
    createdTime: `${hours}:${minutes}`,
  };
};

// Hàm chuẩn hóa chuỗi để tìm kiếm không dấu
const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

// Hàm cắt chuỗi với giới hạn 24 ký tự
const truncateText = (text: string, maxLength: number = 24) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

// Màu cho chữ status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đang xử lý':
      return 'orange';
    case 'Hoàn thành':
      return 'green';
    case 'Bàn giao':
      return '#1E90FF';
    case 'Bảo hành':
      return '#FF4500';
    default:
      return '#2c3e50';
  }
};

// Màu nền cho badge status
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Đang xử lý':
      return '#FF8C00';
    case 'Hoàn thành':
      return '#28a745';
    case 'Bàn giao':
      return '#17a2b8';
    case 'Bảo hành':
      return '#FF6347';
    default:
      return '#6c757d';
  }
};

const Service: React.FC<ServiceProps> = ({
  userData,
  activeMenu,
  handleMenuPress,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  // Lấy dữ liệu dịch vụ từ API khi component mount hoặc userData thay đổi
  useEffect(() => {
    if (userData && userData.id) {
      fetch(`http://localhost:3000/services?customerId=${userData.id}`)
        .then(response => response.json())
        .then(data => {
          const formattedServices = data.map((svc: any) => {
            const { createdDate, createdTime } = formatDateTime(svc.created_at);
            return {
              id: svc.id,
              image: svc.image_url,
              title: svc.title,
              description: svc.description,
              content: svc.content || '<p>Chưa có nội dung</p>',
              status: svc.status,
              createdDate,
              createdTime,
              createdDateTime: new Date(svc.created_at),
              warranty_type: svc.warranty_type,
              warranty_duration: svc.warranty_duration,
            };
          });
          setServices(formattedServices);
        })
        .catch(error => console.error('Lỗi khi lấy dịch vụ:', error));
    }
  }, [userData]);

  // Ánh xạ status với hình ảnh
  const statusImages: Record<string, number> = {
    'Đang xử lý': require('./image/dangxuly.png'),
    'Hoàn thành': require('./image/dht.png'),
    'Bàn giao': require('./image/chbg.png'),
    'Bảo hành': require('./image/bh.png'),
  };

  const statusOrder = ['Đang xử lý', 'Bàn giao', 'Hoàn thành', 'Bảo hành'];

  const handleStatusPress = (status: string) => {
    setSelectedStatus(prev => (prev === status ? null : status));
  };

  // Lọc dịch vụ theo status và từ khóa tìm kiếm
  const filteredServices = services.filter(svc => {
    const matchStatus = selectedStatus
      ? selectedStatus === 'Bảo hành'
        ? svc.warranty_type !== 'none'
        : svc.status === selectedStatus
      : true;
    const normalizedTitle = normalizeString(svc.title);
    const normalizedSearch = normalizeString(searchText);
    const matchSearch = normalizedTitle.includes(normalizedSearch);
    return matchStatus && matchSearch;
  });

  // Hàm kiểm tra trạng thái bảo hành
  const getWarrantyStatus = (warrantyType: string, warrantyDuration: string) => {
    if (warrantyType === 'permanent') {
      return 'Bảo hành trọn đời';
    } else if (warrantyType === 'limited' && warrantyDuration) {
      const today = new Date();
      const warrantyDate = new Date(warrantyDuration);
      if (isNaN(warrantyDate.getTime())) {
        return null;
      }
      const formattedDate = warrantyDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      if (warrantyDate < today) {
        return `Đã hết hạn: ${formattedDate}`;
      }
      return `Bảo hành đến: ${formattedDate}`;
    }
    return null;
  };

  // Xử lý khi click vào dịch vụ
  const handleServicePress = (service: any) => {
    setSelectedService(service);
  };

  // Giao diện chi tiết dịch vụ
  if (selectedService) {
    const warrantyStatus = getWarrantyStatus(selectedService.warranty_type, selectedService.warranty_duration);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedService(null)}>
            <Image source={require('./image/drop.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <ServiceDetailHeader />
        </View>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Image
            source={{ uri: selectedService.image }}
            style={styles.detailImage}
            resizeMode="cover"
          />
          <View style={styles.detailContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.detailTitle}>{selectedService.title}</Text>
              {selectedService.warranty_type !== 'none' && (
                <Image
                  source={require('./image/bh.png')}
                  style={styles.warrantyIconTitle}
                />
              )}
            </View>
            <Text style={styles.detailDescription}>{selectedService.description}</Text>
            {warrantyStatus && (
              <Text style={styles.detailWarranty}>
                Chế độ bảo hành: {warrantyStatus}
              </Text>
            )}
            <View style={styles.dateContainer}>
              <Image
                source={require('./image/clock.png')}
                style={styles.clockIcon}
              />
              <Text style={styles.detailDate}>
                Ngày tạo: {selectedService.createdDate} lúc {selectedService.createdTime}
              </Text>
            </View>
            <View style={[styles.statusBadge2Container, { justifyContent: 'center', alignItems: 'center' }]}>
              <View
                style={[
                  styles.statusBadge2,
                  { backgroundColor: getStatusBadgeColor(selectedService.status) },
                ]}
              >
                <Text style={[styles.statusBadge2Text, { fontWeight: 'bold' }]}>{selectedService.status}</Text>
              </View>
            </View>
            <Text style={styles.detailContentTitle}>Nội dung:</Text>
            <View style={styles.detailContentText}>
              <RenderHTML
                contentWidth={Dimensions.get('window').width - 40}
                source={{ html: selectedService.content }}
                baseStyle={{ color: '#333', fontSize: 16, fontFamily: 'Urwdin 400' }}
                tagsStyles={{
                  img: {
                    maxWidth: 200,
                    height: 'auto',
                    borderRadius: 8,
                    alignSelf: 'center',
                  },
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMenuPress('Trang chủ')}>
          <Image source={require('./image/drop.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ</Text>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Tra cứu dịch vụ</Text>
          <Text style={styles.searchSubtitle}>
            Tra cứu dịch vụ bạn đang sử dụng ngay bây giờ
          </Text>
          <View style={styles.searchInputContainer}>
            <Image
              source={require('./image/search.png')}
              style={styles.searchPrefixIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tra cứu"
              placeholderTextColor="#ccc"
              value={searchText}
              onChangeText={setSearchText}
              editable={userData !== null}
            />
          </View>
        </View>
        <View style={styles.statusContainer}>
          {statusOrder.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusBox,
                selectedStatus === status && styles.statusBoxActive,
                status === 'Hoàn thành' && { marginLeft: 10 },
                status === 'Bảo hành' && { marginLeft: 10 },
              ]}
              onPress={() => userData && handleStatusPress(status)}
              disabled={!userData}
            >
              <Image source={statusImages[status]} style={styles.statusImage} />
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.servicesTitle}>Thông tin các dịch vụ</Text>
        {userData ? (
          filteredServices.length > 0 ? (
            filteredServices.map((svc, idx) => {
              const warrantyStatus = getWarrantyStatus(svc.warranty_type, svc.warranty_duration);
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.serviceBox}
                  onPress={() => handleServicePress(svc)}
                >
                  {selectedStatus !== 'Bảo hành' && (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBadgeColor(svc.status) },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { fontWeight: 'bold' }]}>{svc.status}</Text>
                    </View>
                  )}
                  <Image source={{ uri: svc.image }} style={styles.serviceImage} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>{truncateText(svc.title)}</Text>
                    <Text style={styles.serviceDescription}>
                      {truncateText(svc.description)}
                    </Text>
                    {warrantyStatus && (
                      <Text style={styles.serviceWarranty}>
                        {warrantyStatus}
                      </Text>
                    )}
                    <Text style={styles.serviceDateTime}>
                      Ngày tạo: {svc.createdDate} lúc {svc.createdTime}
                    </Text>
                    {svc.warranty_type !== 'none' && (
                      <View
                        style={[
                          styles.warrantyIcon,
                          selectedStatus === 'Bảo hành'
                            ? styles.warrantyIconTop
                            : styles.warrantyIconBottom,
                        ]}
                      >
                        <Image
                          source={require('./image/bh.png')}
                          style={styles.warrantyIconImage}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noServicesText}>
              Không có dịch vụ nào phù hợp
            </Text>
          )
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => handleMenuPress('Tài khoản')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Menu activeMenu={activeMenu} handleMenuPress={handleMenuPress} />
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
  headerTitleContainer: {// Chi tiết dich vụ 
    flex: 1,
    alignItems: 'center',
    marginTop: 0,
    marginLeft: -140, // Thêm marginLeft để cách left 10
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
  searchSection: {
    backgroundColor: '#4abab9',
    padding: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'Urwdin 400',
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#e0f7fa',
    marginBottom: 20,
    fontFamily: 'Urwdin 400',
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    width: '90%',
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchPrefixIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
    fontFamily: 'Urwdin 400',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  statusBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    width: '22%',
    marginHorizontal: 5,
  },
  statusBoxActive: {
    backgroundColor: '#e6f3ff',
    borderWidth: 1,
    borderColor: '#4abab9',
  },
  statusImage: {
    width: 45,
    height: 45,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  statusText: {
    fontSize: 12.2,
    fontWeight: '600',
    fontFamily: 'Urwdin 400',
    textAlign: 'center',
  },
  servicesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4abab9',
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontFamily: 'Urwdin 400',
  },
  serviceBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: 'visible',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    elevation: 2,
    zIndex: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Urwdin 400',
  },
  statusBadge2Container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignSelf: 'center',
  },
  statusBadge2: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    elevation: 2,
    zIndex: 1,
  },
  statusBadge2Text: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Urwdin 400',
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 12,
  },
  serviceContent: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    position: 'relative',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
    marginTop: 8,
    fontFamily: 'Urwdin 400',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Urwdin 400',
    lineHeight: 20,
  },
  serviceWarranty: {
    fontSize: 14,
    color: '#FF4500',
    marginTop: 8,
    fontFamily: 'Urwdin 400',
  },
  serviceDateTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    fontFamily: 'Urwdin 400',
  },
  warrantyIcon: {
    position: 'absolute',
  },
  warrantyIconTop: {
    top: 12,
    right: 12,
  },
  warrantyIconBottom: {
    bottom: 12,
    right: 12,
  },
  warrantyIconImage: {
    width: 24,
    height: 24,
  },
  noServicesText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'Urwdin 400',
  },
  detailImage: {
    width: Dimensions.get('window').width,
    height: 200,
    margin: 0,
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    fontFamily: 'Urwdin 400',
    textAlign: 'center',
  },
  warrantyIconTitle: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Urwdin 400',
  },
  detailWarranty: {
    fontSize: 14,
    color: '#FF4500',
    marginBottom: 10,
    fontFamily: 'Urwdin 400',
  },
  detailDate: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'Urwdin 400',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clockIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  detailContentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'Urwdin 400',
  },
  detailContentText: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4abab9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
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
});

export default Service;