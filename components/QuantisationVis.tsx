import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface QuantisationVisProps {
  metricsHistory: MetricsData[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const PARTICLE_COUNT = 100;
const MAX_DELTA_FOR_VIS = 40; // Normalize delta for visual effect

export const QuantisationVis: React.FC<QuantisationVisProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const resetParticle = (p: Particle) => {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        p.life = p.maxLife = 100 + Math.random() * 100;
        return p;
    };
    
    if (particlesRef.current.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particlesRef.current.push(resetParticle({} as Particle));
        }
    }

    const render = () => {
        ctx.clearRect(0, 0, W, H);
        
        const lastMetric = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0, energy: 0, latency: 0, thermalLoad: 0 };
        const chaos = Math.min(1, lastMetric.delta_swastika / MAX_DELTA_FOR_VIS);
        const energy = lastMetric.energy;
        
        particlesRef.current.forEach(p => {
            const angle = (Math.cos(p.x / W * Math.PI * 2) + Math.sin(p.y / H * Math.PI * 2)) * (1 + chaos * 2);
            p.vx = Math.cos(angle) * (1 + energy * 1.5);
            p.vy = Math.sin(angle) * (1 + energy * 1.5);
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.life <= 0) {
                resetParticle(p);
            }
            
            const opacity = p.life / p.maxLife;
            ctx.fillStyle = `rgba(0, 255, 204, ${opacity * 0.7})`;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1 + chaos * 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // FIX: The animation loop was broken. Pass the render function to requestAnimationFrame.
        animationFrameId.current = requestAnimationFrame(render);
    };

    // FIX: The animation loop was not being started correctly. Pass the render function to requestAnimationFrame.
    animationFrameId.current = requestAnimationFrame(render);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="max-w-full max-h-full"
            aria-label="Quadratic Quantisation: An abstract visualization of the automaton's macro-dynamics."
        />
    </div>
  );
};