import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface CelebrationOverlayProps {
  show: boolean;
  message: string;
  onDone: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  color: string;
  size: number;
}

const colors = ['#3b82f6', '#14b8a6', '#f59e0b', '#f43f5e', '#10b981', '#8b5cf6'];

export function CelebrationOverlay({ show, message, onDone }: CelebrationOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60;
      const speed = 3 + Math.random() * 4;
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
      });
    }
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15,
          rotation: p.rotation + 5,
        })),
      );
    }, 30);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onDone();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
              opacity: Math.max(0, 1 - (p.y - 50) / 60),
            }}
          />
        ))}
      </div>

      {/* Message card */}
      <div className="relative animate-[celebration-pop_0.5s_ease-out] rounded-3xl border border-white/20 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">{message}</h2>
        <p className="mt-2 text-sm text-slate-500">Keep going — the next stage awaits.</p>
      </div>
    </div>
  );
}
