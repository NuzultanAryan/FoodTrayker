import { Camera, CameraView } from 'expo-camera';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebase';

// Konfigurasi tampilan notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [kelas, setKelas] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('scan');
  const [statusPesan, setStatusPesan] = useState('');
  const [waktuScan, setWaktuScan] = useState('');

  useEffect(() => {
    const init = async () => {
      // Minta izin kamera
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Minta izin notifikasi
      await requestNotificationPermission();

      // Ambil data kelas dari akun
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const snap = await getDoc(doc(db, 'kelas', uid));
        if (snap.exists()) setKelas(snap.data().kelas);
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  const requestNotificationPermission = async () => {
    if (!Device.isDevice) return; // Skip di emulator
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Izin notifikasi ditolak');
      }
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mbg-reminder', {
        name: 'MBG Reminder',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B0000',
      });
    }
  };

  const jadwalkanNotifikasi = async (namaKelas) => {
    try {
      // Batalkan notifikasi sebelumnya kalau ada
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Jadwalkan notifikasi 1 jam 30 menit = 5400 detik
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🍱 Waktunya Kembalikan Nampan!',
          body: `Kelas ${namaKelas} — Sudah 1,5 jam sejak pengambilan MBG. Jangan lupa kembalikan nampan kamu ya!`,
          sound: true,
          color: '#8B0000',
          data: { kelas: namaKelas },
        },
        trigger: {
          seconds: 5400, // 1 jam 30 menit
          channelId: 'mbg-reminder',
        },
      });
      console.log('Notifikasi dijadwalkan 1,5 jam lagi');
    } catch (e) {
      console.error('Gagal jadwalkan notifikasi:', e);
    }
  };

  const batalkanNotifikasi = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Notifikasi dibatalkan');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);

    if (!data.includes('MBG')) {
      Alert.alert('QR Tidak Valid', 'QR Code ini bukan untuk pengambilan MBG.', [
        { text: 'Scan Ulang', onPress: () => setScanned(false) },
      ]);
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toLocaleDateString('id-ID');
      const waktu = new Date().toLocaleTimeString('id-ID');

      const q = query(
        collection(db, 'mbg_records'),
        where('kelas', '==', kelas),
        where('tanggal', '==', today),
        where('tipe', '==', 'kelas')
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        // Scan pertama → Sudah Ambil → jadwalkan notifikasi
        await addDoc(collection(db, 'mbg_records'), {
          kelas: kelas,
          tanggal: today,
          waktu_ambil: waktu,
          waktu_kembali: null,
          status: 'Sudah Ambil',
          qr_data: data,
          tipe: 'kelas',
        });

        // Jadwalkan reminder 1,5 jam
        await jadwalkanNotifikasi(kelas);

        setStatusPesan('✅ Berhasil! Pengambilan MBG tercatat.\n\n⏰ Kamu akan diingatkan untuk mengembalikan nampan dalam 1,5 jam.');
      } else {
        const existing = snap.docs[0].data();
        if (existing.status === 'Sudah Ambil') {
          // Scan kedua → Sudah Dikembalikan → batalkan notifikasi
          await updateDoc(doc(db, 'mbg_records', snap.docs[0].id), {
            status: 'Sudah Dikembalikan',
            waktu_kembali: waktu,
          });

          // Batalkan notifikasi karena sudah dikembalikan
          await batalkanNotifikasi();

          setStatusPesan('🔄 Berhasil! Nampan sudah dikembalikan.\n\n✅ Notifikasi reminder dibatalkan.');
        } else {
          setStatusPesan('ℹ️ Kelas kamu sudah melakukan scan ambil dan kembali hari ini.');
        }
      }

      setWaktuScan(waktu);
      setStep('success');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan data. Coba lagi.');
      setScanned(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setStep('scan');
    setStatusPesan('');
    setWaktuScan('');
  };

  if (hasPermission === null) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
      <Text style={styles.permText}>Meminta izin kamera...</Text>
    </View>
  );

  if (hasPermission === false) return (
    <View style={styles.center}>
      <Text style={styles.permText}>Izin kamera ditolak.</Text>
      <Text style={styles.permSubText}>Aktifkan izin kamera di pengaturan HP.</Text>
      <TouchableOpacity style={styles.btnRed} onPress={async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }}>
        <Text style={styles.btnWhiteText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  // SCAN
  if (step === 'scan') return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.scanTitle}>Scan QR MBG</Text>
        <Text style={styles.scanKelas}>Kelas {kelas}</Text>
        <View style={styles.scanBox}>
          {loading && <ActivityIndicator size="large" color="#FFFFFF" />}
        </View>
        <Text style={styles.scanHint}>Arahkan kamera ke QR Code dari guru</Text>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderInfoText}>
            ⏰ Setelah scan, kamu akan diingatkan untuk mengembalikan nampan dalam 1,5 jam
          </Text>
        </View>
        {scanned && !loading && (
          <TouchableOpacity style={styles.btnRescan} onPress={() => setScanned(false)}>
            <Text style={styles.btnWhiteText}>Scan Ulang</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // SUCCESS
  return (
    <SafeAreaView style={styles.successContainer}>
      <Text style={styles.successIcon}>🎉</Text>
      <Text style={styles.successTitle}>Berhasil!</Text>
      <Text style={styles.successMsg}>{statusPesan}</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏫 Kelas</Text>
          <Text style={styles.infoVal}>{kelas}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Tanggal</Text>
          <Text style={styles.infoVal}>{new Date().toLocaleDateString('id-ID')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🕐 Waktu</Text>
          <Text style={styles.infoVal}>{waktuScan}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.btnRed} onPress={resetScan}>
        <Text style={styles.btnWhiteText}>Scan Lagi</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7', padding: 24 },
  permText: { fontSize: 16, color: '#1C1C1E', textAlign: 'center', marginTop: 16, fontWeight: '600' },
  permSubText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  cameraContainer: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  scanTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  scanKelas: { color: '#FFB3B3', fontSize: 14, marginBottom: 28 },
  scanBox: { width: 220, height: 220, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 16, marginBottom: 28, alignItems: 'center', justifyContent: 'center' },
  scanHint: { color: '#FFFFFF', fontSize: 13, textAlign: 'center', paddingHorizontal: 32, marginBottom: 16 },
  reminderInfo: {
    backgroundColor: 'rgba(139,0,0,0.7)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16,
    marginHorizontal: 24, marginTop: 4,
  },
  reminderInfoText: { color: '#FFB3B3', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  btnRescan: { marginTop: 20, backgroundColor: '#8B0000', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  btnRed: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, width: '100%' },
  btnWhiteText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, backgroundColor: '#F2F2F7', padding: 24, alignItems: 'center', justifyContent: 'center' },
  successIcon: { fontSize: 72, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  successMsg: { fontSize: 14, color: '#3C3C3C', textAlign: 'center', marginBottom: 28, paddingHorizontal: 16, lineHeight: 22 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 4, width: '100%', marginBottom: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  infoLabel: { fontSize: 14, color: '#8E8E93' },
  infoVal: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  divider: { height: 0.5, backgroundColor: '#E0E0E0', marginHorizontal: 14 },
});