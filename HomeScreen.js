import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from './firebase';

export default function HomeScreen() {
  const [kelas, setKelas] = useState('');
  const [statusHariIni, setStatusHariIni] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [stats, setStats] = useState({ ambil: 0, kembali: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('id-ID');
  const jam = new Date().getHours();
  const sapa = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Ambil kelas dari akun
      const kelasSnap = await getDoc(doc(db, 'kelas', uid));
      const namaKelas = kelasSnap.exists() ? kelasSnap.data().kelas : '';
      setKelas(namaKelas);

      // Ambil semua record kelas ini
      const q = query(collection(db, 'mbg_records'), where('kelas', '==', namaKelas));
      const snap = await getDocs(q);
      const allRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Status hari ini (cek apakah ada record hari ini)
      const hariIni = allRecords.filter(r => r.tanggal === today);
      if (hariIni.length > 0) {
        const sudahKembali = hariIni.filter(r => r.status === 'Sudah Dikembalikan').length;
        const sudahAmbil = hariIni.filter(r => r.status === 'Sudah Ambil').length;
        setStatusHariIni({
          totalAmbil: hariIni.length,
          sudahKembali,
          sudahAmbil,
          waktuAmbilPertama: hariIni[0]?.waktu_ambil || '-',
        });
      }

      // Statistik keseluruhan
      const totalAmbil = allRecords.length;
      const totalKembali = allRecords.filter(r => r.status === 'Sudah Dikembalikan').length;
      const totalPending = allRecords.filter(r => r.status === 'Sudah Ambil').length;
      setStats({ ambil: totalAmbil, kembali: totalKembali, pending: totalPending });

      // Riwayat 5 terbaru
      const sorted = allRecords.sort((a, b) => {
        const dateA = a.tanggal?.split('/').reverse().join('-');
        const dateB = b.tanggal?.split('/').reverse().join('-');
        return dateB?.localeCompare(dateA);
      });
      setRiwayat(sorted.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Sudah Dikembalikan') return '#4CAF50';
    if (status === 'Sudah Ambil') return '#8B0000';
    return '#8E8E93';
  };

  const getStatusBg = (status) => {
    if (status === 'Sudah Dikembalikan') return '#F0FFF0';
    if (status === 'Sudah Ambil') return '#FFF0F0';
    return '#F0F0F0';
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sapa}>{sapa} 👋</Text>
            <Text style={styles.kelasText}>Kelas {kelas}</Text>
          </View>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🍱</Text>
          </View>
        </View>

        {/* Status Hari Ini */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status MBG Hari Ini</Text>
          {statusHariIni ? (
            <View>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: '#8B0000' }]} />
                <Text style={styles.statusText}>{statusHariIni.totalAmbil} siswa sudah ambil</Text>
                <Text style={styles.statusTime}>{statusHariIni.waktuAmbilPertama}</Text>
              </View>
              {statusHariIni.sudahKembali > 0 && (
                <View style={[styles.statusRow, { marginTop: 6 }]}>
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={[styles.statusText, { color: '#4CAF50' }]}>{statusHariIni.sudahKembali} siswa sudah kembalikan</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#8E8E93' }]} />
              <Text style={[styles.statusText, { color: '#8E8E93' }]}>Belum ada yang scan hari ini</Text>
            </View>
          )}
        </View>

        {/* Statistik */}
        <Text style={styles.sectionTitle}>Statistik Kelas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.ambil}</Text>
            <Text style={styles.statLabel}>Total Ambil</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#4CAF50' }]}>{stats.kembali}</Text>
            <Text style={styles.statLabel}>Dikembalikan</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#FF9500' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Belum Kembali</Text>
          </View>
        </View>

        {/* Riwayat */}
        <View style={styles.riwayatHeader}>
          <Text style={styles.sectionTitle}>Riwayat Terbaru</Text>
          <TouchableOpacity onPress={fetchData}>
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {riwayat.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Belum ada data scan</Text>
          </View>
        ) : (
          riwayat.map((r) => (
            <View key={r.id} style={styles.riwayatCard}>
              <View style={styles.riwayatLeft}>
                <Text style={styles.riwayatNama}>{r.nama}</Text>
                <Text style={styles.riwayatInfo}>{r.tanggal} · Ambil: {r.waktu_ambil || '-'}</Text>
                {r.waktu_kembali && (
                  <Text style={styles.riwayatInfo}>Kembali: {r.waktu_kembali}</Text>
                )}
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusBg(r.status) }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(r.status) }]}>
                  {r.status === 'Sudah Dikembalikan' ? 'Selesai' : 'Ambil'}
                </Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#8B0000', padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sapa: { fontSize: 13, color: '#FFB3B3', marginBottom: 2 },
  kelasText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  logoBox: {
    width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  statusCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16,
    marginTop: -1, borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: '#E0E0E0', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statusLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#8B0000', flex: 1 },
  statusTime: { fontSize: 12, color: '#8E8E93' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 10, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  statNum: { fontSize: 26, fontWeight: '700', color: '#8B0000' },
  statLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2, textAlign: 'center' },
  riwayatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 10 },
  refreshText: { fontSize: 13, color: '#8B0000', fontWeight: '500' },
  emptyWrap: { alignItems: 'center', marginTop: 24 },
  emptyText: { fontSize: 14, color: '#8E8E93' },
  riwayatCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16,
    borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  riwayatLeft: { flex: 1 },
  riwayatNama: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  riwayatInfo: { fontSize: 12, color: '#8E8E93' },
  badge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});