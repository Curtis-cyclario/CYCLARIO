
import React, { useRef, useEffect } from 'react';
import type { Lattice3D, SimulationMode, PhotonicBus, GateWeightMap, GateConfig } from '../types';
import { SIZE, COLORS, REFRACTORY_COLORS, DEPTH, WEIGHT_OFFSETS } from '../constants';
import { InteractiveLayer } from './InteractiveLayer';

interface CruciformLatticeProps {
  lattice: Lattice3D;
  buses: PhotonicBus[];
  kernelFace: number[][];
  onCellClick: (i: number, j: number, k: number) => void;
  showBorders: boolean;
  mode: SimulationMode;
  hoveredWeightKey?: keyof GateWeightMap | null;
  gateConfigs?: Record<number, GateConfig>;
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

export const CruciformLattice: React.FC<CruciformLatticeProps> = ({ lattice, buses, kernelFace, onCellClick, showBorders, mode, hoveredWeightKey, gateConfigs }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(0);
  const hoveredCellRef = useRef<{i: number, j: number} | null>(null);

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1.5. Grid Overlay
    ctx.save();
    // Standard Cell Grid (Faint Cyan)
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'; 
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= SIZE; i++) {
        const pos = i * CELL_SIZE;
        // Vertical lines
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, CANVAS_SIZE);
        // Horizontal lines
        ctx.moveTo(0, pos);
        ctx.lineTo(CANVAS_SIZE, pos);
    }
    ctx.stroke();

    // Matrice (3x3 Block) Mirroring Boundaries
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; // Brighter, distinct cyan for sectors
    ctx.lineWidth = 1.0;
    ctx.setLineDash([2, 2]); // Dashed for "interference" look
    ctx.beginPath();
    const SECTOR_SIZE = CELL_SIZE * 3;
    for (let i = 1; i < 3; i++) {
        const pos = i * SECTOR_SIZE;
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, CANVAS_SIZE);
        ctx.moveTo(0, pos);
        ctx.lineTo(CANVAS_SIZE, pos);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset
    ctx.restore();

    // 2. Core Logic Stacking
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const x = j * CELL_SIZE, y = i * CELL_SIZE;
        
        let activity = 0;
        // Only count '1' (Active) for the glowing trail
        for (let k = 0; k < DEPTH; k++) {
             if (lattice[i][j][k] === 1) activity += (1 - k / DEPTH);
        }

        const currentState = lattice[i][j][0];
        const gateType = kernelFace[i][j];

        if (currentState >= 2) {
             // Refractory Rendering (Values 2, 3)
             ctx.fillStyle = REFRACTORY_COLORS[gateType] || '#334155';
             ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
             
             // Cooldown Hash Mark
             ctx.strokeStyle = 'rgba(0,0,0,0.5)';
             ctx.lineWidth = 1;
             ctx.beginPath();
             ctx.moveTo(x + 2, y + 2); 
             ctx.lineTo(x + CELL_SIZE - 2, y + CELL_SIZE - 2);
             ctx.stroke();

        } else if (activity > 0) {
            // Active / Trail Rendering
            ctx.globalAlpha = 0.1 + (activity / DEPTH) * 0.7;
            ctx.fillStyle = COLORS[gateType] || '#334155';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Bloom (only if current state is strictly Active)
            if (currentState === 1) {
                ctx.shadowBlur = 10 * (activity / DEPTH);
                ctx.shadowColor = COLORS[gateType];
                ctx.strokeRect(x+2, y+2, CELL_SIZE-4, CELL_SIZE-4);
                ctx.shadowBlur = 0;
            }
        }
        ctx.globalAlpha = 1.0;

        if (showBorders) {
          ctx.globalAlpha = 0.05; ctx.strokeStyle = '#0af';
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // 2.5 Heatmap / Receptive Field Visualization
    const h = hoveredCellRef.current;
    if (h && gateConfigs) {
        const gateType = kernelFace[h.i][h.j];
        const config = gateConfigs[gateType];
        
        if (config) {
            // If hovering a specific weight in controller, only show that one
            if (hoveredWeightKey) {
                 const offset = WEIGHT_OFFSETS[hoveredWeightKey];
                 if (offset) {
                     const ni = (h.i + offset.di + SIZE) % SIZE;
                     const nj = (h.j + offset.dj + SIZE) % SIZE;
                     const nx = nj * CELL_SIZE;
                     const ny = ni * CELL_SIZE;

                     ctx.save();
                     ctx.strokeStyle = '#d946ef'; // Fuchsia
                     ctx.lineWidth = 2;
                     ctx.strokeRect(nx, ny, CELL_SIZE, CELL_SIZE);
                     
                     // Draw connecting line
                     ctx.beginPath();
                     ctx.moveTo((h.j + 0.5) * CELL_SIZE, (h.i + 0.5) * CELL_SIZE);
                     ctx.lineTo((nj + 0.5) * CELL_SIZE, (ni + 0.5) * CELL_SIZE);
                     ctx.setLineDash([4, 4]);
                     ctx.stroke();
                     ctx.restore();
                 }
            } else {
                // Show full kernel heatmap
                Object.entries(WEIGHT_OFFSETS).forEach(([key, offset]) => {
                     const weight = config.weights[key as keyof GateWeightMap] || 0;
                     if (Math.abs(weight) < 0.01) return;

                     const ni = (h.i + offset.di + SIZE) % SIZE;
                     const nj = (h.j + offset.dj + SIZE) % SIZE;
                     const nx = nj * CELL_SIZE;
                     const ny = ni * CELL_SIZE;

                     const isPositive = weight > 0;
                     const opacity = Math.min(0.6, Math.max(0.15, Math.abs(weight) * 0.3));

                     ctx.save();
                     if (isPositive) {
                         // Warm (Orange/Red)
                         ctx.fillStyle = `rgba(251, 146, 60, ${opacity})`;
                         ctx.strokeStyle = `rgba(251, 146, 60, ${opacity + 0.2})`;
                     } else {
                         // Cool (Cyan)
                         ctx.fillStyle = `rgba(6, 182, 212, ${opacity})`;
                         ctx.strokeStyle = `rgba(6, 182, 212, ${opacity + 0.2})`;
                     }
                     
                     ctx.fillRect(nx + 4, ny + 4, CELL_SIZE - 8, CELL_SIZE - 8);
                     ctx.lineWidth = 1;
                     ctx.strokeRect(nx + 4, ny + 4, CELL_SIZE - 8, CELL_SIZE - 8);
                     ctx.restore();
                });
            }
        }
    }

    // 3. IP Protection Functional (Chaotic Watermark / Swastika Map σ)
    if (mode === 'PHYSXZARD_CORE') {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 15]);
      
      // Draw σ Map visual representation
      const center = CANVAS_SIZE / 2;
      const armLength = CANVAS_SIZE * 0.4;
      
      ctx.translate(center, center);
      for(let i=0; i<4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -armLength);
          ctx.lineTo(armLength * 0.5, -armLength);
          ctx.stroke();
          ctx.rotate(Math.PI / 2);
      }
      ctx.restore();
    }

    // 4. Photonic Interconnects
    buses.forEach(bus => {
      ctx.globalAlpha = bus.intensity * 0.8;
      ctx.strokeStyle = bus.color;
      ctx.shadowBlur = 8; ctx.shadowColor = bus.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bus.start.x, bus.start.y); ctx.lineTo(bus.end.x, bus.end.y); ctx.stroke();
    });
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1.0;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [lattice, buses, kernelFace, showBorders, mode, hoveredWeightKey, gateConfigs]);

  return (
    <div className="relative mx-auto block component-panel rounded-lg overflow-hidden shadow-2xl lattice-container group">
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
      <InteractiveLayer 
        onCellClick={onCellClick} 
        onCellHover={(i, j) => { hoveredCellRef.current = (i !== null && j !== null) ? {i, j} : null; }}
        canvasSize={CANVAS_SIZE} 
        hoveredWeightKey={hoveredWeightKey}
        gateConfigs={gateConfigs}
        kernelFace={kernelFace}
      />
      <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/90 rounded text-[10px] text-cyan-400 font-mono tracking-widest border border-cyan-500/30 backdrop-blur-md pointer-events-none z-20">
        {mode}
      </div>
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/50 rounded text-[9px] text-cyan-600/50 font-mono tracking-widest pointer-events-none z-20">
         kΩ: 00101101
      </div>
    </div>
  );
};
