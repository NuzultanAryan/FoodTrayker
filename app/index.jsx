import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AdminDaftarSiswaScreen from '../AdminDaftarSiswaScreen';
import CustomTabBar from '../button';
import CustomTabBarAdmin from '../ButtonAdmin';
import CustomTabBarGuru from '../ButtonGuru';
import { auth, db } from '../firebase';
import GuruHomeScreen from '../GuruHomeScreen';
import HomeScreen from '../HomeScreen';
import LoginAdminScreen from '../LoginAdminScreen';
import LoginGuruScreen from '../LoginGuruScreen';
import LoginScreen from '../LoginScreen';
import Logo from '../Logo';
import PesanScreen from '../PesanScreen';
import ProfileScreen from '../ProfileScreen';
import QRTampilScreen from '../QRTampilScreen';
import RegisterAdminScreen from '../RegisterAdminScreen';
import RegisterGuruScreen from '../RegisterGuruScreen';
import RegisterScreen from '../RegisterScreen';
import RekapScreen from '../RekapScreen';
import RoleScreen from '../RoleScreen';
import ScanScreen from '../ScanScreen';

const CalendarScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.pageTitle}>Kalender</Text>
    <Text style={styles.pageSubtitle}>Segera hadir!</Text>
  </View>
);
const MessagesScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.pageTitle}>Pesan</Text>
    <Text style={styles.pageSubtitle}>Belum ada pesan masuk.</Text>
  </View>
);
const AdminHomeScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.pageTitle}>👋 Halo, Admin!</Text>
    <Text style={styles.pageSubtitle}>Gunakan menu + untuk lihat daftar siswa</Text>
  </View>
);

export default function Index() {
  const [activePage, setActivePage] = useState('home');
  const [activePageGuru, setActivePageGuru] = useState('home');
  const [activePageAdmin, setActivePageAdmin] = useState('home');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [authPage, setAuthPage] = useState('login');
  const [showAdminRegister, setShowAdminRegister] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const guruSnap = await getDoc(doc(db, 'guru', currentUser.uid));
        if (guruSnap.exists()) {
          setRole('guru');
        } else {
          const adminSnap = await getDoc(doc(db, 'admin', currentUser.uid));
          if (adminSnap.exists()) {
            setRole('admin');
          } else {
            setRole('siswa');
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <View style={styles.loadingScreen}>
      <Logo size={110} />
      <Text style={styles.loadingText}>FoodTrayker</Text>
      <Text style={styles.loadingSubtext}>Sistem Pengambilan MBG</Text>
      <ActivityIndicator color="#8B0000" style={{ marginTop: 24 }} />
    </View>
  );

  // Belum login
  if (!user) {
    // Register admin (tap logo 5x)
    if (showAdminRegister) {
      return <RegisterAdminScreen onBack={() => setShowAdminRegister(false)} />;
    }

    // Login admin (tap logo 3x)
    if (showAdminLogin) {
      return <LoginAdminScreen
        onLogin={() => setUser(auth.currentUser)}
        onBack={() => setShowAdminLogin(false)}
      />;
    }

    if (!selectedRole) {
      return (
        <RoleScreen
          onSelectRole={(r) => { setSelectedRole(r); setAuthPage('login'); }}
          onAdminRegister={() => setShowAdminRegister(true)}
          onAdminLogin={() => setShowAdminLogin(true)}
        />
      );
    }

    if (selectedRole === 'guru') {
      if (authPage === 'register') return <RegisterGuruScreen onRegister={() => setAuthPage('login')} onGoLogin={() => setAuthPage('login')} onBack={() => setSelectedRole(null)} />;
      return <LoginGuruScreen onLogin={() => setUser(auth.currentUser)} onGoRegister={() => setAuthPage('register')} onBack={() => setSelectedRole(null)} />;
    }

    if (authPage === 'register') return <RegisterScreen onRegister={() => setAuthPage('login')} onGoLogin={() => setAuthPage('login')} />;
    return <LoginScreen onLogin={() => setUser(auth.currentUser)} onGoRegister={() => setAuthPage('register')} onBack={() => setSelectedRole(null)} />;
  }

  // GURU
  if (role === 'guru') {
    const renderGuruPage = () => {
      switch (activePageGuru) {
        case 'home':     return <GuruHomeScreen />;
        case 'rekap':    return <RekapScreen />;
        case 'qr':       return <QRTampilScreen />;
        case 'messages': return <MessagesScreen />;
        case 'profile':  return <ProfileScreen />;
        default:         return <GuruHomeScreen />;
      }
    };
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <View style={styles.content}>{renderGuruPage()}</View>
        <CustomTabBarGuru activePage={activePageGuru} onTabPress={setActivePageGuru} />
      </SafeAreaView>
    );
  }

  // ADMIN
  if (role === 'admin') {
    const renderAdminPage = () => {
      switch (activePageAdmin) {
        case 'home':         return <AdminHomeScreen />;
        case 'rekap':        return <RekapScreen />;
        case 'daftar_siswa': return <AdminDaftarSiswaScreen />;
        case 'messages':     return <MessagesScreen />;
        case 'profile':      return <ProfileScreen />;
        default:             return <AdminHomeScreen />;
      }
    };
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <View style={styles.content}>{renderAdminPage()}</View>
        <CustomTabBarAdmin activePage={activePageAdmin} onTabPress={setActivePageAdmin} />
      </SafeAreaView>
    );
  }

  // SISWA
  const renderPage = () => {
    switch (activePage) {
      case 'home':     return <HomeScreen />;
      case 'calendar': return <CalendarScreen />;
      case 'messages': return <PesanScreen />;
      case 'profile':  return <ProfileScreen />;
      case 'qr':       return <ScanScreen />;
      default:         return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.content}>{renderPage()}</View>
      <CustomTabBar activePage={activePage} onTabPress={setActivePage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { flex: 1 },
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  pageSubtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  loadingText: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 16 },
  loadingSubtext: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
});