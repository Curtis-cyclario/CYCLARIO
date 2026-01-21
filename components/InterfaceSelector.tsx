
import React from 'react';
import type { SimulationMode } from '../types';
import { Tooltip } from './Tooltip';

interface InterfaceSelectorProps {
  currentMode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
}

interface ModeDef {
  id: SimulationMode;
  name: string;
  description: string;
  category: string;
  sub: string;
}

const masterModes: ModeDef[] = [
  { 
    id: 'CONSUMER_LEVEL', 
    name: 'CONSUMER', 
    description: 'Consumer Level: Aesthetic quality and macro-level project visualization. Beauty as a spec.', 
    category: 'FLAGSHIP',
    sub: 'OPERATIONAL BEAUTY'
  },
  { 
    id: 'PHYSXZARD_CORE', 
    name: 'PHYSXZARD', 
    description: 'PhysXzard Level: Mandatory DSL compliance, phase conservation, and reversibility proofs.', 
    category: 'DSL COMPLIANCE',
    sub: 'OPERATIONAL DISCIPLINE'
  },
  { 
    id: 'CINEMATIC_STACK', 
    name: 'MMPITCH', 
    description: 'Cinematic Stack: 3D Volumetric visualization for foundational IP pitch.', 
    category: 'MMPITCH',
    sub: 'VOLUMETRIC STACK'
  },
];

const SelectorButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  mode: ModeDef;
}> = ({ isActive, onClick, mode }) => (
  <Tooltip text={mode.description}>
    <button
      onClick={onClick}
      className={`relative flex-1 p-4 text-center transition-all duration-500 transform rounded-lg border-2 overflow-hidden group
        ${isActive 
          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02] z-10' 
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'}`}
    >
      <div className={`text-[8px] uppercase tracking-[0.25em] mb-1 font-mono transition-colors duration-300
        ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{mode.category}</div>
      
      <h4 className={`font-orbitron font-bold tracking-[0.1em] text-sm lg:text-base transition-all duration-300
        ${isActive ? 'text-white text-glow translate-y-0' : 'text-slate-400 group-hover:text-slate-300'}`}>
        {mode.name}
      </h4>
      
      <div className={`text-[7px] mt-1 font-mono tracking-widest transition-all duration-500
        ${isActive ? 'opacity-100 text-cyan-500/80 translate-y-0' : 'opacity-0 translate-y-1'}`}>
        {mode.sub}
      </div>

      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      )}
    </button>
  </Tooltip>
);

export const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-4 fade-in-component">
        <div className="component-panel p-2 rounded-xl flex gap-2 items-stretch justify-center bg-slate-900/40 backdrop-blur-md border-slate-800/50">
            {masterModes.map(mode => (
                <SelectorButton
                    key={mode.id}
                    isActive={currentMode === mode.id}
                    onClick={() => onModeChange(mode.id)}
                    mode={mode}
                />
            ))}
        </div>
    </div>
  );
};
