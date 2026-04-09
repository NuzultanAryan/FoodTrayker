import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { auth } from './firebase';
import Logo from './Logo';

export default function LoginScreen({ onLogin, onGoRegister, onBack }) {
  const [kelas, setKelas] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!kelas.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Kelas dan password harus diisi!');
      return;
    }
    setLoading(true);
    try {
      const email = `kelas_${kelas.trim().toLowerCase()}@foodtrayker.com`;
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        Alert.alert('Gagal Login', `Kelas ${kelas.toUpperCase()} belum terdaftar.`);
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Gagal Login', 'Password salah.');
      } else {
        Alert.alert('Gagal Login', 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
        )}
        <View style={styles.header}>
          <Logo size={90} />
          <Text style={styles.appName}>FoodTrayker</Text>
          <Text style={styles.appSubtitle}>Login Siswa</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk</Text>
          <Text style={styles.cardSubtitle}>Masuk menggunakan akun kelas</Text>

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
              placeholder="Masukkan password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btnLogin, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnLoginText}>Masuk</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={onGoRegister}>
            <Text style={styles.rowLink}>Daftar di sini</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#8B0000', fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 28 },
  appName: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 10 },
  appSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14, fontSize: 15, color: '#1C1C1E', borderWidth: 0.5, borderColor: '#E0E0E0' },
  btnLogin: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnLoginText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  rowText: { fontSize: 14, color: '#8E8E93' },
  rowLink: { fontSize: 14, fontWeight: '600', color: '#8B0000' },
});