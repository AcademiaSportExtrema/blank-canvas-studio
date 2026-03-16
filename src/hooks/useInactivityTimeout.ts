import { useEffect, useRef, useState, useCallback } from "react";

const WARNING_TIME = 25 * 60 * 1000; // 25 minutes
const LOGOUT_TIME = 30 * 60 * 1000;  // 30 minutes
const DEBOUNCE_MS = 1000;

export function useInactivityTimeout(isAuthenticated: boolean) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 min

  const warningTimer = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>();
  const countdownInterval = useRef<ReturnType<typeof setInterval>>();
  const lastActivity = useRef(Date.now());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const clearAllTimers = useCallback(() => {
    clearTimeout(warningTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdownInterval.current);
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    lastActivity.current = Date.now();

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(300);
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_TIME);

    logoutTimer.current = setTimeout(() => {
      setShowWarning(false);
      // Signal logout needed
      window.dispatchEvent(new CustomEvent("inactivity-logout"));
    }, LOGOUT_TIME);
  }, [clearAllTimers]);

  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;
    startTimers();
  }, [isAuthenticated, startTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    startTimers();

    const handleActivity = () => {
      if (showWarning) return; // Don't reset during warning
      if (debounceRef.current) return;
      debounceRef.current = setTimeout(() => {
        debounceRef.current = undefined;
      }, DEBOUNCE_MS);
      startTimers();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      clearAllTimers();
      clearTimeout(debounceRef.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [isAuthenticated, showWarning, startTimers, clearAllTimers]);

  return { showWarning, secondsLeft, resetTimers };
}
