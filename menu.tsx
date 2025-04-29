import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
  ScrollView,
} from 'react-native';

interface MenuProps {
  activeMenu: string;
  handleMenuPress: (menu: string) => void;
  isLoggedIn: boolean;
}

const Menu: React.FC<MenuProps> = ({ activeMenu, handleMenuPress, isLoggedIn }) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bounce]);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    if (!isChatVisible && messages.length === 0 && isLoggedIn) {
      setMessages([
        {
          sender: 'ai',
          text: 'Xin chào, tôi là tư vấn viên, rất vui khi được trò chuyện với bạn.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
    setShowScrollDown(!isAtBottom);
  };

  const handleFilePress = () => {
    setShowFileMenu(!showFileMenu);
  };

  const handleSendFile = (type: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: `Đã gửi ${type}`, timestamp: new Date() },
    ]);
    setShowFileMenu(false);
    scrollToBottom();
  };

  const handleCall = () => {
    console.log('Đang gọi tư vấn viên...');
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const time = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return isToday ? time : `${date.toLocaleDateString('vi-VN')} ${time}`;
  };

  const shouldShowDate = (cur: any, prev: any) => {
    if (!prev) return true;
    const d1 = new Date(cur.timestamp).toLocaleDateString('vi-VN');
    const d2 = new Date(prev.timestamp).toLocaleDateString('vi-VN');
    return d1 !== d2;
  };

  const getIconStyle = (menu: string) => ({
    ...styles.iconImage,
    tintColor: activeMenu === menu ? '#4abab9' : 'black',
  });

  const getTextStyle = (menu: string) => ({
    ...styles.menuText,
    color: activeMenu === menu ? '#4abab9' : 'black',
  });

  return (
    <>
      <View style={styles.bottomMenuContainer}>
        <View style={styles.bottomMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('Trang chủ')}
          >
            <Image
              source={require('./image/trangchu1.png')}
              style={getIconStyle('Trang chủ')}
            />
            <Text style={getTextStyle('Trang chủ')}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('Quà tặng')}
          >
            <Image
              source={require('./image/quatang1.png')}
              style={getIconStyle('Quà tặng')}
            />
            <Text style={getTextStyle('Quà tặng')}>Quà tặng</Text>
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleMenuPress('Dịch vụ')}
            >
              <Image
                source={require('./image/tim.png')}
                style={styles.searchButtonImage}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('Đặt lịch')}
          >
            <Image
              source={require('./image/datlich.png')}
              style={getIconStyle('Đặt lịch')}
            />
            <Text style={getTextStyle('Đặt lịch')}>Đặt lịch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('Tài khoản')}
          >
            <Image
              source={require('./image/taikhoan1.png')}
              style={getIconStyle('Tài khoản')}
            />
            <Text style={getTextStyle('Tài khoản')}>Tài khoản</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          styles.chatIcon,
          {
            transform: [
              {
                translateY: bounce.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={toggleChat} style={styles.chatButton}>
          <Image
            source={require('./image/chat.png')}
            style={styles.chatIconImage}
          />
          <Text style={styles.chatText}>Chat với TTV</Text>
          <View style={styles.onlineIcon} />
        </TouchableOpacity>
      </Animated.View>

      {isChatVisible && (
        <View style={styles.chatBox}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderTitleContainer}>
              <Image
                source={require('./image/user.png')}
                style={styles.chatHeaderIcon}
              />
              <Text style={styles.chatHeaderTitle}>Tư vấn viên</Text>
              <View style={styles.onlineIcon} />
            </View>
            <View style={styles.chatHeaderButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleCall}>
                <Text style={styles.headerButtonIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsChatVisible(false)}
              >
                <Text style={styles.headerButtonIcon}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoggedIn ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                style={styles.chatMessages}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {messages.map((msg, idx) => (
                  <View key={idx}>
                    {shouldShowDate(msg, messages[idx - 1]) && (
                      <Text style={styles.dateDivider}>
                        {new Date(msg.timestamp).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.message,
                        {
                          alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          {
                            backgroundColor:
                              msg.sender === 'user' ? '#ffffff' : '#c8e6c9',
                            borderBottomRightRadius: msg.sender === 'user' ? 8 : 20,
                            borderBottomLeftRadius: msg.sender === 'ai' ? 8 : 20,
                          },
                        ]}
                      >
                        <Text style={styles.messageText}>{msg.text}</Text>
                        <Text style={styles.timestamp}>
                          {formatTimestamp(msg.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {showScrollDown && (
                <TouchableOpacity
                  style={styles.scrollDownBtn}
                  onPress={scrollToBottom}
                >
                  <Text style={styles.scrollDownIcon}>↓</Text>
                </TouchableOpacity>
              )}

              <View style={styles.chatInput}>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={handleFilePress}
                >
                  <Text style={styles.fileButtonIcon}>📎</Text>
                </TouchableOpacity>
                {showFileMenu && (
                  <View style={styles.fileMenu}>
                    <TouchableOpacity
                      style={styles.fileOption}
                      onPress={() => handleSendFile('Ảnh')}
                    >
                      <Text style={styles.fileOptionText}>📷 Gửi Ảnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.fileOption}
                      onPress={() => handleSendFile('Video')}
                    >
                      <Text style={styles.fileOptionText}>🎥 Gửi Video</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Nhập câu hỏi..."
                  multiline={false}
                  maxLength={200}
                  onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <Image
                    source={require('./image/send.png')}
                    style={styles.sendButtonImage}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                Vui lòng đăng nhập để sử dụng chức năng chat.
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  setIsChatVisible(false);
                  handleMenuPress('Tài khoản');
                }}
              >
                <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bottomMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  menuItem: {
    alignItems: 'center',
    padding: 10,
    bottom: 10,
  },
  menuText: {
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Urwdin 400',
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    position: 'relative',
    marginTop: -50,
    justifyContent: 'center',
  },
  searchButton: {
    backgroundColor: '#4abab9',
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#ffffff',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchButtonImage: {
    width: 42,
    height: 42,
  },
  chatIcon: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  chatIconImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  chatText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
    marginRight: 8,
  },
  onlineIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00e676',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatBox: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 360,
    maxHeight: 600,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgb(255, 163, 14)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc80',
    elevation: 5,
  },
  chatHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  chatHeaderIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: '#4abab9',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3e2723',
  },
  chatHeaderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  headerButtonIcon: {
    fontSize: 20,
    color: '#3e2723',
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    padding: 15,
    backgroundColor: '#3e5b3f',
    maxHeight: 510,
  },
  message: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#212121',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'right',
    marginTop: 4,
  },
  dateDivider: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollDownBtn: {
    position: 'absolute',
    top: 500,
    left: '50%',
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -16 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  scrollDownIcon: {
    fontSize: 18,
    color: '#4abab9',
  },
  chatInput: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    gap: 10,
  },
  fileButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4abab9',
    borderRadius: 18,
    elevation: 5,
  },
  fileButtonIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
  fileMenu: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    padding: 5,
  },
  fileOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileOptionText: {
    fontSize: 14,
    color: '#212121',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonImage: {
    width: 24,
    height: 24,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3e5b3f',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4abab9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default Menu;