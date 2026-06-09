import { motion } from "motion/react";

export function AmbientScene() {
  return (
    <div aria-hidden className="ambient-scene">
      <motion.div
        animate={{ x: [0, 90, -30, 0], y: [0, 40, 110, 0], scale: [1, 1.15, 0.92, 1] }}
        className="aurora aurora-violet"
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        animate={{ x: [0, -120, -40, 0], y: [0, 70, -20, 0], scale: [1, 0.9, 1.2, 1] }}
        className="aurora aurora-cyan"
        transition={{ duration: 27, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        animate={{ x: [0, 70, -80, 0], y: [0, -100, -30, 0], scale: [1, 1.25, 0.95, 1] }}
        className="aurora aurora-pink"
        transition={{ duration: 24, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="ambient-grid" />
      <div className="ambient-vignette" />
      <div className="noise-layer" />
    </div>
  );
}
