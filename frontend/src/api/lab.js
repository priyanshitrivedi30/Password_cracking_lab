import api from "./api";

/**
 * Start a new lab session.
 * Consent must be accepted on the Consent Form page before calling this.
 *
 * @param {string} difficulty - beginner | intermediate | advanced
 * @param {boolean} consentGiven - must be true or backend rejects with 400
 */
export const startLab = async (difficulty, consentGiven = false) => {
  const res = await api.post("/lab/start", {
    difficulty,
    consent_given: consentGiven,
  });
  return res.data;
};

/**
 * Force-expire any stuck running sessions for the current user.
 * Call this when user gets "already have a running session" error.
 */
export const resetLabSession = async () => {
  const res = await api.post("/lab/reset");
  return res.data;
};

/**
 * Poll lab session status — used for live timer countdown and score updates.
 * Call this every second on the Lab page to keep timer in sync.
 *
 * Returns: { session_id, status, time_remaining, current_score,
 *            hints_used, current_step, expires_at }
 *
 * @param {number} sessionId
 */
export const getLabStatus = async (sessionId) => {
  const res = await api.get(`/lab/status/${sessionId}`);
  return res.data;
};

/**
 * Advance to the next guided step (Beginner mode only).
 * Called when user completes the current step in the guided flow.
 *
 * @param {number} sessionId
 */
export const advanceLabStep = async (sessionId) => {
  const res = await api.post("/lab/step", null, {
    params: { session_id: sessionId },
  });
  return res.data;
};

/**
 * Request a hint for the current lab session.
 * Only works for INTERMEDIATE (hints) mode.
 * After 3rd hint, each additional hint deducts 5 points.
 *
 * @param {number} sessionId
 */
export const getLabHint = async (sessionId) => {
  const res = await api.post("/lab/hint", null, {
    params: { session_id: sessionId },
  });
  return res.data;
};