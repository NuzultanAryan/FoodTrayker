import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
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

export default function LoginAdminScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password harus diisi!');
      return;
    }
    setLoading(true);
    try {
      const email = `admin_${username.trim().toLowerCase()}@foodtrayker.com`;
      await signInWithEmailAndPassword(auth, email, password);
      onLogin('admin');
    } catch (error) {
      Alert.alert('Gagal Login', 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Logo size={90} />
          <Text style={styles.appName}>FoodTrayker</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Login Admin</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk Admin</Text>
          <Text style={styles.cardSubtitle}>Akses khusus administrator</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan username admin"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 24 },
  backText: { fontSize: 15, color: '#8B0000', fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 28 },
  appName: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 10 },
  adminBadge: {
    backgroundColor: '#FFF0F0', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 14,
    borderWidth: 0.5, borderColor: '#8B0000', marginTop: 6,
  },
  adminBadgeText: { fontSize: 13, color: '#8B0000', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14, fontSize: 15, color: '#1C1C1E', borderWidth: 0.5, borderColor: '#E0E0E0' },
  btnLogin: { backgroundColor: '#8B0000', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnLoginText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});