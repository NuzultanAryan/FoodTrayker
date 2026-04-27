//INBOX
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const dataChat = [
  { id: '1', nama: 'Ali Hasan', inisial: 'AH', pesan: 'Baki sudah saya kembalikan ya...', waktu: '14.02', online: true, belumDibaca: 1 },
  { id: '2', nama: 'Ryan', inisial: 'RY', pesan: 'Posisi baki di mana?', waktu: '09.45', online: false, belumDibaca: 0 },
];

const ChatList = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.subHeader}>KOTAK MASUK</Text>
        <Text style={styles.header}>Pesan</Text>
      </View>
      <FlatList
        data={dataChat}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} activeOpacity={0.7}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.inisial}>{item.inisial}</Text>
              </View>
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.topRow}>
                <Text style={[styles.nama, item.belumDibaca > 0 && styles.namaBold]}>
                  {item.nama}
                </Text>
                <Text style={styles.waktu}>{item.waktu}</Text>
              </View>
              <Text style={styles.previewPesan} numberOfLines={1}>
                {item.pesan}
              </Text>
            </View>
            {item.belumDibaca > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.belumDibaca}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  subHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BBBBBB',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  header: { fontSize: 26, fontWeight: '700', color: '#111' },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginLeft: 86, // aligns with text, not avatar
  },

  avatarWrapper: { position: 'relative', marginRight: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inisial: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: -0.5 },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#fff',
  },

  chatInfo: { flex: 1, minWidth: 0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  nama: { fontSize: 15, fontWeight: '600', color: '#555' },
  namaBold: { fontWeight: '700', color: '#111' },
  previewPesan: { fontSize: 13.5, color: '#AAA', flexShrink: 1 },
  waktu: { fontSize: 11, color: '#BBBBBB', marginLeft: 8 },

  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
});

export default ChatList;

//CHAT ROOM
import { useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  TextInput
} from 'react-native';

const pesanAwal = [
  { id: '1', teks: 'Halo, baki nomor 10 sudah selesai?', dari: 'terima', waktu: '09.44' },
  { id: '2', teks: 'Sudah, baru saja saya letakkan.', dari: 'kirim', waktu: '09.45' },
];

const ChatRoom = () => {
  const [pesan, setPesan] = useState('');
  const [daftarPesan, setDaftarPesan] = useState(pesanAwal);
  const scrollRef = useRef(null);

  const kirimPesan = () => {
    if (!pesan.trim()) return;
    const baru = {
      id: Date.now().toString(),
      teks: pesan.trim(),
      dari: 'kirim',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setDaftarPesan((prev) => [...prev, baru]);
    setPesan('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.inisial}>AH</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.namaHeader}>Ali Hasan</Text>
          <Text style={styles.statusOnline}>Online</Text>
        </View>
      </View>

      {/* Date chip */}
      <View style={styles.dateChipWrapper}>
        <View style={styles.dateChip}>
          <Text style={styles.dateChipText}>Hari ini</Text>
        </View>
      </View>

      {/* Chat area */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {daftarPesan.map((item) => (
          <View
            key={item.id}
            style={item.dari === 'terima' ? styles.rowTerima : styles.rowKirim}
          >
            {item.dari === 'terima' && (
              <View style={styles.avatarKecil}>
                <Text style={styles.inisialKecil}>AH</Text>
              </View>
            )}
            <View style={{ maxWidth: '78%' }}>
              <View style={item.dari === 'terima' ? styles.bubbleTerima : styles.bubbleKirim}>
                <Text style={item.dari === 'terima' ? styles.teksTerimа : styles.teksKirim}>
                  {item.teks}
                </Text>
              </View>
              <View style={item.dari === 'kirim' ? styles.metaKirim : styles.metaTerima}>
                <Text style={styles.waktuTeks}>{item.waktu}</Text>
                {item.dari === 'kirim' && (
                  <Text style={styles.centang}>✓✓</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tulis pesan..."
          placeholderTextColor="#BBBBBB"
          value={pesan}
          onChangeText={setPesan}
          onSubmitEditing={kirimPesan}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.tombolKirim} onPress={kirimPesan} activeOpacity={0.8}>
          <Text style={styles.ikonKirim}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inisial: { color: '#fff', fontSize: 14, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  namaHeader: { fontSize: 15, fontWeight: '700', color: '#111' },
  statusOnline: { fontSize: 11, color: '#22C55E', fontWeight: '500' },

  // Date chip
  dateChipWrapper: { alignItems: 'center', paddingVertical: 14 },
  dateChip: { backgroundColor: '#E8E8E8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  dateChipText: { fontSize: 11, color: '#999', fontWeight: '500' },

  // Chat area
  chatArea: { flex: 1, paddingHorizontal: 16 },

  // Rows
  rowTerima: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  rowKirim: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },

  // Small avatar for incoming
  avatarKecil: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inisialKecil: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Bubbles
  bubbleTerima: {
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleKirim: {
    backgroundColor: '#8B0000',
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  teksTerimа: { fontSize: 14, color: '#222', lineHeight: 20 },
  teksKirim: { fontSize: 14, color: '#fff', lineHeight: 20 },

  // Timestamps
  metaTerima: { flexDirection: 'row', marginTop: 4, marginLeft: 4 },
  metaKirim: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4, marginRight: 4 },
  waktuTeks: { fontSize: 10, color: '#BBBBBB' },
  centang: { fontSize: 10, color: '#8B0000' },

  // Input bar
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 42,
    fontSize: 14,
    color: '#111',
  },
  tombolKirim: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ikonKirim: { color: '#fff', fontSize: 16 },
});

export default ChatRoom;