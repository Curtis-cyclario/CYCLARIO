
import React from 'react';
import { INTERCONNECT_CHANNELS } from '../constants';
import { Tooltip } from './Tooltip';

interface InterconnectMatrixProps {
    channels: {
        rows: boolean[];
        cols: boolean[];
    };
    onToggle: (type: 'rows' | 'cols', index: number) => void;
    isDisabled: boolean;
}

const ToggleButton: React.FC<{ isActive: boolean; onClick: () => void; label: string; title: string; isDisabled: boolean; }> = ({ isActive, onClick, label, title, isDisabled }) => (
    <Tooltip text={title} className="w-full h-full">
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`relative w-full h-full flex items-center justify-center rounded-md border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500
                ${isActive 
                    ? 'bg-cyan-500/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] ring-2 ring-cyan-400/20' 
                    : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60 hover:border-slate-600'}
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
            <span className={`font-mono text-[10px] font-bold transition-colors ${isActive ? 'text-white text-glow' : 'text-cyan-500/60'}`}>
                {label}
            </span>
        </button>
    </Tooltip>
);

export const InterconnectMatrix: React.FC<InterconnectMatrixProps> = ({ channels, onToggle, isDisabled }) => {
    const channelIndices = INTERCONNECT_CHANNELS;
    const gridSize = channelIndices.length + 1;

    return (
        <div className="component-panel p-5 rounded-xl w-full border border-slate-700/50 bg-slate-900/40 backdrop-blur-md flex flex-col items-center">
            <h3 className="text-sm font-orbitron font-bold text-cyan-300 mb-5 text-center tracking-[0.2em] uppercase w-full">
                Optical Interconnects
            </h3>
            
            <div 
                className={`grid gap-2 sm:gap-3 w-full max-w-[320px] aspect-square transition-opacity duration-500 ${isDisabled ? 'opacity-40' : ''}`}
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
            >
                {/* Corner spacer with a subtle tech graphic */}
                <div className="flex items-center justify-center w-full h-full">
                    <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700 animate-pulse" />
                </div>
                
                {/* Column Headers (Toggles) */}
                {channelIndices.map((channel, index) => (
                    <div key={`col-header-${channel}`} className="w-full h-full">
                        <ToggleButton
                            isActive={channels.cols[index]}
                            onClick={() => onToggle('cols', index)}
                            label={`C${channel}`}
                            title={`Toggle long-range vertical interconnect for column ${channel}`}
                            isDisabled={isDisabled}
                        />
                    </div>
                ))}
                
                {/* Row Headers and Matrix Grid */}
                {channelIndices.map((rowChannel, rowIndex) => (
                    <React.Fragment key={`row-group-${rowChannel}`}>
                        {/* Row Header (Toggle) */}
                        <div className="w-full h-full">
                            <ToggleButton
                                isActive={channels.rows[rowIndex]}
                                onClick={() => onToggle('rows', rowIndex)}
                                label={`R${rowChannel}`}
                                title={`Toggle long-range horizontal interconnect for row ${rowChannel}`}
                                isDisabled={isDisabled}
                            />
                        </div>

                        {/* Intersection Nodes */}
                        {channelIndices.map((_colChannel, colIndex) => {
                            const isRowActive = channels.rows[rowIndex];
                            const isColActive = channels.cols[colIndex];
                            
                            let nodeStyles = 'w-full h-full rounded-md border-2 transition-all duration-500 ease-out flex items-center justify-center';
                            
                            if (isRowActive && isColActive) {
                                // High coherence node
                                nodeStyles += ' bg-fuchsia-500/40 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.5)] scale-95';
                            } else if (isRowActive) {
                                // Row coherence
                                nodeStyles += ' bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]';
                            } else if (isColActive) {
                                // Column coherence
                                nodeStyles += ' bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]';
                            } else {
                                // Inactive node
                                nodeStyles += ' bg-slate-900/60 border-slate-800/80';
                            }

                            return (
                                <Tooltip key={`node-${rowChannel}-${_colChannel}`} text={`Intersection point (R${rowChannel}, C${_colChannel}) ${isRowActive && isColActive ? ' - FULL COHERENCE' : ''}`}>
                                    <div className={nodeStyles}>
                                        {(isRowActive || isColActive) && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${isRowActive && isColActive ? 'bg-white animate-ping' : 'bg-white/40'}`} />
                                        )}
                                    </div>
                                </Tooltip>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 w-full">
                <p className="text-[10px] text-cyan-400/50 font-mono text-center tracking-widest uppercase italic">
                    {isDisabled ? 'Configuration Locked' : 'Optical Phase Alignment Active'}
                </p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] font-mono text-gray-500 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-cyan-500/30 border border-cyan-400/50" /> Column</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-indigo-500/30 border border-indigo-400/50" /> Row</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-fuchsia-500/40 border border-fuchsia-400" /> Coherent</span>
                </div>
            </div>
        </div>
    );
};
