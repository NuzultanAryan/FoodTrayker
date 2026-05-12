// leaderboardService.js
// Semua operasi Firebase Firestore untuk Leaderboard

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { calculatePoints, getWeekEnd, getWeekStart } from './Leaderboardutils.js';

const COLLECTION = 'leaderboard';
const TRANSACTIONS_COLLECTION = 'trayTransactions';

/**
 * Catat transaksi ambil tray (saat user mengambil tray)
 * Simpan timestamp mulai ke Firestore
 * @returns {string} transactionId
 */
export const startTrayTransaction = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error('User belum login');

  const doc = await firestore().collection(TRANSACTIONS_COLLECTION).add({
    userId: user.uid,
    userName: user.displayName || 'Pengguna',
    userPhoto: user.photoURL || null,
    startTime: firestore.FieldValue.serverTimestamp(),
    endTime: null,
    durationSeconds: null,
    points: null,
    weekStart: getWeekStart().toISOString(),
    status: 'ongoing', // ongoing | completed
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return doc.id;
};

/**
 * Catat transaksi kembalikan tray (saat user mengembalikan tray)
 * Hitung durasi & poin, lalu update Firestore
 * @param {string} transactionId - ID dari startTrayTransaction()
 */
export const completeTrayTransaction = async (transactionId) => {
  const user = auth().currentUser;
  if (!user) throw new Error('User belum login');

  const transRef = firestore().collection(TRANSACTIONS_COLLECTION).doc(transactionId);
  const transDoc = await transRef.get();

  if (!transDoc.exists) throw new Error('Transaksi tidak ditemukan');

  const data = transDoc.data();
  const startTime = data.startTime?.toDate();
  const endTime = new Date();

  if (!startTime) throw new Error('Waktu mulai tidak valid');

  const durationSeconds = Math.round((endTime - startTime) / 1000);
  const points = calculatePoints(durationSeconds);

  // Update transaksi
  await transRef.update({
    endTime: firestore.FieldValue.serverTimestamp(),
    durationSeconds,
    points,
    status: 'completed',
  });

  // Update leaderboard minggu ini
  const weekKey = getWeekStart().toISOString().split('T')[0]; // contoh: "2025-01-06"
  const leaderboardRef = firestore()
    .collection(COLLECTION)
    .doc(`${weekKey}_${user.uid}`);

  const leaderboardDoc = await leaderboardRef.get();

  if (leaderboardDoc.exists) {
    const existing = leaderboardDoc.data();
    const newTotal = existing.totalPoints + points;
    const newCount = existing.transactionCount + 1;
    const newAvgDuration = Math.round(
      (existing.avgDuration * existing.transactionCount + durationSeconds) / newCount
    );

    await leaderboardRef.update({
      totalPoints: newTotal,
      transactionCount: newCount,
      avgDuration: newAvgDuration,
      lastActivity: firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await leaderboardRef.set({
      userId: user.uid,
      userName: user.displayName || 'Pengguna',
      userPhoto: user.photoURL || null,
      totalPoints: points,
      transactionCount: 1,
      avgDuration: durationSeconds,
      weekKey,
      weekStart: getWeekStart().toISOString(),
      weekEnd: getWeekEnd().toISOString(),
      lastActivity: firestore.FieldValue.serverTimestamp(),
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  return { durationSeconds, points };
};

/**
 * Ambil data leaderboard minggu ini, diurutkan dari poin terbanyak
 * @param {number} limit - jumlah user yang ditampilkan (default 20)
 * @returns {Array} list user dengan poin
 */
export const getWeeklyLeaderboard = async (limit = 20) => {
  const weekKey = getWeekStart().toISOString().split('T')[0];

  const snapshot = await firestore()
    .collection(COLLECTION)
    .where('weekKey', '==', weekKey)
    .orderBy('totalPoints', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc, index) => ({
    rank: index + 1,
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Ambil posisi/rank user yang sedang login di leaderboard minggu ini
 * @returns {object|null} data user + rank, atau null jika belum ada aktivitas
 */
export const getMyRank = async () => {
  const user = auth().currentUser;
  if (!user) return null;

  const weekKey = getWeekStart().toISOString().split('T')[0];

  // Ambil semua user yang poinnya lebih tinggi dari user ini
  const myDoc = await firestore()
    .collection(COLLECTION)
    .doc(`${weekKey}_${user.uid}`)
    .get();

  if (!myDoc.exists) return null;

  const myData = myDoc.data();

  // Hitung berapa user yang poinnya lebih banyak
  const aboveSnapshot = await firestore()
    .collection(COLLECTION)
    .where('weekKey', '==', weekKey)
    .where('totalPoints', '>', myData.totalPoints)
    .get();

  const rank = aboveSnapshot.size + 1;

  return { rank, ...myData };
};