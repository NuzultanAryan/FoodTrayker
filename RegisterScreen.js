import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Logo from './Logo';

export default function RegisterScreen({ onRegister, onGoLogin }) {
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama.trim() || !nis.trim() || !kelas.trim()) { Alert.alert('Peringatan', 'Semua kolom harus diisi!'); return; }
    if (nis.length < 5) { Alert.alert('Peringatan', 'NIS minimal 5 angka!'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, `${nis.trim()}@foodtrayker.com`, nis.trim());
      await setDoc(doc(db, 'siswa', cred.user.uid), { nama: nama.trim(), nis: nis.trim(), kelas: kelas.trim(), uid: cred.user.uid, createdAt: new Date().toLocaleDateString('id-ID') });
      Alert.alert('Berhasil!', 'Akun berhasil dibuat.', [{ text: 'OK', onPress: onGoLogin }]);
    } catch (error) {
      Alert.alert('Gagal', error.code === 'auth/email-already-in-use' ? 'NIS sudah terdaftar.' : 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.header}>
            <Logo size={80} />
            <Text style={styles.appName}>FoodTrayker</Text>
            <Text style={styles.appSubtitle}>Daftar Akun Siswa</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daftar</Text>
            <Text style={styles.cardSubtitle}>Isi data diri kamu</Text>
            {[['Nama Lengkap', nama, setNama, 'Masukkan nama lengkap', 'words', false],
              ['NIS', nis, setNis, 'Masukkan NIS', 'none', true],
              ['Kelas', kelas, setKelas, 'Contoh: 10A, 11B', 'characters', false]].map(([label, val, setter, ph, cap, numeric]) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput style={styles.input} placeholder={ph} value={val} onChangeText={setter} autoCapitalize={cap} keyboardType={numeric ? 'numeric' : 'default'} maxLength={numeric ? 20 : undefined} />
              </View>
            ))}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>🔒 Password default adalah NIS kamu</Text>
            </View>
            <TouchableOpacity style={[styles.btnRegister, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Buat Akun</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={onGoLogin}><Text style={styles.rowLink}>Masuk di sini</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  inner: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  appName: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 10 },
  appSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14, fontSize: 15, color: '#1C1C1E', borderWidth: 0.5, borderColor: '#E0E0E0' },
  infoBox: { backgroundColor: '#FFF0F0', borderRadius: 8, padding: 10, marginBottom: 20, borderWidth: 0.5, borderColor: '#8B0000' },
  infoText: { fontSize: 13, color: '#8B0000' },
  btnRegister: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  rowText: { fontSize: 14, color: '#8E8E93' },
  rowLink: { fontSize: 14, fontWeight: '600', color: '#8B0000' },
});