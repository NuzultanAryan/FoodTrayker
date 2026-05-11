import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView, Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from './firebase';

export default function PesanScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [kelas, setKelas] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchKelasAndListen = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // Ambil nama kelas dari akun
        const snap = await getDoc(doc(db, 'kelas', uid));
        if (!snap.exists()) return;
        const namaKelas = snap.data().kelas;
        setKelas(namaKelas);

        // Listen realtime ke pesan kelas ini
        const q = query(
          collection(db, 'pesan_kelas', namaKelas, 'messages'),
          orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
          }));
          setMessages(msgs);
          setLoading(false);
          // Auto scroll ke bawah
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        return unsubscribe;
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    let unsubscribe;
    fetchKelasAndListen().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const kirimPesan = async () => {
    if (!inputText.trim()) return;
    const teks = inputText.trim();
    setInputText('');

    try {
      await addDoc(
        collection(db, 'pesan_kelas', kelas, 'messages'),
        {
          teks,
          kelas,
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          tanggal: new Date().toLocaleDateString('id-ID'),
          createdAt: serverTimestamp(),
        }
      );
    } catch (e) {
      console.error('Gagal kirim pesan:', e);
    }
  };

  const renderItem = ({ item, index }) => {
    const prevItem = messages[index - 1];
    const showDate = !prevItem || prevItem.tanggal !== item.tanggal;

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{item.tanggal}</Text>
          </View>
        )}
        <View style={styles.bubbleWrap}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{item.teks}</Text>
            <Text style={styles.bubbleTime}>{item.waktu}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{kelas?.charAt(0) || '?'}</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Kelas {kelas}</Text>
          <Text style={styles.headerSub}>Chat antar siswa</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 100 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
        keyboardVerticalOffset={120}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Belum ada pesan</Text>
            <Text style={styles.emptySubtitle}>Mulai chat dengan teman sekelasmu!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Tulis pesan..."
            placeholderTextColor="#B0B0B0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={kirimPesan}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: '#FFB3B3', marginTop: 1 },
  messageList: { padding: 14, paddingBottom: 8 },
  dateSeparator: {
    alignItems: 'center', marginVertical: 10,
  },
  dateText: {
    fontSize: 11, color: '#8E8E93',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  bubbleWrap: { marginBottom: 6, alignItems: 'flex-start' },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16, borderBottomLeftRadius: 4,
    padding: 10, maxWidth: '80%',
    borderWidth: 0.5, borderColor: '#E0E0E0',
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
  },
  bubbleText: { fontSize: 14, color: '#1C1C1E', flex: 1, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: '#B0B0B0', marginBottom: 1 },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#FFFFFF', padding: 10,
    borderTopWidth: 0.5, borderTopColor: '#E0E0E0',
    gap: 8,
  },
  input: {
    flex: 1, backgroundColor: '#F2F2F7',
    borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 9, fontSize: 14, color: '#1C1C1E',
    maxHeight: 100, borderWidth: 0.5, borderColor: '#E0E0E0',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#8B0000',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#E0E0E0' },
  sendIcon: { color: '#FFFFFF', fontSize: 16, marginLeft: 2 },
});