
import React from 'react';
import type { GlobalSettings } from '../types';
import { Tooltip } from './Tooltip';

interface GlobalSettingsPanelProps {
    settings: GlobalSettings;
    onSettingsChange: (setting: keyof GlobalSettings, value: number | boolean) => void;
    isDisabled: boolean;
    mode: string;
}

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ settings, onSettingsChange, isDisabled, mode }) => {
    const isRoutingMode = mode === 'CONSUMER_ROUTING';

    return (
        <div className="component-panel p-4 rounded-lg w-full">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-4 text-center tracking-wider">
                GLOBAL SETTINGS
            </h3>
            <div className={`flex flex-col gap-4 transition-opacity ${isDisabled ? 'opacity-50' : ''}`}>
                
                <div className="flex flex-col gap-2">
                    <Tooltip text="Number of previous simulation states that influence the next state. Higher values increase complexity.">
                        <label htmlFor="recurrence-depth" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Recurrence Depth</label>
                    </Tooltip>
                    <select 
                        id="recurrence-depth" 
                        value={settings.recurrenceDepth}
                        onChange={(e) => onSettingsChange('recurrenceDepth', parseInt(e.target.value, 10))}
                        disabled={isDisabled}
                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200 disabled:opacity-50"
                    >
                        <option value="1">1 (Standard)</option>
                        <option value="2">2 (Deep)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <Tooltip text="Controls the spawn rate of particles visualizing edge communication.">
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="particle-density" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Particle Density</label>
                            <span className="text-sm font-orbitron text-cyan-300">{settings.particleDensity.toFixed(2)}</span>
                        </div>
                    </Tooltip>
                    <input 
                        id="particle-density" 
                        type="range" 
                        min="0" max="0.2" step="0.01" 
                        value={settings.particleDensity}
                        onChange={(e) => onSettingsChange('particleDensity', parseFloat(e.target.value))}
                        disabled={isDisabled}
                        aria-label="Particle density slider"
                    />
                </div>

                {isRoutingMode && (
                    <>
                        <div className="flex flex-col gap-2">
                            <Tooltip text="Adjusts the gain of the Coherent Feedback Loop. Values > 1 indicate amplification.">
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor="loop-gain" className="text-xs text-fuchsia-400/70 tracking-widest uppercase cursor-help">Loop Gain</label>
                                    <span className="text-sm font-orbitron text-fuchsia-300">{settings.loopGain.toFixed(2)}x</span>
                                </div>
                            </Tooltip>
                            <input 
                                id="loop-gain" 
                                type="range" 
                                min="0" max="1.5" step="0.05" 
                                value={settings.loopGain}
                                onChange={(e) => onSettingsChange('loopGain', parseFloat(e.target.value))}
                                disabled={isDisabled}
                                aria-label="Loop gain slider"
                                className="accent-fuchsia-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Tooltip text="Sets the Phase Shift (rotation) applied to photons in the feedback loop.">
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor="phase-shift" className="text-xs text-amber-400/70 tracking-widest uppercase cursor-help">Phase Shift</label>
                                    <span className="text-sm font-orbitron text-amber-300">{Math.round(settings.phaseShift * 180)}°</span>
                                </div>
                            </Tooltip>
                            <input 
                                id="phase-shift" 
                                type="range" 
                                min="-1" max="1" step="0.01" 
                                value={settings.phaseShift}
                                onChange={(e) => onSettingsChange('phaseShift', parseFloat(e.target.value))}
                                disabled={isDisabled}
                                aria-label="Phase shift slider"
                                className="accent-amber-500"
                            />
                        </div>
                    </>
                )}

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="show-neural-links" className="text-xs text-fuchsia-400/70 tracking-widest uppercase cursor-help">Neural Links</label>
                        <Tooltip text={settings.showNeuralLinks ? "Disable neural link visualization" : "Enable neural link visualization"}>
                            <button
                                id="show-neural-links"
                                onClick={() => onSettingsChange('showNeuralLinks', !settings.showNeuralLinks)}
                                role="switch"
                                aria-checked={settings.showNeuralLinks}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-fuchsia-500 ${settings.showNeuralLinks ? 'bg-fuchsia-600' : 'bg-slate-700'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${settings.showNeuralLinks ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                     <Tooltip text="Adjusts the bloom effect intensity for active cells.">
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="glow-intensity" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Glow Intensity</label>
                            <span className="text-sm font-orbitron text-cyan-300">{settings.glowIntensity.toFixed(1)}</span>
                        </div>
                    </Tooltip>
                    <input 
                        id="glow-intensity" 
                        type="range" 
                        min="0" max="1.5" step="0.1" 
                        value={settings.glowIntensity}
                        onChange={(e) => onSettingsChange('glowIntensity', parseFloat(e.target.value))}
                        aria-label="Glow intensity slider"
                    />
                </div>

            </div>
        </div>
    );
};
