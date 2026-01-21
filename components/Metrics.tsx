
import React from 'react';
import type { MetricsData, SimulationMode } from '../types';
import { Sparkline } from './Sparkline';
import { Tooltip } from './Tooltip';

interface MetricsProps {
  metrics: MetricsData;
  history: MetricsData[];
  mode: SimulationMode;
}

const MetricItem: React.FC<{title: string; value: string; history: number[]; color: string; tooltip: string}> = ({ title, value, history, color, tooltip }) => (
    <Tooltip text={tooltip} className="w-full">
        <div className="flex flex-col items-center justify-start text-center h-full p-3 bg-slate-900/40 rounded border border-slate-700/30 transition-all hover:bg-slate-800/60 backdrop-blur-sm group relative overflow-hidden">
          <div className="flex justify-between w-full items-baseline mb-1 px-1">
              <p className="text-[9px] text-cyan-400/60 tracking-widest uppercase font-mono">{title}</p>
              <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] animate-pulse" style={{ backgroundColor: color }}></div>
          </div>
          
          <p className="font-orbitron text-xl lg:text-2xl text-cyan-300 tracking-wider mb-2 transition-all duration-300 z-10" style={{textShadow: `0 0 10px ${color}60`}}>
            {value}
          </p>
          
          <div className="mt-auto w-full h-8 opacity-60 group-hover:opacity-100 transition-opacity relative">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
             <Sparkline data={history} color={color} width={120} height={32} />
          </div>
        </div>
    </Tooltip>
);

export const Metrics: React.FC<MetricsProps> = ({ metrics, history, mode }) => {
  const isPhysXzard = mode === 'PHYSXZARD_CORE';

  return (
    <div className="component-panel w-full p-4 rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-3 relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>
      
      {isPhysXzard ? (
        <>
          <MetricItem 
            title="Reversibility"
            value={(metrics?.reversibility ?? 0).toFixed(4)}
            history={history.map(h => h.reversibility ?? 0).slice(-60)}
            color="#ec4899"
            tooltip="DSL Proof: det(Unitary(g)) approx 1. Measures structural integrity of the logic."
          />
          <MetricItem
            title="Phase Cont"
            value={(metrics?.phase_continuity ?? 0).toFixed(4)}
            history={history.map(h => h.phase_continuity ?? 0).slice(-60)}
            color="#22d3ee"
            tooltip="Invariants: Phase/Intensity Conservation across the Toroidal Field."
          />
          <MetricItem
            title="Drift Cal"
            value={(metrics?.calibration_drift ?? 0).toFixed(4)}
            history={history.map(h => h.calibration_drift ?? 0).slice(-60)}
            color="#f59e0b"
            tooltip="Calibration recording for DSL edge case refinement."
          />
          <MetricItem
            title="Core Latency"
            value={`${(metrics?.latency ?? 0).toFixed(1)}ms`}
            history={history.map(h => h.latency ?? 0).slice(-60)}
            color="#10b981"
            tooltip="Profile Latency: Engine execution time."
          />
        </>
      ) : (
        <>
          <MetricItem 
            title="Protection (Δs)"
            value={(metrics?.delta_swastika ?? 0).toFixed(2)}
            history={history.map(h => h.delta_swastika ?? 0).slice(-60)}
            color="#f97316"
            tooltip="Swastika Protection Functional: Symbolic watermark entropy."
          />
          <MetricItem
            title="Field Invar"
            value={(metrics?.invariance ?? 1).toFixed(3)}
            history={history.map(h => h.invariance ?? 1).slice(-60)}
            color="#00ffcc"
            tooltip="Macro Field Invariance: Operational project stability."
          />
          <MetricItem
            title="Sync Delta"
            value={(metrics?.sync_delta ?? 0).toFixed(1)}
            history={history.map(h => h.sync_delta ?? 0).slice(-60)}
            color="#38bdf8"
            tooltip="Coherence variance between dual-rail channels."
          />
          <MetricItem
            title="Predict Err"
            value={(metrics?.prediction_error ?? 0).toFixed(1)}
            history={history.map(h => h.prediction_error ?? 0).slice(-60)}
            color="#ff5500"
            tooltip="Aimbot error rate in the Juxtaposition field."
          />
        </>
      )}
    </div>
  );
};
