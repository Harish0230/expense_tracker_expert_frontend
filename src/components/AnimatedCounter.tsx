import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  formatter,
  duration = 0.8,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  formatter?: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + diff * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const out = formatter ? formatter(Math.round(display)) : Math.round(display).toLocaleString("en-IN");
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {prefix}{out}{suffix}
    </motion.span>
  );
}
