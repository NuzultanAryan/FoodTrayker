import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from './Logo';

export default function RoleScreen({ onSelectRole, onAdminRegister, onAdminLogin }) {
  const [selectedRole, setSelectedRole] = useState('siswa');
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setTapCount(0);
      onAdminRegister();
    } else if (newCount === 3) {
      // 3 tap = login admin
      setTimeout(() => {
        if (tapCount + 1 === 3) {
          setTapCount(0);
          onAdminLogin();
        }
      }, 800);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
          <Logo size={100} />
        </TouchableOpacity>
        <Text style={styles.appName}>FoodTrayker</Text>
        <Text style={styles.appSubtitle}>Sistem Pengambilan MBG</Text>
        {tapCount > 0 && (
          <Text style={styles.tapHint}>
            {tapCount === 3 ? ' Buka login admin...' : `${5 - tapCount} tap lagi untuk daftar admin`}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Selamat Datang!</Text>
        <Text style={styles.cardSubtitle}>Silakan pilih role yang sesuai</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'siswa' && styles.roleCardActive]}
            onPress={() => setSelectedRole('siswa')}
          >
            <Text style={styles.roleEmoji}>🧑🏻‍🎓</Text>
            <Text style={[styles.roleLabel, selectedRole === 'siswa' && styles.roleLabelActive]}>Siswa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'guru' && styles.roleCardActive]}
            onPress={() => setSelectedRole('guru')}
          >
            <Text style={styles.roleEmoji}>🧑🏻‍🏫</Text>
            <Text style={[styles.roleLabel, selectedRole === 'guru' && styles.roleLabelActive]}>Guru</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btnLanjut} onPress={() => onSelectRole(selectedRole)}>
          <Text style={styles.btnLanjutText}>Lanjut</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 26, fontWeight: '700', color: '#1C1C1E', marginTop: 12 },
  appSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  tapHint: { fontSize: 12, color: '#8B0000', marginTop: 8, fontStyle: 'italic' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 0.5, borderColor: '#E0E0E0' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleCard: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 16, borderWidth: 1.5, borderColor: '#E0E0E0', backgroundColor: '#F9F9F9' },
  roleCardActive: { borderColor: '#8B0000', backgroundColor: '#FFF0F0' },
  roleEmoji: { fontSize: 40, marginBottom: 10 },
  roleLabel: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  roleLabelActive: { color: '#8B0000' },
  btnLanjut: { backgroundColor: '#8B0000', borderRadius: 14, padding: 16, alignItems: 'center' },
  btnLanjutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});