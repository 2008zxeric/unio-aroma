import { useEffect, useRef } from 'react';

/**
 * FloatingParticles — 浮动粒子背景
 * 灵感来源：flower/Veldara (xuanxuan-prompts)
 * 极低性能开销的 Canvas 2D 粒子动画，作 Hero 背景微动感
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface FloatingParticlesProps {
  /** 粒子颜色，默认 '255,255,255'（白色） */
  color?: string;
  /** 粒子密度：每 N px² 一个粒子（越小越密），默认 18000 */
  density?: number;
  /** 最大粒子尺寸（px），默认 2 */
  maxSize?: number;
  /** 最大透明度（0~1），默认 0.5 */
  maxOpacity?: number;
  /** 移动速度系数，默认 0.3 */
  speed?: number;
}

export default function FloatingParticles({
  color = '255,255,255',
  density = 18000,
  maxSize = 2,
  maxOpacity = 0.5,
  speed = 0.3,
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      const count = Math.floor(
        (canvas!.width * canvas!.height) / density
      );
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * maxSize + 0.3,
          opacity: Math.random() * maxOpacity + maxOpacity * 0.3,
        });
      }
      particlesRef.current = particles;
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        // 边界环绕
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},${p.opacity})`;
        ctx!.fill();
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [color, density, maxSize, maxOpacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ zIndex: 5 }}
    />
  );
}
