import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from './firebase';

export default function AdminDaftarSiswaScreen() {
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDaftar(); }, []);

  const fetchDaftar = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'kelas'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.kelas || '').localeCompare(b.kelas || ''));
      setDaftarKelas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = daftarKelas.filter(k =>
    (k.kelas || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daftar Akun Siswa</Text>
          <Text style={styles.subtitle}>{daftarKelas.length} kelas terdaftar</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kelas..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="characters"
          />
        </View>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Tidak ada kelas ditemukan</Text>
          </View>
        ) : (
          filtered.map((k, i) => (
            <View key={k.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{k.kelas?.charAt(0) || '?'}</Text>
                </View>
                <View>
                  <Text style={styles.kelasText}>Kelas {k.kelas}</Text>
                  <Text style={styles.tglText}>Terdaftar: {k.createdAt || '-'}</Text>
                </View>
              </View>
              <View style={styles.noBadge}>
                <Text style={styles.noBadgeText}>#{i + 1}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchDaftar}>
          <Text style={styles.refreshText}>🔄 Perbarui</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#E0E0E0', gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#1C1C1E' },
  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#8E8E93' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#8B0000',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  kelasText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  tglText: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  noBadge: {
    backgroundColor: '#FFF0F0', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 0.5, borderColor: '#8B0000',
  },
  noBadgeText: { fontSize: 12, color: '#8B0000', fontWeight: '600' },
  refreshBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 8,
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  refreshText: { fontSize: 14, color: '#8B0000', fontWeight: '500' },
});