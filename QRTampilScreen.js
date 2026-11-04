import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRTampilScreen() {
  const today = new Date().toLocaleDateString('id-ID');
  const todayISO = new Date().toISOString().split('T')[0];
  const qrValue = `MBG-${todayISO}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>QR Hari Ini</Text>
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>Tanggal Aktif</Text>
          <Text style={styles.dateValue}>{today}</Text>
        </View>
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Tampilkan QR ini ke siswa</Text>
          <View style={styles.qrWrap}>
            <QRCode
              value={qrValue}
              size={240}
              color="#000000"
              backgroundColor="white"
            />
          </View>
          <Text style={styles.qrCode}>{qrValue}</Text>
          <Text style={styles.qrHint}>QR ini otomatis berganti setiap hari pukul 00:00</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Cara Penggunaan</Text>
          <Text style={styles.infoText}>1. Tampilkan QR ini ke siswa</Text>
          <Text style={styles.infoText}>2. Siswa scan menggunakan app FoodTrayker</Text>
          <Text style={styles.infoText}>3. Siswa isi nama dan kelas</Text>
          <Text style={styles.infoText}>4. Data otomatis tersimpan di rekap</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 24, paddingBottom: 100, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 16, alignSelf: 'flex-start' },
  dateCard: { backgroundColor: '#8B0000', borderRadius: 12, padding: 14, marginBottom: 20, alignItems: 'center', width: '100%' },
  dateLabel: { fontSize: 12, color: '#FFB3B3', fontWeight: '500' },
  dateValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  qrCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0', marginBottom: 20, width: '100%' },
  qrTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 20 },
  qrWrap: { padding: 20, backgroundColor: 'white', borderRadius: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#E0E0E0' },
  qrCode: { fontSize: 13, color: '#8E8E93', marginBottom: 6, fontFamily: 'monospace' },
  qrHint: { fontSize: 12, color: '#8E8E93', textAlign: 'center' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#E0E0E0', width: '100%' },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  infoText: { fontSize: 13, color: '#8E8E93', marginBottom: 6, lineHeight: 20 },
});