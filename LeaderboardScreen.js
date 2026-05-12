// LeaderboardScreen.js
// Tampilan Leaderboard mingguan - Food Tray Tracker

import auth from '@react-native-firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { getMyRank, getWeeklyLeaderboard } from './leaderboardService';
import { formatDuration, getBadge, getSpeedLabel, getWeekEnd, getWeekStart } from './Leaderboardutils.js';

// ─── Format tanggal ke "6 Jan - 12 Jan 2025" ──────────────────────────────────
const formatDateRange = () => {
  const start = getWeekStart();
  const end = getWeekEnd();
  const opts = { day: 'numeric', month: 'short' };
  const startStr = start.toLocaleDateString('id-ID', opts);
  const endStr = end.toLocaleDateString('id-ID', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr}`;
};

// ─── Komponen Avatar ───────────────────────────────────────────────────────────
const Avatar = ({ uri, name, size = 44 }) => {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
};

// ─── Komponen Item Top 3 (Podium) ─────────────────────────────────────────────
const PodiumCard = ({ item, isMe }) => {
  const badge = getBadge(item.rank);
  const heights = { 1: 130, 2: 100, 3: 80 };
  const podiumHeight = heights[item.rank] || 70;

  return (
    <View style={[styles.podiumItem, isMe && styles.podiumItemMe]}>
      <Text style={styles.podiumEmoji}>{badge.emoji}</Text>
      <Avatar uri={item.userPhoto} name={item.userName} size={52} />
      {isMe && <View style={styles.meBadge}><Text style={styles.meBadgeText}>Saya</Text></View>}
      <Text style={styles.podiumName} numberOfLines={1}>{item.userName}</Text>
      <Text style={styles.podiumPoints}>{item.totalPoints} pts</Text>
      <View style={[styles.podiumBase, { height: podiumHeight, backgroundColor: badge.color }]}>
        <Text style={styles.podiumRank}>{item.rank}</Text>
      </View>
    </View>
  );
};

// ─── Komponen Item List (rank 4+) ─────────────────────────────────────────────
const LeaderboardItem = ({ item, isMe }) => {
  const badge = getBadge(item.rank);

  return (
    <View style={[styles.listItem, isMe && styles.listItemMe]}>
      <Text style={[styles.listRankEmoji]}>{badge.emoji}</Text>
      <Avatar uri={item.userPhoto} name={item.userName} size={40} />
      <View style={styles.listInfo}>
        <View style={styles.listNameRow}>
          <Text style={styles.listName} numberOfLines={1}>{item.userName}</Text>
          {isMe && <View style={styles.meBadge}><Text style={styles.meBadgeText}>Saya</Text></View>}
        </View>
        <Text style={styles.listSpeed}>{getSpeedLabel(item.avgDuration)}</Text>
      </View>
      <View style={styles.listRight}>
        <Text style={styles.listPoints}>{item.totalPoints}</Text>
        <Text style={styles.listPointsLabel}>pts</Text>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentUserId = auth().currentUser?.uid;
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadData = useCallback(async () => {
    try {
      const [board, rank] = await Promise.all([
        getWeeklyLeaderboard(20),
        getMyRank(),
      ]);
      setLeaderboard(board);
      setMyRank(rank);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Gagal memuat leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Urutkan podium: posisi 2 - 1 - 3 supaya rank 1 di tengah
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  // ─── Header ───────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Minggu Ini</Text>
        <Text style={styles.headerDate}>{formatDateRange()}</Text>
        <Text style={styles.headerDesc}>
          Poin dihitung dari kecepatan ambil & kembalikan food tray.{'\n'}
          Lebih cepat = lebih banyak poin! Reset setiap Senin.
        </Text>
      </View>

      {/* Card Rank Saya */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>📍 Posisi Kamu Minggu Ini</Text>
          <View style={styles.myRankRow}>
            <Text style={styles.myRankNumber}>#{myRank.rank}</Text>
            <View style={styles.myRankDetail}>
              <Text style={styles.myRankPoints}>{myRank.totalPoints} poin</Text>
              <Text style={styles.myRankInfo}>
                {myRank.transactionCount}x transaksi · Rata-rata {formatDuration(myRank.avgDuration)}
              </Text>
              <Text style={styles.myRankSpeed}>{getSpeedLabel(myRank.avgDuration)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <View style={styles.podiumContainer}>
          {podiumOrder.map((item) => (
            <PodiumCard
              key={item.userId}
              item={item}
              isMe={item.userId === currentUserId}
            />
          ))}
        </View>
      )}

      {rest.length > 0 && (
        <Text style={styles.restTitle}>Peringkat Lainnya</Text>
      )}
    </View>
  );

  // ─── Empty State ──────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>Belum Ada Data</Text>
      <Text style={styles.emptyDesc}>
        Mulai ambil dan kembalikan food tray untuk masuk leaderboard minggu ini!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Memuat Leaderboard...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeaderboardItem item={item} isMe={item.userId === currentUserId} />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={leaderboard.length === 0 ? <EmptyState /> : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={['#FFD700']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B9BB4',
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C0C0C0',
    fontWeight: '600',
    marginTop: 2,
  },
  headerDate: {
    fontSize: 13,
    color: '#8B9BB4',
    marginTop: 4,
  },
  headerDesc: {
    fontSize: 12,
    color: '#8B9BB4',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },

  // My Rank Card
  myRankCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1E1E35',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  myRankLabel: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  myRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myRankNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFD700',
    marginRight: 16,
  },
  myRankDetail: {
    flex: 1,
  },
  myRankPoints: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  myRankInfo: {
    fontSize: 12,
    color: '#8B9BB4',
    marginTop: 2,
  },
  myRankSpeed: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: 24,
    gap: 8,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumItemMe: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 16,
    padding: 4,
  },
  podiumEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 6,
    maxWidth: 90,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 6,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  podiumRank: {
    fontSize: 22,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.4)',
  },

  // Avatar
  avatar: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarFallback: {
    backgroundColor: '#2D2D4E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3D3D6E',
  },
  avatarText: {
    color: '#8B9BB4',
    fontWeight: '700',
  },

  // Me Badge
  meBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  meBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F0F1A',
  },

  // List Items (rank 4+)
  restTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B9BB4',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  listItemMe: {
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#1E1E35',
  },
  listRankEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  listSpeed: {
    fontSize: 11,
    color: '#8B9BB4',
    marginTop: 2,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listPoints: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
  },
  listPointsLabel: {
    fontSize: 10,
    color: '#8B9BB4',
    fontWeight: '600',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8B9BB4',
    textAlign: 'center',
    lineHeight: 20,
  },
});