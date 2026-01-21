
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface PhaseScopeProps {
  metricsHistory: MetricsData[];
}

const CANVAS_SIZE = 270;
const HISTORY_LENGTH = 150; 
const MAX_PREDICT_ERROR = 200; // Normalization for Aimbot error
const MAX_SYNC_DELTA = 150;    // Normalization for Juxtaposition sync

const getInvarianceColor = (invariance: number, alpha: number = 1): string => {
    const error = Math.max(0, Math.min(1, 1 - invariance));
    let r, g, b;
    if (error < 0.5) { 
        const t = error * 2;
        r = 0 + (255 - 0) * t; g = 255; b = 204 + (0 - 204) * t;
    } else { 
        const t = (error - 0.5) * 2;
        r = 255; g = 255 + (85 - 255) * t; b = 0;
    }
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

const MetricDisplay: React.FC<{ title: string; value: string; history: number[]; color: string; }> = ({ title, value, history, color }) => {
    const sparklineRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = sparklineRef.current;
        if (!canvas || history.length < 2) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const validHistory = history.map(h => Number.isFinite(h) ? h : 0);
        if (validHistory.length === 0) return;

        const maxVal = Math.max(...validHistory, 0.001);
        const minVal = Math.min(...validHistory);
        const range = (maxVal - minVal) < 0.001 ? 1 : (maxVal - minVal);

        const points = validHistory.map((d, i) => ({
            x: (i / (validHistory.length - 1)) * width,
            y: height - ((d - minVal) / range) * (height - 2),
        }));

        if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return;

        try {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, `${color}40`);
            gradient.addColorStop(1, `${color}00`);
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.stroke();
        } catch (e) {
            console.warn("Canvas gradient error", e);
        }

    }, [history, color]);

    return (
        <div className="bg-slate-900/40 p-2 rounded-md border border-slate-800/50">
            <div className="flex justify-between items-baseline">
                <h4 className="text-[10px] text-cyan-400/60 tracking-widest uppercase">{title}</h4>
                <span className="font-orbitron text-base text-glow" style={{color}}>{value}</span>
            </div>
            <canvas ref={sparklineRef} width={100} height={20} className="mt-1 w-full" />
        </div>
    );
};


export const PhaseScope: React.FC<PhaseScopeProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number>();

  const latestMetrics = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : { 
      prediction_error: 0, 
      latency: 0, 
      invariance: 1.0, 
      sync_delta: 0 
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid
      ctx.strokeStyle = "rgba(0, 170, 255, 0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 10; i++) {
        const pos = (i / 10) * CANVAS_SIZE;
        ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(CANVAS_SIZE, pos); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, CANVAS_SIZE); ctx.stroke();
      }

      // Draw Axis Labels
      ctx.fillStyle = "rgba(0, 170, 255, 0.4)";
      ctx.font = '9px "Roboto Mono"';
      ctx.textAlign = 'center';
      ctx.fillText("Predict Error", CANVAS_SIZE / 2, CANVAS_SIZE - 5);
      ctx.save();
      ctx.translate(10, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Sync Delta", 0, 0);
      ctx.restore();

      const pointsData = metricsHistory.slice(-HISTORY_LENGTH);
      if (pointsData.length < 2) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }
      
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 1; i < pointsData.length; i++) {
          const prevPoint = pointsData[i-1];
          const currentPoint = pointsData[i];
          
          const x1 = Math.min(CANVAS_SIZE, Math.max(0, (prevPoint.prediction_error / MAX_PREDICT_ERROR) * CANVAS_SIZE));
          const x2 = Math.min(CANVAS_SIZE, Math.max(0, (currentPoint.prediction_error / MAX_PREDICT_ERROR) * CANVAS_SIZE));
          
          const y1 = CANVAS_SIZE - Math.min(CANVAS_SIZE, Math.max(0, (prevPoint.sync_delta / MAX_SYNC_DELTA) * CANVAS_SIZE));
          const y2 = CANVAS_SIZE - Math.min(CANVAS_SIZE, Math.max(0, (currentPoint.sync_delta / MAX_SYNC_DELTA) * CANVAS_SIZE));
          
          const alpha = i / pointsData.length; 
          
          if (Number.isFinite(x1) && Number.isFinite(y1) && Number.isFinite(x2) && Number.isFinite(y2)) {
             try {
                const segmentGradient = ctx.createLinearGradient(x1, y1, x2, y2);
                segmentGradient.addColorStop(0, getInvarianceColor(prevPoint.invariance, alpha * 0.7));
                segmentGradient.addColorStop(1, getInvarianceColor(currentPoint.invariance, alpha * 0.7));
                ctx.strokeStyle = segmentGradient;
                
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
             } catch (e) { }
          }
      }
      
      const lastPoint = pointsData[pointsData.length - 1];
      const headX = Math.min(CANVAS_SIZE, Math.max(0, (lastPoint.prediction_error / MAX_PREDICT_ERROR) * CANVAS_SIZE));
      const headY = CANVAS_SIZE - Math.min(CANVAS_SIZE, Math.max(0, (lastPoint.sync_delta / MAX_SYNC_DELTA) * CANVAS_SIZE));

      if (Number.isFinite(headX) && Number.isFinite(headY)) {
        ctx.beginPath(); ctx.arc(headX, headY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = getInvarianceColor(lastPoint.invariance, 1);
        ctx.shadowColor = getInvarianceColor(lastPoint.invariance, 1);
        ctx.shadowBlur = 8; ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };
    animationFrameId.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [metricsHistory]);

  const SPARKLINE_HISTORY = 40;

  return (
    <div className="component-panel p-4 rounded-lg w-full">
        <h3 className="text-sm font-orbitron font-bold text-cyan-300 mb-1 text-center tracking-widest uppercase">
            Aimbot Telemetry
        </h3>
        <p className="text-center text-[10px] text-cyan-500/60 mb-3">Sync vs. Accuracy Mapping</p>
        <div className="relative scanlines rounded-md overflow-hidden bg-slate-950/80">
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="mx-auto block"
                aria-label="Aimbot telemetry phase scope"
            />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
            <MetricDisplay 
                title="Predict Err"
                value={(latestMetrics.prediction_error ?? 0).toFixed(1)}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.prediction_error ?? 0)}
                color="#ff5500"
            />
            <MetricDisplay 
                title="Sync Delta"
                value={(latestMetrics.sync_delta ?? 0).toFixed(1)}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.sync_delta ?? 0)}
                color="#38bdf8"
            />
             <MetricDisplay 
                title="Latency"
                value={Math.round(latestMetrics.latency ?? 0).toString()}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.latency ?? 0)}
                color="#00ffcc"
            />
             <MetricDisplay 
                title="Invariance"
                value={(latestMetrics.invariance ?? 1).toFixed(3)}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.invariance ?? 1)}
                color="#f97316"
            />
        </div>
    </div>
  );
};
