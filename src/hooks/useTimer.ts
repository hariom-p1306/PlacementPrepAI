import { useState, useEffect } from "react";

export const useTimer = (initialTime: number = 30) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const resetTimer = () => {
    setTimeLeft(initialTime);
  };

  return { timeLeft, resetTimer }; 
};