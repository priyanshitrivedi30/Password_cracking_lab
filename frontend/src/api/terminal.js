import api from "./api";

/**
 * Execute a command inside the lab terminal
 * @param {number} sessionId
 * @param {string} command
 */
export const execTerminal = async (sessionId, command) => {
  try {
    const res = await api.post("/terminal/exec", null, {
      params: {
        session_id: sessionId,
        command: command,
      },
    });

    return {
      output: res.data.output,
      mode: res.data.mode,              // guided | free
      currentStep: res.data.current_step ?? null, // ✅ for beginner flow
    };
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Terminal execution failed");
  }
};