import api from "./api";

/**
 * Fetch tools + concepts overview cards.
 * Used on the Lab Overview page (11 cards).
 */
export const getOverview = async () => {
  const res = await api.get("/overview");
  return res.data;
};

/**
 * Fetch difficulty level configurations.
 * Used on the Difficulty Selection page to render the 3 difficulty cards.
 *
 * Returns array of: { id, mode, algorithm, points, timer_seconds,
 *                     hints_enabled, max_hints, expected_tool, ... }
 */
export const getDifficulties = async () => {
  const res = await api.get("/difficulty");
  // Backend returns { levels: [...] } — extract the array
  return res.data?.levels || res.data || [];
};