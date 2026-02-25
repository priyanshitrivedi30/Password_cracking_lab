import { useEffect, useState } from "react";

export default function Timer({ duration = 600, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      style={{
        padding: "12px",
        background: "#0f172a",
        color: "#00bfff",
        borderRadius: "8px",
        width: "160px",
        border: "1px solid #00bfff",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      ⏳ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
