import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DiwaliLampProps {
  senderName: string;
  accentColor: string;
  onOpen: () => void;
}

const DiwaliSparkles = () => {
  const colors = [
    "hsl(30 90% 55%)", "hsl(45 95% 60%)", "hsl(15 85% 50%)",
    "hsl(50 90% 65%)", "hsl(0 80% 55%)", "hsl(35 90% 50%)",
    "hsl(60 85% 55%)", "hsl(20 90% 55%)", "hsl(40 95% 60%)",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => {
        const color = colors[i % colors.length];
        const angle = (i / 80) * 360;
        const radius = 150 + Math.random() * 400;
        const endX = Math.cos((angle * Math.PI) / 180) * radius;
        const endY = Math.sin((angle * Math.PI) / 180) * radius - 100;
        const size = 3 + Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: "50%", top: "45%",
              width: size, height: size,
              borderRadius: i % 2 === 0 ? "50%" : "1px",
              background: color,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: endX, y: endY + Math.random() * 150,
              scale: [0, 1.5, 0.5], opacity: [0, 1, 0],
              rotate: Math.random() * 1080,
            }}
            transition={{ duration: 2 + Math.random(), ease: "easeOut", delay: Math.random() * 0.3 }}
          />
        );
      })}
      {["🪔", "✨", "🎆", "🌟", "🎇", "💫", "🔥", "🎉"].map((emoji, i) => (
        <motion.div
          key={`emoji-${i}`}
          className="absolute text-2xl md:text-4xl"
          style={{ left: "50%", top: "45%" }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: Math.cos((i / 8) * Math.PI * 2) * (150 + Math.random() * 200),
            y: Math.sin((i / 8) * Math.PI * 2) * (150 + Math.random() * 200) - 50,
            scale: [0, 1.8, 0], opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.8, delay: 0.1 + i * 0.06, ease: "easeOut" }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

const DiwaliLamp = ({ senderName, accentColor, onOpen }: DiwaliLampProps) => {
  const [isLit, setIsLit] = useState(false);

  const handleLight = () => {
    setIsLit(true);
    setTimeout(onOpen, 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-3">
      <AnimatePresence>
        {isLit && <DiwaliSparkles />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <p className="text-lg md:text-xl text-muted-foreground font-body">
          You received a Diwali greeting from
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-gold-gradient glow-gold">
          {senderName}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground">Tap the vilakku to light it! 🪔</p>
      </motion.div>

      <motion.div
        className="relative cursor-pointer flex items-center justify-center"
        onClick={!isLit ? handleLight : undefined}
        whileHover={!isLit ? { scale: 1.05 } : {}}
        whileTap={!isLit ? { scale: 0.95 } : {}}
      >
        <motion.div
          className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center"
          animate={isLit ? { scale: [1, 1.1, 0], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Clay lamp image */}
          <img
            src="/images/clay-lamp.png"
            alt="Traditional Kerala Clay Oil Lamp for Diwali wishes"
            className="w-full h-full object-contain drop-shadow-2xl"
            width={1024}
            height={1024}
            loading="lazy"
          />

          {/* Flame effect on click */}
          {isLit && (
            <motion.div
              className="absolute"
              style={{ top: "8%", left: "46%" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Outer glow */}
              <motion.div
                className="absolute -inset-8 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsla(40, 95%, 60%, 0.7), hsla(30, 90%, 50%, 0.2), transparent)",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
              {/* Flame */}
              <motion.div
                className="w-6 h-12 md:w-8 md:h-16"
                animate={{ scaleX: [1, 0.85, 1.1, 0.9, 1], scaleY: [1, 1.15, 0.9, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: "linear-gradient(to top, hsl(25, 95%, 45%), hsl(40, 100%, 55%) 40%, hsl(50, 100%, 70%) 75%, hsla(55, 100%, 90%, 0.9))",
                    filter: "blur(1px)",
                    boxShadow: "0 0 20px hsl(40, 95%, 55%), 0 0 40px hsla(35, 90%, 50%, 0.5), 0 0 70px hsla(40, 90%, 50%, 0.2)",
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Warm glow when lit */}
          {isLit && (
            <motion.div
              className="absolute -inset-10 md:-inset-16 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(40, 90%, 55%, 0.3), hsla(30, 85%, 50%, 0.1), transparent 70%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}

          {/* Subtle pulse when not lit */}
          {!isLit && (
            <motion.div
              className="absolute -inset-4 rounded-3xl"
              style={{
                boxShadow: `0 0 30px ${accentColor}20, 0 0 60px ${accentColor}10`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
          )}

          {/* Floating sparkles before lighting */}
          {!isLit && [...Array(4)].map((_, i) => (
            <motion.div
              key={`sp-${i}`}
              className="absolute text-sm md:text-base"
              style={{ left: `${15 + i * 20}%`, top: `${5 + (i % 3) * 12}%` }}
              animate={{ y: [0, -10, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DiwaliLamp;
