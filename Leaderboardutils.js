// leaderboardUtils.js
// Logika perhitungan poin berdasarkan kecepatan ambil & kembalikan food tray

/**
 * SISTEM POIN:
 * - Baseline waktu: 5 menit (300 detik) = 10 poin
 * - Lebih cepat dari baseline → poin bonus
 * - Lebih lambat dari baseline → poin berkurang
 * - Minimum poin per transaksi: 1 poin
 * - Maksimum poin per transaksi: 25 poin
 *
 * Formula:
 * poin = clamp(round(300 / durasi_detik * 10), 1, 25)
 */

export const BASELINE_SECONDS = 300; // 5 menit
export const BASE_POINTS = 10;
export const MAX_POINTS = 25;
export const MIN_POINTS = 1;

/**
 * Hitung poin berdasarkan durasi (detik)
 * @param {number} durationSeconds - durasi dari ambil sampai kembalikan tray (detik)
 * @returns {number} poin yang didapat
 */
export const calculatePoints = (durationSeconds) => {
  if (!durationSeconds || durationSeconds <= 0) return MIN_POINTS;

  const rawPoints = Math.round((BASELINE_SECONDS / durationSeconds) * BASE_POINTS);
  return Math.max(MIN_POINTS, Math.min(MAX_POINTS, rawPoints));
};

/**
 * Ambil tanggal mulai minggu ini (Senin 00:00:00)
 * @returns {Date}
 */
export const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Minggu, 1=Senin, ..., 6=Sabtu
  const diff = day === 0 ? -6 : 1 - day; // Hitung jarak ke Senin
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Ambil tanggal akhir minggu ini (Minggu 23:59:59)
 * @returns {Date}
 */
export const getWeekEnd = () => {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Format durasi menjadi string yang mudah dibaca
 * @param {number} seconds
 * @returns {string} contoh: "2m 30s"
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

/**
 * Tentukan badge berdasarkan rank
 * @param {number} rank
 * @returns {object} { emoji, label, color }
 */
export const getBadge = (rank) => {
  switch (rank) {
    case 1:
      return { emoji: '🥇', label: 'Juara 1', color: '#FFD700' };
    case 2:
      return { emoji: '🥈', label: 'Juara 2', color: '#C0C0C0' };
    case 3:
      return { emoji: '🥉', label: 'Juara 3', color: '#CD7F32' };
    default:
      return { emoji: '🍽️', label: `#${rank}`, color: '#8B9BB4' };
  }
};

/**
 * Tentukan label kecepatan berdasarkan rata-rata durasi
 * @param {number} avgSeconds
 * @returns {string}
 */
export const getSpeedLabel = (avgSeconds) => {
  if (!avgSeconds) return '';
  if (avgSeconds < 120) return '⚡ Super Cepat';
  if (avgSeconds < 240) return '🚀 Cepat';
  if (avgSeconds < 360) return '👍 Normal';
  return '🐢 Perlu Ditingkatkan';
};