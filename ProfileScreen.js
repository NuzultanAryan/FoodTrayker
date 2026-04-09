import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebase';

export default function ProfileScreen() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuru, setIsGuru] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        // Cek guru
        const guruSnap = await getDoc(doc(db, 'guru', uid));
        if (guruSnap.exists()) {
          setProfil(guruSnap.data());
          setIsGuru(true);
          return;
        }
        // Cek kelas (siswa)
        const kelasSnap = await getDoc(doc(db, 'kelas', uid));
        if (kelasSnap.exists()) setProfil(kelasSnap.data());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {isGuru ? '👨‍🏫' : '🎒'}
            </Text>
          </View>
          <Text style={styles.namaText}>
            {isGuru ? profil?.nama : `Kelas ${profil?.kelas}`}
          </Text>
          <Text style={styles.subText}>
            {isGuru ? `NIP: ${profil?.nip || '-'}` : 'Akun Kelas'}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{isGuru ? '👨‍🏫 Guru' : '🎒 Siswa'}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          {isGuru ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NIP</Text>
                <Text style={styles.infoValue}>{profil?.nip || '-'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama Lengkap</Text>
                <Text style={styles.infoValue}>{profil?.nama || '-'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>Guru</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kelas</Text>
                <Text style={styles.infoValue}>{profil?.kelas || '-'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tipe Akun</Text>
                <Text style={styles.infoValue}>Akun Kelas</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Terdaftar Sejak</Text>
                <Text style={styles.infoValue}>{profil?.createdAt || '-'}</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 24, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 28 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#8B0000', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  namaText: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  subText: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  roleBadge: {
    backgroundColor: '#FFF0F0', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 14,
    borderWidth: 0.5, borderColor: '#8B0000',
  },
  roleBadgeText: { fontSize: 13, color: '#8B0000', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 0.5, borderColor: '#E0E0E0',
    marginBottom: 16, padding: 4,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  infoLabel: { fontSize: 14, color: '#8E8E93' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  divider: { height: 0.5, backgroundColor: '#E0E0E0', marginHorizontal: 16 },
  btnLogout: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#FF3B30',
  },
  btnLogoutText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
});