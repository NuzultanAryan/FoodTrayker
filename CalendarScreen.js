import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebase';

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEKDAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarScreen() {
  const today = new Date();
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailRecord, setDetailRecord] = useState(null);
  const [streak, setStreak] = useState(0);
  const [namaSiswa, setNamaSiswa] = useState('');

  // Step 1: ambil nama siswa dari koleksi 'siswa' pakai uid login
  useEffect(() => {
    const fetchNama = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const snap = await getDoc(doc(db, 'siswa', uid));
        if (snap.exists()) setNamaSiswa(snap.data().nama);
      } catch (err) {
        console.error('Gagal ambil profil:', err);
        setLoading(false);
      }
    };
    fetchNama();
  }, []);

  // Step 2: setelah nama tersedia, ambil records
  useEffect(() => {
    if (namaSiswa) fetchRecords();
  }, [namaSiswa, curYear, curMonth]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Query pakai nama — tidak butuh field uid di mbg_records
      const snap = await getDocs(
        query(collection(db, 'mbg_records'), where('nama', '==', namaSiswa))
      );

      const all = [];
      snap.forEach((d) => all.push({ id: d.id, ...d.data() }));

      // Filter bulan & tahun yang sedang ditampilkan
      const monthRecs = all.filter((r) => {
        const parts = r.tanggal?.split('/');
        if (!parts || parts.length !== 3) return false;
        return parseInt(parts[1]) - 1 === curMonth && parseInt(parts[2]) === curYear;
      });

      setRecords(monthRecs);
      calculateStreak(all);
    } catch (err) {
      console.error('Gagal ambil rekap:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (all) => {
    const takenDates = new Set(
      all
        .filter((r) => r.status === 'Sudah Ambil' || r.status === 'Sudah Dikembalikan')
        .map((r) => r.tanggal)
    );
    let count = 0;
    const check = new Date();
    for (let i = 0; i < 365; i++) {
      if (takenDates.has(check.toLocaleDateString('id-ID'))) {
        count++;
        check.setDate(check.getDate() - 1);
      } else break;
    }
    setStreak(count);
  };

  const getRecordForDay = (day) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(curMonth + 1).padStart(2, '0');
    return records.find((r) => r.tanggal === `${dd}/${mm}/${curYear}`) || null;
  };

  const handleDayPress = (day) => {
    setSelectedDay(day);
    setDetailRecord(getRecordForDay(day));
  };

  const prevMonth = () => {
    if (curMonth === 0) { setCurMonth(11); setCurYear((y) => y - 1); }
    else setCurMonth((m) => m - 1);
    setSelectedDay(null); setDetailRecord(null);
  };

  const nextMonth = () => {
    if (curMonth === 11) { setCurMonth(0); setCurYear((y) => y + 1); }
    else setCurMonth((m) => m + 1);
    setSelectedDay(null); setDetailRecord(null);
  };

  const buildCalendar = () => {
    const firstDay = new Date(curYear, curMonth, 1).getDay();
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, key: `e${i}` });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `d${d}` });
    return cells;
  };

  const isToday = (day) =>
    day === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();

  const countAmbil = records.filter(
    (r) => r.status === 'Sudah Ambil' || r.status === 'Sudah Dikembalikan'
  ).length;

  const countWorkdays = () => {
    const lastDay = (curYear === today.getFullYear() && curMonth === today.getMonth())
      ? today.getDate()
      : new Date(curYear, curMonth + 1, 0).getDate();
    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      const dow = new Date(curYear, curMonth, d).getDay();
      if (dow !== 0 && dow !== 6) count++;
    }
    return count;
  };

  const countBelum = Math.max(0, countWorkdays() - countAmbil);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      </View>
    );
  }

  const calCells = buildCalendar();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Riwayat MBG</Text>
            <Text style={styles.headerSubtitle}>
              {namaSiswa ? `Halo, ${namaSiswa}!` : 'Rekap pengambilan kamu'}
            </Text>
          </View>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS_ID[curMonth]} {curYear}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kalender */}
        <View style={styles.calCard}>
          <View style={styles.weekdayRow}>
            {WEEKDAY_SHORT.map((w) => (
              <Text key={w} style={styles.weekdayLabel}>{w}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {calCells.map(({ day, key }) => {
              if (!day) return <View key={key} style={styles.dayCell} />;
              const rec = getRecordForDay(day);
              const isTodayCell = isToday(day);
              const isSelected = day === selectedDay;
              const dow = new Date(curYear, curMonth, day).getDay();
              const isWeekend = dow === 0 || dow === 6;
              const hasTaken = rec &&
                (rec.status === 'Sudah Ambil' || rec.status === 'Sudah Dikembalikan');
              const isPast = new Date(curYear, curMonth, day) < today;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.dayCell,
                    isTodayCell && styles.dayCellToday,
                    !isTodayCell && isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayNum,
                    isTodayCell && styles.dayNumToday,
                    !isTodayCell && isSelected && styles.dayNumSelected,
                  ]}>
                    {day}
                  </Text>
                  {!isWeekend && (
                    <View style={styles.dotRow}>
                      <View style={[
                        styles.dot,
                        hasTaken
                          ? (isTodayCell ? styles.dotTodayColor : styles.dotTaken)
                          : (isPast ? styles.dotMissed : styles.dotEmpty),
                      ]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendLabel}>Sudah ambil</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
            <Text style={styles.legendLabel}>Hari ini</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendLabel}>Belum scan</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#4CAF50' }]}>{countAmbil}</Text>
            <Text style={styles.statLabel}>Sudah ambil</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#8B0000' }]}>{countBelum}</Text>
            <Text style={styles.statLabel}>Belum scan</Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <View>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>Hari berturut-turut ambil MBG</Text>
          </View>
          <Text style={styles.streakIcon}>🔥</Text>
        </View>

        {/* Detail hari yang dipilih */}
        {selectedDay && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>
              Detail — {selectedDay} {MONTHS_ID[curMonth]} {curYear}
            </Text>
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailDate}>
                  {DAYS_ID[new Date(curYear, curMonth, selectedDay).getDay()]},{' '}
                  {selectedDay} {MONTHS_ID[curMonth]} {curYear}
                </Text>
                {detailRecord ? (
                  <View style={[
                    styles.badge,
                    detailRecord.status === 'Sudah Dikembalikan'
                      ? styles.badgeKembali : styles.badgeAmbil,
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      detailRecord.status === 'Sudah Dikembalikan'
                        ? styles.badgeTextKembali : styles.badgeTextAmbil,
                    ]}>
                      {detailRecord.status === 'Sudah Dikembalikan' ? 'Dikembalikan' : 'Sudah Ambil'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.badgeBelum}>
                    <Text style={styles.badgeTextBelum}>Belum Scan</Text>
                  </View>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.timeRow}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>WAKTU AMBIL</Text>
                  <Text style={[styles.timeVal, !detailRecord?.waktu_ambil && styles.timeValEmpty]}>
                    {detailRecord?.waktu_ambil || '—'}
                  </Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>WAKTU KEMBALI</Text>
                  <Text style={[styles.timeVal, !detailRecord?.waktu_kembali && styles.timeValEmpty]}>
                    {detailRecord?.waktu_kembali || '—'}
                  </Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>KELAS</Text>
                  <Text style={styles.timeVal}>{detailRecord?.kelas || '—'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.infoHint}>Ketuk tanggal untuk melihat detail pengambilan</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 18, color: '#8B0000', lineHeight: 22 },
  monthLabel: { fontSize: 13, fontWeight: '600', color: '#1C1C1E', minWidth: 100, textAlign: 'center' },

  calCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 0.5, borderColor: '#E0E0E0', marginBottom: 14 },
  weekdayRow: { flexDirection: 'row', marginBottom: 8 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.3 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  dayCellToday: { backgroundColor: '#8B0000', borderRadius: 10 },
  dayCellSelected: { backgroundColor: '#FFF0F0', borderWidth: 1.5, borderColor: '#8B0000', borderRadius: 10 },
  dayNum: { fontSize: 14, color: '#1C1C1E' },
  dayNumToday: { color: '#FFFFFF', fontWeight: '600' },
  dayNumSelected: { color: '#8B0000', fontWeight: '600' },
  dotRow: { marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dotTaken: { backgroundColor: '#4CAF50' },
  dotMissed: { backgroundColor: '#E0E0E0' },
  dotTodayColor: { backgroundColor: 'rgba(255,255,255,0.7)' },
  dotEmpty: { backgroundColor: 'transparent' },

  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#8E8E93' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0' },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2 },

  streakCard: { backgroundColor: '#8B0000', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  streakNum: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  streakLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  streakIcon: { fontSize: 28 },

  detailSection: { marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  detailCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#E0E0E0', marginBottom: 8 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  detailDate: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', flex: 1 },
  divider: { height: 0.5, backgroundColor: '#E0E0E0', marginBottom: 10 },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 10, color: '#8E8E93', marginBottom: 3, letterSpacing: 0.3 },
  timeVal: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  timeValEmpty: { color: '#C0C0C0', fontWeight: '400' },
  infoHint: { fontSize: 12, color: '#8E8E93', textAlign: 'center' },

  badge: { borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  badgeAmbil: { backgroundColor: '#E8F5E9' },
  badgeKembali: { backgroundColor: '#E3F2FD' },
  badgeBelum: { backgroundColor: '#F2F2F7', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextAmbil: { color: '#2E7D32' },
  badgeTextKembali: { color: '#1565C0' },
  badgeTextBelum: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },
});