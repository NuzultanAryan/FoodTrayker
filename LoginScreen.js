import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import Logo from './Logo';

export default function LoginScreen({ onLogin, onGoRegister, onBack }) {
  const [nis, setNis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nis.trim()) { Alert.alert('Peringatan', 'NIS harus diisi!'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, `${nis.trim()}@foodtrayker.com`, nis.trim());
      onLogin();
    } catch (error) {
      Alert.alert('Gagal Login', 'NIS tidak ditemukan atau salah.');
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
          <Text style={styles.cardSubtitle}>Gunakan NIS kamu untuk login</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NIS</Text>
            <TextInput style={styles.input} placeholder="Masukkan NIS kamu" value={nis} onChangeText={setNis} keyboardType="numeric" maxLength={20} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💡 Password default sama dengan NIS kamu</Text>
          </View>
          <TouchableOpacity style={[styles.btnLogin, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
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
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14, fontSize: 15, color: '#1C1C1E', borderWidth: 0.5, borderColor: '#E0E0E0' },
  infoBox: { backgroundColor: '#FFF0F0', borderRadius: 8, padding: 10, marginBottom: 20, borderWidth: 0.5, borderColor: '#8B0000' },
  infoText: { fontSize: 13, color: '#8B0000' },
  btnLogin: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnLoginText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  rowText: { fontSize: 14, color: '#8E8E93' },
  rowLink: { fontSize: 14, fontWeight: '600', color: '#8B0000' },
});