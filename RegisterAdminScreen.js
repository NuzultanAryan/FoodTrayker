import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator, Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from './firebase';
import Logo from './Logo';

const KODE_RAHASIA = 'PROJEKKKK2026';

export default function RegisterAdminScreen({ onBack }) {
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [kodeRahasia, setKodeRahasia] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmPassword, setKonfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKode, setShowKode] = useState(false);

  const handleRegister = async () => {
    if (!nama.trim() || !username.trim() || !kodeRahasia.trim() || !password.trim() || !konfirmPassword.trim()) {
      Alert.alert('Peringatan', 'Semua kolom harus diisi!');
      return;
    }
    if (kodeRahasia !== KODE_RAHASIA) {
      Alert.alert('Gagal', 'Kode rahasia salah!');
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
      const email = `admin_${username.trim().toLowerCase()}@foodtrayker.com`;
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'admin', cred.user.uid), {
        nama: nama.trim(),
        username: username.trim(),
        uid: cred.user.uid,
        role: 'admin',
        createdAt: new Date().toLocaleDateString('id-ID'),
      });

      Alert.alert('Berhasil!', `Akun admin "${nama.trim()}" berhasil dibuat.`, [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Gagal', 'Username ini sudah terdaftar sebagai admin.');
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
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Logo size={80} />
            <Text style={styles.appName}>FoodTrayker</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Registrasi Admin</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Buat Akun Admin</Text>
            <Text style={styles.cardSubtitle}>Masukkan kode rahasia untuk mendaftar</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Admin</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama"
                value={nama}
                onChangeText={setNama}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: admin_sekolah"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kode Rahasia</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Masukkan kode rahasia"
                  value={kodeRahasia}
                  onChangeText={setKodeRahasia}
                  secureTextEntry={!showKode}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowKode(!showKode)}
                >
                  <Text style={styles.eyeText}>{showKode ? 'Sembunyikan' : 'Tunjukkan'}</Text>
                </TouchableOpacity>
              </View>
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

            <TouchableOpacity
              style={[styles.btnRegister, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.btnText}>Buat Akun Admin</Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  inner: { padding: 24, flexGrow: 1 },
  backBtn: { marginBottom: 16, top: 16,},
  backText: { fontSize: 15, color: '#8B0000', fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 24 },
  appName: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginTop: 10 },
  adminBadge: {
    backgroundColor: '#FFF0F0', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 14,
    borderWidth: 0.5, borderColor: '#8B0000', marginTop: 6,
  },
  adminBadgeText: { fontSize: 13, color: '#8B0000', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#8E8E93', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14, fontSize: 15, color: '#1C1C1E', borderWidth: 0.5, borderColor: '#E0E0E0' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },
  btnRegister: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});