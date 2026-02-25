import api from "./api";

// Fetch tools + concepts overview
export const getOverview = async () => {
  const res = await api.get("/overview");
  return res.data;
};