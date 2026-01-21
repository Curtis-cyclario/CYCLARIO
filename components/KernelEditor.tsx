
import React, { useState } from 'react';
import { GATE_NAMES, GATE_BG_COLORS, GATE_DESCRIPTIONS, KERNEL_PRESETS, GATE_TYPES } from '../constants';
import { Tooltip } from './Tooltip';

interface KernelEditorProps {
    coreGrid: number[][];
    onGridChange: (i: number, j: number, value: number) => void;
    onReset: () => void;
    isDisabled: boolean;
    onLoadPreset: (grid: number[][]) => void;
}

export const KernelEditor: React.FC<KernelEditorProps> = ({ coreGrid, onGridChange, onReset, isDisabled, onLoadPreset }) => {
    const [error, setError] = useState<string | null>(null);
    const currentPresetName = KERNEL_PRESETS.find(p => JSON.stringify(p.grid) === JSON.stringify(coreGrid))?.name || 'custom';

    const cycleGate = (i: number, j: number, current: number, reverse: boolean = false) => {
        if (isDisabled) return;
        const currentIndex = GATE_TYPES.indexOf(current);
        let nextIndex;
        if (reverse) {
            nextIndex = (currentIndex - 1 + GATE_TYPES.length) % GATE_TYPES.length;
        } else {
            nextIndex = (currentIndex + 1) % GATE_TYPES.length;
        }
        onGridChange(i, j, GATE_TYPES[nextIndex]);
    };
    
    return (
        <div className="component-panel p-4 rounded-lg w-full flex flex-col gap-4">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 text-center tracking-wider text-glow">
                KERNEL EDITOR
            </h3>

            <div className="flex flex-col gap-2">
                <Tooltip text="Load a predefined kernel configuration.">
                    <label htmlFor="kernel-preset-select" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">
                        Load Preset
                    </label>
                </Tooltip>
                <div className="relative">
                    <select
                        id="kernel-preset-select"
                        value={currentPresetName}
                        onChange={(e) => {
                            setError(null);
                            const selectedPreset = KERNEL_PRESETS.find(p => p.name === e.target.value);
                            if (selectedPreset) {
                                // Input Validation: Ensure 3x3 grid of numbers
                                const isValid = Array.isArray(selectedPreset.grid) && 
                                              selectedPreset.grid.length === 3 && 
                                              selectedPreset.grid.every(row => Array.isArray(row) && row.length === 3 && row.every(cell => typeof cell === 'number'));

                                if (isValid) {
                                    const newGrid = selectedPreset.grid.map(row => [...row]);
                                    onLoadPreset(newGrid);
                                } else {
                                    setError(`Invalid preset data for "${selectedPreset.name}". Reverting to Standard.`);
                                    // Default to Standard
                                    const standard = KERNEL_PRESETS.find(p => p.name === 'Standard');
                                    if (standard) {
                                         onLoadPreset(standard.grid.map(row => [...row]));
                                    }
                                }
                            }
                        }}
                        disabled={isDisabled}
                        className="bg-slate-900/80 border border-slate-600 text-cyan-300 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors duration-200 disabled:opacity-50 appearance-none font-mono"
                        aria-label="Load kernel preset"
                    >
                        {currentPresetName === 'custom' && <option value="custom" disabled>CUSTOM CONFIGURATION</option>}
                        {KERNEL_PRESETS.map(preset => (
                            <option key={preset.name} value={preset.name}>{preset.name.toUpperCase()}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-cyan-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-2 rounded bg-red-900/30 border border-red-500/50 text-red-200 text-xs font-mono animate-pulse">
                    ! ERROR: {error}
                </div>
            )}

            <div className={`grid grid-cols-3 gap-2 sm:gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-800/50 ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                {coreGrid.map((row, i) =>
                    row.map((cell, j) => {
                        const bgColorClass = GATE_BG_COLORS[cell as keyof typeof GATE_BG_COLORS] || 'bg-slate-800 border-slate-600';
                        const gateName = GATE_NAMES[cell as keyof typeof GATE_NAMES].split(' ')[0]; // Short name
                        
                        return (
                            <Tooltip key={`${i}-${j}`} text={`${GATE_DESCRIPTIONS[cell as keyof typeof GATE_DESCRIPTIONS]} (Click to Cycle)`}>
                                <button
                                    onClick={() => cycleGate(i, j, cell)}
                                    onContextMenu={(e) => { e.preventDefault(); cycleGate(i, j, cell, true); }}
                                    disabled={isDisabled}
                                    className={`
                                        relative aspect-square w-full rounded-md border-2 transition-all duration-200 group
                                        flex items-center justify-center overflow-hidden
                                        ${bgColorClass}
                                        ${isDisabled ? '' : 'hover:scale-[1.02] hover:shadow-[0_0_10px_currentColor] active:scale-95 cursor-pointer'}
                                    `}
                                    aria-label={`Kernel cell ${i},${j}: ${gateName}`}
                                >
                                    <span className="font-orbitron text-[10px] sm:text-xs font-bold text-white drop-shadow-md z-10">
                                        {gateName}
                                    </span>
                                    {/* Scanline effect overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none" />
                                </button>
                            </Tooltip>
                        )
                    })
                )}
            </div>
            
             <Tooltip text="Resets the kernel to its default configuration (Standard preset)">
                <button
                    onClick={() => {
                        setError(null);
                        onReset();
                    }}
                    disabled={isDisabled}
                    className="w-full relative px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-0 text-gray-300 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-500 uppercase tracking-widest"
                >
                    Reset Kernel
                </button>
            </Tooltip>
        </div>
    );
};
