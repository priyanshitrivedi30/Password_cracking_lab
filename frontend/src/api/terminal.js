import api from "./api";

/**
 * Execute a command inside the lab terminal container.
 *
 * ✅ Command sent in request BODY not query params —
 *    commands contain special chars (--show, spaces, =) that break URL encoding
 *
 * @param {number} sessionId
 * @param {string} command - e.g. "john --wordlist=rockyou.txt hash.txt"
 *
 * @returns {{
 *   output: string,           // terminal output to display
 *   mode: string,             // guided | hints | free
 *   currentStep: number|null, // beginner: current step number (1-4)
 *   hintsUsed: number|null,   // intermediate: hints used so far
 *   hintsRemaining: number|null, // intermediate: hints left before penalty
 *   currentScore: number|null,   // intermediate: live score with deductions
 * }}
 */
export const execTerminal = async (sessionId, command) => {
  try {
    // ✅ Both session_id and command in request body — no URL encoding issues
    const res = await api.post("/terminal/exec", {
      session_id: sessionId,
      command: command,
    });

    return {
      output: res.data.output,
      mode: res.data.mode,                          // guided | hints | free
      currentStep: res.data.current_step ?? null,   // beginner step tracking
      hintsUsed: res.data.hints_used ?? null,        // intermediate hint tracking
      hintsRemaining: res.data.hints_remaining ?? null,
      currentScore: res.data.current_score ?? null,  // live score display
    };
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Terminal execution failed. Please try again.");
  }
};