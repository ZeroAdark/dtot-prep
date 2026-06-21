"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts down to an absolute deadline (ISO string or Date). Because the target
 * is an absolute timestamp persisted server-side, the remaining time is correct
 * across refreshes, tab closes, and navigation — it is recomputed from the
 * wall clock, never from an in-memory counter. Fires `onExpire` once when the
 * deadline is first crossed.
 */
export function useCountdown(
  deadline: string | Date | null | undefined,
  onExpire?: () => void,
  active = true,
) {
  const target = deadline ? new Date(deadline).getTime() : null;
  const compute = () =>
    target == null ? null : Math.max(0, Math.round((target - Date.now()) / 1000));

  const [remaining, setRemaining] = useState<number | null>(compute);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    firedRef.current = false;
    if (target == null || !active) {
      setRemaining(target == null ? null : compute());
      return;
    }
    const tick = () => {
      const r = Math.max(0, Math.round((target - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active]);

  return remaining;
}
