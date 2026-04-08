import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function RegisterGuruScreen({ onRegister, onGoLogin, onBack }) {
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama.trim() || !nip.trim()) {
      Alert.alert('Peringatan', 'Semua kolom harus diisi!');
      return;
    }
    if (nip.length < 5) {
      Alert.alert('Peringatan', 'NIP minimal 5 angka!');
      return;
    }
    setLoading(true);
    try {
      const email = `guru_${nip.trim()}@foodtrayker.com`;
      const password = nip.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'guru', userCredential.user.uid), {
        nama: nama.trim(),
        nip: nip.trim(),
        role: 'guru',
        uid: userCredential.user.uid,
        createdAt: new Date().toLocaleDateString('id-ID'),
      });

      Alert.alert('Berhasil!', 'Akun guru berhasil dibuat.', [
        { text: 'OK', onPress: onGoLogin },
      ]);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Gagal Daftar', 'NIP ini sudah terdaftar.');
      } else {
        Alert.alert('Gagal Daftar', 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>👨‍🏫</Text>
            </View>
            <Text style={styles.appName}>Daftar Guru</Text>
            <Text style={styles.appSubtitle}>Buat akun baru untuk guru</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                value={nama}
                onChangeText={setNama}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NIP (Nomor Induk Pegawai)</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan NIP kamu"
                value={nip}
                onChangeText={setNip}
                keyboardType="numeric"
                maxLength={20}
              />
            </View>

            <View style={styles.nipInfo}>
              <Text style={styles.nipInfoText}>
                🔒 Password default kamu adalah NIP kamu sendiri
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.btnRegister, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#1C1C1E" />
                : <Text style={styles.btnRegisterText}>Buat Akun</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text style={styles.loginLink}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },
  inner: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#8B0000', fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#8B0000', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  appSubtitle: { fontSize: 14, color: '#FFB3B3', marginTop: 4 },
  card: {
    backgroundColor: '#2D0000', borderRadius: 20,
    padding: 24, borderWidth: 0.5, borderColor: '#5a0000',
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '600', color: '#FFB3B3',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a0000', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#FFFFFF',
    borderWidth: 0.5, borderColor: '#5a0000',
  },
  nipInfo: {
    backgroundColor: '#3D0000', borderRadius: 8,
    padding: 10, marginBottom: 20,
    borderWidth: 0.5, borderColor: '#8B0000',
  },
  nipInfoText: { fontSize: 13, color: '#FFFFFF' },
  btnRegister: {
    backgroundColor: '#8B0000', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnRegisterText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: '#FFB3B3' },
  loginLink: { fontSize: 14, fontWeight: '600', color: '#8B0000' },
});