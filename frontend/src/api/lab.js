import api from "./api";

/**
 * Start a new lab session
 * @param {string} difficulty - beginner | intermediate | advanced
 */
export const startLab = async (difficulty) => {
  const res = await api.post("/lab/start", {
    difficulty,
  });
  return res.data;
};

/**
 * Request a hint for the current lab session
 * (Only works for INTERMEDIATE mode as per backend rules)
 * @param {number} sessionId
 */
export const getLabHint = async (sessionId) => {
  const res = await api.post("/lab/hint", null, {
    params: {
      session_id: sessionId,
    },
  });
  return res.data;
};