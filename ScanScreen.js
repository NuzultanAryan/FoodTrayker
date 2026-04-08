import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('scan');
  const [statusPesan, setStatusPesan] = useState('');

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermission();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setQrData(data);
    if (!data.includes('MBG')) {
      Alert.alert('QR Tidak Valid', 'QR Code ini bukan untuk pengambilan MBG.', [
        { text: 'Scan Ulang', onPress: () => setScanned(false) },
      ]);
      return;
    }
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!nama.trim() || !kelas.trim()) {
      Alert.alert('Peringatan', 'Nama dan kelas harus diisi!');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString('id-ID');
      const q = query(
        collection(db, 'mbg_records'),
        where('nama', '==', nama.trim()),
        where('kelas', '==', kelas.trim()),
        where('tanggal', '==', today)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, 'mbg_records'), {
          nama: nama.trim(), kelas: kelas.trim(), tanggal: today,
          waktu_ambil: new Date().toLocaleTimeString('id-ID'),
          waktu_kembali: null, status: 'Sudah Ambil', qr_data: qrData,
        });
        setStatusPesan('✅ Berhasil! Data pengambilan MBG tercatat.');
      } else {
        const existing = snap.docs[0].data();
        if (existing.status === 'Sudah Ambil') {
          await updateDoc(doc(db, 'mbg_records', snap.docs[0].id), {
            status: 'Sudah Dikembalikan',
            waktu_kembali: new Date().toLocaleTimeString('id-ID'),
          });
          setStatusPesan('🔄 Berhasil! Status diperbarui: Sudah Dikembalikan.');
        } else {
          setStatusPesan('ℹ️ Kamu sudah melakukan scan ambil dan kembali hari ini.');
        }
      }
      setStep('success');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan data. Coba lagi.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setScanned(false); setNama(''); setKelas('');
    setQrData(''); setStep('scan'); setStatusPesan('');
  };

  // Loading permission
  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.permText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  // Permission ditolak
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Izin kamera ditolak.</Text>
        <Text style={styles.permSubText}>Aktifkan izin kamera di pengaturan HP kamu.</Text>
        <TouchableOpacity style={styles.btnRed} onPress={async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        }}>
          <Text style={styles.btnWhiteText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SCAN
  if (step === 'scan') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <Text style={styles.scanTitle}>Scan QR MBG</Text>
          <View style={styles.scanBox} />
          <Text style={styles.scanHint}>Arahkan kamera ke QR Code dari guru</Text>
          {scanned && (
            <TouchableOpacity style={styles.btnRescan} onPress={() => setScanned(false)}>
              <Text style={styles.btnWhiteText}>Scan Ulang</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // FORM
  if (step === 'form') {
    return (
      <SafeAreaView style={styles.formContainer}>
        <Text style={styles.formTitle}>Isi Data Diri</Text>
        <Text style={styles.formSubtitle}>QR berhasil discan! Lengkapi data kamu.</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput style={styles.input} placeholder="Masukkan nama lengkap" value={nama} onChangeText={setNama} autoCapitalize="words" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kelas</Text>
          <TextInput style={styles.input} placeholder="Contoh: 10A, 11B" value={kelas} onChangeText={setKelas} autoCapitalize="characters" />
        </View>
        <TouchableOpacity style={[styles.btnRed, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnWhiteText}>Simpan Data</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnCancel} onPress={resetScan}>
          <Text style={styles.btnCancelText}>Batal</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // SUCCESS
  return (
    <SafeAreaView style={styles.successContainer}>
      <Text style={styles.successIcon}>🎉</Text>
      <Text style={styles.successTitle}>Berhasil!</Text>
      <Text style={styles.successMsg}>{statusPesan}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoRow}>👤 Nama: <Text style={styles.infoVal}>{nama}</Text></Text>
        <Text style={styles.infoRow}>🏫 Kelas: <Text style={styles.infoVal}>{kelas}</Text></Text>
        <Text style={styles.infoRow}>📅 Tanggal: <Text style={styles.infoVal}>{new Date().toLocaleDateString('id-ID')}</Text></Text>
        <Text style={styles.infoRow}>🕐 Waktu: <Text style={styles.infoVal}>{new Date().toLocaleTimeString('id-ID')}</Text></Text>
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
  scanTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 32 },
  scanBox: { width: 220, height: 220, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 16, marginBottom: 32 },
  scanHint: { color: '#FFFFFF', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  btnRescan: { marginTop: 24, backgroundColor: '#8B0000', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  formContainer: { flex: 1, backgroundColor: '#F2F2F7', padding: 24, justifyContent: 'center' },
  formTitle: { fontSize: 26, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 28 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 0.5, borderColor: '#E0E0E0', color: '#1C1C1E' },
  btnRed: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnWhiteText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnCancel: { padding: 16, alignItems: 'center', marginTop: 4 },
  btnCancelText: { color: '#8E8E93', fontSize: 15 },
  successContainer: { flex: 1, backgroundColor: '#F2F2F7', padding: 24, alignItems: 'center', justifyContent: 'center' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  successMsg: { fontSize: 15, color: '#3C3C3C', textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  infoRow: { fontSize: 14, color: '#8E8E93', marginBottom: 6 },
  infoVal: { color: '#1C1C1E', fontWeight: '600' },
});