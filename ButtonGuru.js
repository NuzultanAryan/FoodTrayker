import { BarChart2, Home, MessageSquare, Plus, QrCode, User, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HexagonButton = ({ onPress, isOpen }) => (
  <TouchableOpacity onPress={onPress} style={styles.hexWrap}>
    <View style={styles.hexagon}>
      <View style={styles.hexagonInner} />
      <View style={styles.hexagonBefore} />
      <View style={styles.hexagonAfter} />
      <View style={styles.hexIconWrap}>
        {isOpen ? <X color="white" size={24} /> : <Plus color="white" size={24} />}
      </View>
    </View>
  </TouchableOpacity>
);

const CustomTabBarGuru = ({ activePage, onTabPress }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getColor = (page) => activePage === page ? '#8B0000' : '#A0A0A0';

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <View style={styles.container}>
      {menuOpen && (
        <Animated.View style={[styles.subMenu, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <TouchableOpacity style={styles.subMenuItem} onPress={() => { toggleMenu(); onTabPress('qr'); }}>
            <QrCode color="#FFFFFF" size={22} />
            <Text style={styles.subMenuLabel}>Tampilkan QR</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('home')}>
          <Home color={getColor('home')} size={24} />
          {activePage === 'home' && <View style={styles.dot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('rekap')}>
          <BarChart2 color={getColor('rekap')} size={24} />
          {activePage === 'rekap' && <View style={styles.dot} />}
        </TouchableOpacity>
        <HexagonButton onPress={toggleMenu} isOpen={menuOpen} />
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('messages')}>
          <MessageSquare color={getColor('messages')} size={24} />
          {activePage === 'messages' && <View style={styles.dot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('profile')}>
          <User color={getColor('profile')} size={24} />
          {activePage === 'profile' && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};
//hexguru
const HEX_SIZE = 54;
const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 24, width: '100%', paddingHorizontal: 16, alignItems: 'center' },
  subMenu: {
    flexDirection: 'row', backgroundColor: '#8B0000',
    borderRadius: 40, paddingVertical: 12, paddingHorizontal: 32,
    marginBottom: 12, gap: 28, alignItems: 'center', justifyContent: 'center',
  },
  subMenuItem: { alignItems: 'center', gap: 4 },
  subMenuLabel: { color: '#FFFFFF', fontSize: 12, marginTop: 4, fontWeight: '500' },
  tabBar: {
    flexDirection: 'row', backgroundColor: 'white',
    height: 68, borderRadius: 34, alignItems: 'center',
    justifyContent: 'space-around', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 10, paddingHorizontal: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 8 },
  dot: { marginTop: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: '#8B0000' },
  hexWrap: { alignItems: 'center', justifyContent: 'center', width: HEX_SIZE + 16, height: HEX_SIZE + 16, marginTop: -20 },
  hexagon: { width: HEX_SIZE, height: HEX_SIZE * 0.577, backgroundColor: '#8B0000', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  hexagonInner: { width: HEX_SIZE, height: HEX_SIZE * 0.577, backgroundColor: '#8B0000', position: 'absolute' },
  hexagonBefore: { position: 'absolute', top: -(HEX_SIZE * 0.577) / 2, width: 0, height: 0, borderLeftWidth: HEX_SIZE / 2, borderRightWidth: HEX_SIZE / 2, borderBottomWidth: (HEX_SIZE * 0.577) / 2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#8B0000' },
  hexagonAfter: { position: 'absolute', bottom: -(HEX_SIZE * 0.577) / 2, width: 0, height: 0, borderLeftWidth: HEX_SIZE / 2, borderRightWidth: HEX_SIZE / 2, borderTopWidth: (HEX_SIZE * 0.577) / 2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#8B0000' },
  hexIconWrap: { position: 'absolute', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
});

export default CustomTabBarGuru;