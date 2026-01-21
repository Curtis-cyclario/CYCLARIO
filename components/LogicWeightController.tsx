
import React, { useState, useEffect } from 'react';
import type { GateConfig, GateWeightMap } from '../types';
import { GATE_NAMES } from '../constants';
import { Tooltip } from './Tooltip';

interface LogicWeightControllerProps {
    configs: Record<number, GateConfig>;
    onUpdateConfig: (id: number, config: GateConfig) => void;
    isDisabled: boolean;
    onHoverWeight?: (key: keyof GateWeightMap | null) => void;
}

export const LogicWeightController: React.FC<LogicWeightControllerProps> = ({ configs, onUpdateConfig, isDisabled, onHoverWeight }) => {
    // Default to a valid gate ID from GATE_NAMES (usually 3, 4, 5, 6)
    // We'll use the first key available or default to 4 (Threshold)
    const initialGateId = parseInt(Object.keys(GATE_NAMES)[0] || '4');
    const [selectedGateId, setSelectedGateId] = useState<number>(initialGateId);
    
    // Ensure we have a valid config to work with, even if configs[selectedGateId] is undefined initially
    const defaultConfig: GateConfig = {
        mode: 'SYMBOLIC',
        threshold: 1,
        weights: { A:0, B:0, C:0, D:0, F:0, G:0, H:0, I:0 }
    };

    const [localConfig, setLocalConfig] = useState<GateConfig>(configs[selectedGateId] || defaultConfig);

    useEffect(() => {
        if (configs[selectedGateId]) {
            setLocalConfig(configs[selectedGateId]);
        }
    }, [selectedGateId, configs]);

    const handleWeightChange = (key: keyof GateWeightMap, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        setLocalConfig(prev => ({
            ...prev,
            weights: { ...prev.weights, [key]: numValue }
        }));
    };

    const handleThresholdChange = (value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        setLocalConfig(prev => ({ ...prev, threshold: numValue }));
    };

    const handleModeToggle = () => {
        const newMode = localConfig.mode === 'SYMBOLIC' ? 'WEIGHTED' : 'SYMBOLIC';
        setLocalConfig(prev => ({ ...prev, mode: newMode }));
    };

    const handleSave = () => {
        onUpdateConfig(selectedGateId, localConfig);
    };

    // Helper for rendering inputs
    const WeightInput = ({ label, weightKey }: { label: string, weightKey: keyof GateWeightMap }) => (
        <div 
            className="flex flex-col items-center group"
            onMouseEnter={() => onHoverWeight?.(weightKey)}
            onMouseLeave={() => onHoverWeight?.(null)}
        >
             <label className="text-[9px] text-cyan-500/70 font-mono mb-1 transition-colors group-hover:text-cyan-300">{label}</label>
             <input 
                type="number" 
                step="0.1"
                min="-5"
                max="5"
                value={localConfig.weights[weightKey]} 
                onChange={(e) => handleWeightChange(weightKey, e.target.value)}
                disabled={isDisabled || localConfig.mode === 'SYMBOLIC'}
                className={`w-12 h-8 text-center text-xs bg-slate-900 border rounded 
                    ${localConfig.mode === 'SYMBOLIC' ? 'border-slate-700 text-gray-600' : 'border-cyan-500/30 text-cyan-300 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500'}
                    transition-all duration-200 group-hover:ring-1 group-hover:ring-cyan-500/50 group-hover:bg-slate-800
                `}
             />
        </div>
    );

    return (
        <div className="component-panel p-4 rounded-lg w-full flex flex-col gap-4">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 text-center tracking-wider">
                LOGIC WEIGHT SYSTEM
            </h3>

            {/* Gate Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-xs text-cyan-400/70 tracking-widest uppercase">Target Gate</label>
                <select
                    value={selectedGateId}
                    onChange={(e) => setSelectedGateId(parseInt(e.target.value))}
                    disabled={isDisabled}
                    className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
                >
                    {Object.entries(GATE_NAMES).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </div>

            {/* Mode Switch & Description */}
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700/50">
                 <div className="text-xs text-gray-400 font-mono">
                    Mode: <span className={localConfig.mode === 'WEIGHTED' ? 'text-cyan-300' : 'text-fuchsia-400'}>{localConfig.mode}</span>
                 </div>
                 <Tooltip text="Toggle between Symbolic (Hardcoded Rules) and Weighted (Sum > Threshold) logic.">
                    <button 
                        onClick={handleModeToggle}
                        disabled={isDisabled}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-cyan-400 uppercase tracking-widest"
                    >
                        Switch
                    </button>
                 </Tooltip>
            </div>
            
            {/* Weight Grid Visualization */}
            <div className="relative p-2 bg-slate-950/50 rounded-lg border border-slate-800 flex flex-col items-center gap-2">
                 <div className="grid grid-cols-3 gap-2 p-2">
                    {/* Row 1: A, D, G */}
                    <WeightInput label="A (TL)" weightKey="A" />
                    <WeightInput label="D (T)" weightKey="D" />
                    <WeightInput label="G (TR)" weightKey="G" />
                    
                    {/* Row 2: B, Center, H */}
                    <WeightInput label="B (L)" weightKey="B" />
                    <div className="flex items-center justify-center w-12 h-12 group">
                         <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse group-hover:scale-150 transition-transform"></div>
                    </div>
                    <WeightInput label="H (R)" weightKey="H" />
                    
                    {/* Row 3: C, F, I */}
                    <WeightInput label="C (BL)" weightKey="C" />
                    <WeightInput label="F (B)" weightKey="F" />
                    <WeightInput label="I (BR)" weightKey="I" />
                 </div>
                 
                 {/* Threshold Control */}
                 <div className="w-full flex items-center justify-between px-4 pt-2 border-t border-slate-800">
                    <label className="text-xs text-cyan-400 font-mono">THRESHOLD (T)</label>
                    <input 
                        type="number" 
                        step="0.1"
                        value={localConfig.threshold}
                        onChange={(e) => handleThresholdChange(e.target.value)}
                         disabled={isDisabled || localConfig.mode === 'SYMBOLIC'}
                        className={`w-16 h-8 text-center text-sm bg-slate-900 border rounded 
                             ${localConfig.mode === 'SYMBOLIC' ? 'border-slate-700 text-gray-600' : 'border-fuchsia-500/50 text-fuchsia-300 focus:border-fuchsia-400'}
                        `}
                    />
                 </div>
            </div>

            {/* Legend / Info */}
            <div className="text-[10px] text-gray-500 font-mono space-y-1">
                <div className="flex justify-between">
                    <span>Excitatory: w &gt; 0</span>
                    <span>Inhibitory: w &lt; 0</span>
                </div>
                <div className="flex justify-between">
                    <span>Neutral: w = 0</span>
                    <span>Active: Σw·S ≥ T</span>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={isDisabled}
                className="w-full py-2 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded uppercase tracking-widest transition-all"
            >
                Apply Configuration
            </button>
        </div>
    );
};
