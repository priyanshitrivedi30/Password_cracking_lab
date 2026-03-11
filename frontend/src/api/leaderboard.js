import api from "./api";

/**
 * Fetch top leaderboard entries.
 * Used for the "All" tab on the Leaderboard page.
 *
 * @param {number} limit - number of entries to fetch (default 10)
 */
export const getLeaderboard = async (limit = 10) => {
  const res = await api.get("/leaderboard/top", { params: { limit } });
  // Backend returns { leaderboard: [...], total_shown: N }
  return Array.isArray(res.data) ? res.data : (res.data?.leaderboard || []);
};

/**
 * Fetch leaderboard filtered by difficulty.
 * Used for Beginner / Intermediate / Advanced tabs on Leaderboard page.
 *
 * @param {string} difficulty - beginner | intermediate | advanced
 * @param {number} limit
 */
export const getLeaderboardByDifficulty = async (difficulty, limit = 10) => {
  const res = await api.get("/leaderboard/top", { params: { difficulty, limit } });
  return Array.isArray(res.data) ? res.data : (res.data?.leaderboard || []);
};

/**
 * Fetch the current user's rank and score on the leaderboard.
 * Used to highlight the user's own row on the Leaderboard page.
 *
 * Returns: { rank, score, username, total_entries }
 */
export const getMyLeaderboardPosition = async () => {
  const res = await api.get("/leaderboard/my-position");
  return res.data;
};