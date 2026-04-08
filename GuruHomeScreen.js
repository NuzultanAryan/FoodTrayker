import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
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
import Logo from './Logo';

export default function GuruHomeScreen() {
  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rekapHariIni, setRekapHariIni] = useState({ ambil: 0, kembali: 0, total: 0 });
  const today = new Date().toLocaleDateString('id-ID');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const docSnap = await getDoc(doc(db, 'guru', uid));
      if (docSnap.exists()) setGuru(docSnap.data());
      const q = query(collection(db, 'mbg_records'), where('tanggal', '==', today));
      const snapshot = await getDocs(q);
      let ambil = 0, kembali = 0;
      snapshot.forEach(d => {
        if (d.data().status === 'Sudah Ambil') ambil++;
        if (d.data().status === 'Sudah Dikembalikan') kembali++;
      });
      setRekapHariIni({ ambil, kembali, total: snapshot.size });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Logo size={44} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.greeting}>Halo, 👋</Text>
              <Text style={styles.namaGuru}>{guru?.nama || 'Guru'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Tanggal */}
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>📅 Hari Ini</Text>
          <Text style={styles.dateValue}>{today}</Text>
        </View>

        {/* Rekap Hari Ini */}
        <Text style={styles.sectionTitle}>Rekap Hari Ini</Text>
        <View style={styles.rekapRow}>
          <View style={styles.rekapCard}>
            <Text style={styles.rekapAngka}>{rekapHariIni.total}</Text>
            <Text style={styles.rekapLabel}>Total Scan</Text>
          </View>
          <View style={styles.rekapCard}>
            <Text style={styles.rekapAngka}>{rekapHariIni.ambil}</Text>
            <Text style={styles.rekapLabel}>Sudah Ambil</Text>
          </View>
          <View style={styles.rekapCard}>
            <Text style={styles.rekapAngka}>{rekapHariIni.kembali}</Text>
            <Text style={styles.rekapLabel}>Dikembalikan</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Panduan Cepat</Text>
          <Text style={styles.infoText}>• Tekan tombol + untuk tampilkan QR ke siswa</Text>
          <Text style={styles.infoText}>• Buka menu Rekap untuk lihat & download laporan mingguan</Text>
          <Text style={styles.infoText}>• QR otomatis berganti setiap hari</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
          <Text style={styles.refreshText}>🔄 Perbarui Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 24, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  topLeft: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 12, color: '#666666' },
  namaGuru: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  logoutBtn: { borderWidth: 0.5, borderColor: '#FF4444', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: '#FF4444', fontSize: 13, fontWeight: '500' },
  dateCard: { backgroundColor: '#8B0000', borderRadius: 12, padding: 14, marginBottom: 24, alignItems: 'center' },
  dateLabel: { fontSize: 12, color: '#ffffff', fontWeight: '500' },
  dateValue: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  rekapRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  rekapCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  rekapAngka: { fontSize: 28, fontWeight: '700', color: '#1C1C1E' },
  rekapLabel: { fontSize: 11, color: '#666666', marginTop: 4, textAlign: 'center' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#E0E0E0', marginBottom: 16 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  infoText: { fontSize: 13, color: '#666666', marginBottom: 6, lineHeight: 20 },
  refreshBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0' },
  refreshText: { fontSize: 14, color: '#666666', fontWeight: '500' },
});