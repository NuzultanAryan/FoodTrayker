import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { collection, getDocs } from 'firebase/firestore';
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
import { db } from './firebase';

export default function RekapScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toLocaleDateString('id-ID'));
    }
    return dates;
  };

  useEffect(() => { fetchRekap(); }, []);

  const fetchRekap = async () => {
    setLoading(true);
    try {
      const weekDates = getWeekRange();
      const allDocs = await getDocs(collection(db, 'mbg_records'));
      const filtered = [];
      allDocs.forEach(d => {
        if (weekDates.includes(d.data().tanggal)) {
          filtered.push({ id: d.id, ...d.data() });
        }
      });
      filtered.sort((a, b) => a.tanggal?.localeCompare(b.tanggal));
      setRecords(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (records.length === 0) {
      Alert.alert('Info', 'Tidak ada data minggu ini.');
      return;
    }
    setLoadingExcel(true);
    try {
      let csv = 'No,Nama,Kelas,Tanggal,Waktu Ambil,Waktu Kembali,Status\n';
      records.forEach((r, i) => {
        csv += `${i + 1},"${r.nama || ''}","${r.kelas || ''}","${r.tanggal || ''}","${r.waktu_ambil || '-'}","${r.waktu_kembali || '-'}","${r.status || ''}"\n`;
      });
      const fileName = `Laporan_MBG_Minggu_Ini.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Simpan Laporan MBG' });
      } else {
        Alert.alert('Tersimpan', `File: ${filePath}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal membuat laporan.');
    } finally {
      setLoadingExcel(false);
    }
  };

  const ambil = records.filter(r => r.status === 'Sudah Ambil').length;
  const kembali = records.filter(r => r.status === 'Sudah Dikembalikan').length;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Rekap Mingguan</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{records.length}</Text>
            <Text style={styles.summaryLabel}>Total Scan</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{ambil}</Text>
            <Text style={styles.summaryLabel}>Sudah Ambil</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{kembali}</Text>
            <Text style={styles.summaryLabel}>Dikembalikan</Text>
          </View>
        </View>

        {/* Export */}
        <TouchableOpacity
          style={[styles.btnExcel, loadingExcel && { opacity: 0.6 }]}
          onPress={exportExcel}
          disabled={loadingExcel}
        >
          {loadingExcel
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.btnExcelText}>📊 Download Excel</Text>
          }
        </TouchableOpacity>

        {/* List */}
        {records.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Belum ada data minggu ini</Text>
          </View>
        ) : (
          records.map((r, i) => (
            <View key={r.id} style={styles.recordCard}>
              <View style={styles.recordTop}>
                <Text style={styles.recordNama}>{r.nama}</Text>
                <View style={[styles.badge, r.status === 'Sudah Dikembalikan' && styles.badgeKembali]}>
                  <Text style={styles.badgeText}>
                    {r.status === 'Sudah Dikembalikan' ? 'Dikembalikan' : 'Ambil'}
                  </Text>
                </View>
              </View>
              <Text style={styles.recordDetail}>Kelas {r.kelas} · {r.tanggal}</Text>
              <Text style={styles.recordDetail}>
                Ambil: {r.waktu_ambil || '-'} · Kembali: {r.waktu_kembali || '-'}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchRekap}>
          <Text style={styles.refreshText}>🔄 Perbarui</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 24, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  summaryNum: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
  summaryLabel: { fontSize: 11, color: '#666666', marginTop: 2, textAlign: 'center' },
  btnExcel: {
    backgroundColor: '#8B0000', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 20,
  },
  btnExcelText: { color: '#FFFFFF',  fontSize: 15, fontWeight: '700', color: '#ffffff' },
  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#666666', fontSize: 15 },
  recordCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  recordTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  recordNama: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', flex: 1 },
  recordDetail: { fontSize: 12, color: '#666666', marginTop: 2 },
  badge: {
    backgroundColor: '#8B0000', borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 8,
  },
  badgeKembali: { backgroundColor: '#F0F0F0' },
  badgeText: { color: '#1C1C1E', fontSize: 11, fontWeight: '600' },
  refreshBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 12,
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  refreshText: { fontSize: 14, color: '#666666', fontWeight: '500' },
});