import api from "./api";

// Fetch top leaderboard players
export const getLeaderboard = async (limit = 10) => {
  const res = await api.get("/leaderboard/top", {
    params: { limit },
  });
  return res.data;
};