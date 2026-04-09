import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebase';
import Logo from './Logo';

export default function RegisterScreen({ onRegister, onGoLogin }) {
  const [kelas, setKelas] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmPassword, setKonfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!kelas.trim() || !password.trim() || !konfirmPassword.trim()) {
      Alert.alert('Peringatan', 'Semua kolom harus diisi!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Peringatan', 'Password minimal 6 karakter!');
      return;
    }
    if (password !== konfirmPassword) {
      Alert.alert('Peringatan', 'Password tidak sama!');
      return;
    }
    setLoading(true);
    try {
      const email = `kelas_${kelas.trim().toLowerCase()}@foodtrayker.com`;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'kelas', cred.user.uid), {
        kelas: kelas.trim().toUpperCase(),
        uid: cred.user.uid,
        createdAt: new Date().toLocaleDateString('id-ID'),
        role: 'siswa',
      });
      Alert.alert('Berhasil!', `Akun kelas ${kelas.toUpperCase()} berhasil dibuat.`, [
        { text: 'OK', onPress: onGoLogin },
      ]);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Gagal', `Kelas ${kelas.toUpperCase()} sudah terdaftar.`);
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan. Coba lagi.');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.header}>
            <Logo size={90} />
            <Text style={styles.appName}>FoodTrayker</Text>
            <Text style={styles.appSubtitle}>Daftar Akun Kelas</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daftar</Text>
            <Text style={styles.cardSubtitle}>Buat akun untuk kelasmu</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kelas</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 10A, 11B, 12C"
                value={kelas}
                onChangeText={setKelas}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Ulangi password"
                value={konfirmPassword}
                onChangeText={setKonfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>ℹ️ 1 akun digunakan untuk seluruh siswa dalam kelas</Text>
            </View>

            <TouchableOpacity
              style={[styles.btnRegister, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Buat Akun</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text style={styles.rowLink}>Masuk di sini</Text>
            </TouchableOpacity>
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