import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function RekapScreen() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExcel, setLoadingExcel] = useState(false);

  // Kalender state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null); // tanggal yang diklik

  // Fetch semua data dari Firebase
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'mbg_records'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllRecords(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  // Convert tanggal Indonesia ke Date object
  const parseIndonesianDate = (tgl) => {
    if (!tgl) return null;
    const parts = tgl.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  // Cek apakah tanggal punya data
  const hasData = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    const tglStr = d.toLocaleDateString('id-ID');
    return allRecords.some(r => r.tanggal === tglStr);
  };

  // Data per tanggal yang dipilih
  const dataHariIni = selectedDate
    ? allRecords.filter(r => r.tanggal === selectedDate)
    : [];

  // Data per minggu aktif (minggu yang mengandung hari ini atau selectedDate)
  const getWeekData = () => {
    const base = selectedDate
      ? parseIndonesianDate(selectedDate) || today
      : today;
    const day = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toLocaleDateString('id-ID'));
    }
    return {
      data: allRecords.filter(r => dates.includes(r.tanggal)),
      start: monday.toLocaleDateString('id-ID'),
      end: new Date(monday.getTime() + 6 * 86400000).toLocaleDateString('id-ID'),
    };
  };

  const weekInfo = getWeekData();

  // Generate kalender
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const handleDayPress = (day) => {
    if (!day) return;
    const d = new Date(currentYear, currentMonth, day);
    const tglStr = d.toLocaleDateString('id-ID');
    setSelectedDate(prev => prev === tglStr ? null : tglStr);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  // Download CSV
  const downloadCSV = async (data, label) => {
    if (data.length === 0) {
      Alert.alert('Info', `Tidak ada data untuk ${label}.`);
      return;
    }
    setLoadingExcel(true);
    try {
      const BOM = '\uFEFF';
      let csv = BOM + 'No,Kelas,Tanggal,Waktu Ambil,Waktu Kembali,Status\n';
      data.forEach((r, i) => {
        const kelas = (r.kelas || r.nama || '-').replace(/,/g, ' ');
        const tanggal = (r.tanggal || '-').replace(/,/g, ' ');
        const waktuAmbil = (r.waktu_ambil || '-').replace(/,/g, ' ');
        const waktuKembali = (r.waktu_kembali || '-').replace(/,/g, ' ');
        const status = (r.status || '-').replace(/,/g, ' ');
        csv += `${i + 1},"${kelas}","${tanggal}","${waktuAmbil}","${waktuKembali}","${status}"\n`;
      });

      const safeLabel = label.replace(/\//g, '-');
      const fileName = `Rekap_MBG_${safeLabel}.csv`;
      const filePath = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: 'utf8' });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Info', `File disimpan di:\n${filePath}`);
        return;
      }
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: `Simpan Rekap MBG ${label}`,
        UTI: 'public.comma-separated-values-text',
      });
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert('Error', `Gagal membuat laporan:\n${err.message}`);
    } finally {
      setLoadingExcel(false);
    }
  };

  const cells = generateCalendar();

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── KALENDER ── */}
        <View style={styles.calCard}>
          {/* Header bulan */}
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
              <Text style={styles.calNavText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthText}>{BULAN[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
              <Text style={styles.calNavText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Header hari */}
          <View style={styles.calDayHeader}>
            {HARI.map(h => (
              <Text key={h} style={styles.calDayLabel}>{h}</Text>
            ))}
          </View>

          {/* Grid tanggal */}
          <View style={styles.calGrid}>
            {cells.map((day, idx) => {
              if (!day) return <View key={`e-${idx}`} style={styles.calCell} />;
              const d = new Date(currentYear, currentMonth, day);
              const tglStr = d.toLocaleDateString('id-ID');
              const isSelected = selectedDate === tglStr;
              const isToday = d.toDateString() === today.toDateString();
              const hasDot = hasData(day);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <TouchableOpacity
                  key={`d-${day}`}
                  style={[
                    styles.calCell,
                    isSelected && styles.calCellSelected,
                    isToday && !isSelected && styles.calCellToday,
                  ]}
                  onPress={() => handleDayPress(day)}
                >
                  <Text style={[
                    styles.calDayNum,
                    isSelected && styles.calDayNumSelected,
                    isToday && !isSelected && styles.calDayNumToday,
                    isWeekend && !isSelected && styles.calDayNumWeekend,
                  ]}>{day}</Text>
                  {hasDot && <View style={[styles.calDot, isSelected && styles.calDotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
              <Text style={styles.legendText}>Ada data</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E0E0', borderWidth: 1, borderColor: '#8B0000' }]} />
              <Text style={styles.legendText}>Hari ini</Text>
            </View>
          </View>
        </View>

        {/* ── DATA HARIAN ── */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 {selectedDate}</Text>
              <TouchableOpacity
                style={[styles.btnDownloadSmall, loadingExcel && { opacity: 0.6 }]}
                onPress={() => downloadCSV(dataHariIni, selectedDate)}
                disabled={loadingExcel}
              >
                {loadingExcel
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.btnDownloadSmallText}>⬇ Download</Text>
                }
              </TouchableOpacity>
            </View>

            {dataHariIni.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Tidak ada data pada tanggal ini</Text>
              </View>
            ) : (
              dataHariIni.map(r => (
                <View key={r.id} style={styles.recordCard}>
                  <View style={styles.recordTop}>
                    <Text style={styles.recordNama}>{r.kelas || r.nama || '-'}</Text>
                    <View style={[styles.badge, { backgroundColor: r.status === 'Sudah Dikembalikan' ? '#F0F0F0' : '#FFF0F0' }]}>
                      <Text style={[styles.badgeText, { color: r.status === 'Sudah Dikembalikan' ? '#666' : '#8B0000' }]}>
                        {r.status === 'Sudah Dikembalikan' ? 'Dikembalikan' : 'Ambil'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recordDetail}>Ambil: {r.waktu_ambil || '-'} · Kembali: {r.waktu_kembali || '-'}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── REKAP MINGGUAN ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Rekap Mingguan</Text>
          </View>
          <Text style={styles.weekRangeText}>{weekInfo.start} — {weekInfo.end}</Text>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{weekInfo.data.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{weekInfo.data.filter(r => r.status === 'Sudah Ambil').length}</Text>
              <Text style={styles.summaryLabel}>Ambil</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{weekInfo.data.filter(r => r.status === 'Sudah Dikembalikan').length}</Text>
              <Text style={styles.summaryLabel}>Kembali</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnExcel, loadingExcel && { opacity: 0.6 }]}
            onPress={() => downloadCSV(weekInfo.data, `${weekInfo.start}_${weekInfo.end}`)}
            disabled={loadingExcel}
          >
            {loadingExcel
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnExcelText}>📊 Download Excel Mingguan</Text>
            }
          </TouchableOpacity>

          {weekInfo.data.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Belum ada data minggu ini</Text>
            </View>
          ) : (
            weekInfo.data.map(r => (
              <View key={r.id} style={styles.recordCard}>
                <View style={styles.recordTop}>
                  <Text style={styles.recordNama}>{r.kelas || r.nama || '-'}</Text>
                  <View style={[styles.badge, { backgroundColor: r.status === 'Sudah Dikembalikan' ? '#F0F0F0' : '#FFF0F0' }]}>
                    <Text style={[styles.badgeText, { color: r.status === 'Sudah Dikembalikan' ? '#666' : '#8B0000' }]}>
                      {r.status === 'Sudah Dikembalikan' ? 'Dikembalikan' : 'Ambil'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recordDetail}>{r.tanggal} · Ambil: {r.waktu_ambil || '-'} · Kembali: {r.waktu_kembali || '-'}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAll}>
          <Text style={styles.refreshText}>🔄 Perbarui Data</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },

  // Kalender
  calCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 14, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  calHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  calNavBtn: { padding: 8 },
  calNavText: { fontSize: 22, color: '#8B0000', fontWeight: '700' },
  calMonthText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  calDayHeader: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6,
  },
  calDayLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600', width: 36, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: '14.28%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  calCellSelected: { backgroundColor: '#8B0000', borderRadius: 20 },
  calCellToday: { borderWidth: 1.5, borderColor: '#8B0000', borderRadius: 20 },
  calDayNum: { fontSize: 13, color: '#1C1C1E', fontWeight: '500' },
  calDayNumSelected: { color: '#FFFFFF', fontWeight: '700' },
  calDayNumToday: { color: '#8B0000', fontWeight: '700' },
  calDayNumWeekend: { color: '#8E8E93' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#8B0000', marginTop: 1 },
  calDotSelected: { backgroundColor: '#FFFFFF' },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#E0E0E0' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#8E8E93' },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  weekRangeText: { fontSize: 12, color: '#8E8E93', marginBottom: 10, marginTop: -4 },

  // Download kecil
  btnDownloadSmall: {
    backgroundColor: '#8B0000', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 12,
  },
  btnDownloadSmallText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  // Summary
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  summaryNum: { fontSize: 24, fontWeight: '700', color: '#8B0000' },
  summaryLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2 },

  // Excel button
  btnExcel: {
    backgroundColor: '#8B0000', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 12,
  },
  btnExcelText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Records
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 20, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  emptyText: { color: '#8E8E93', fontSize: 14 },
  recordCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 12, marginBottom: 8,
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  recordTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  recordNama: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', flex: 1 },
  recordDetail: { fontSize: 12, color: '#8E8E93' },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Refresh
  refreshBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  refreshText: { fontSize: 14, color: '#8B0000', fontWeight: '500' },
});