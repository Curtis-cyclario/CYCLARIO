
import React from 'react';

const TensorGrid: React.FC<{ grid: number[][]; highlightCore?: boolean; title: string; cellSize?: string; subGridSize?: number }> = ({ grid, highlightCore, title, cellSize = 'w-10 h-10', subGridSize }) => (
    <div className="flex flex-col items-center gap-4">
        <h3 className="font-orbitron text-base text-cyan-300 tracking-widest uppercase">{title}</h3>
        <div 
            role="grid" 
            className="grid gap-px bg-slate-700/50 p-px rounded-md shadow-lg border border-slate-600/30 relative" 
            style={{ 
                gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`
            }}
        >
            {grid.flat().map((cell, index) => {
                const row = Math.floor(index / grid[0].length);
                const col = index % grid[0].length;
                const isCore = highlightCore && (row >= 3 && row <= 5) && (col >= 3 && col <= 5);
                
                // Determine mirroring block borders
                let borderClass = "";
                if (subGridSize) {
                    if ((col + 1) % subGridSize === 0 && col !== grid[0].length - 1) borderClass += " border-r border-cyan-500/30";
                    if ((row + 1) % subGridSize === 0 && row !== grid.length - 1) borderClass += " border-b border-cyan-500/30";
                }

                return (
                    <div key={index} className={`flex items-center justify-center aspect-square text-center transition-all duration-300 ${isCore ? 'bg-cyan-900/40 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]' : 'bg-slate-900/50'} ${cellSize} hover:bg-slate-800 ${borderClass}`}>
                        <span className={`font-mono transition-colors ${isCore ? 'text-cyan-300 font-bold' : 'text-gray-500'}`} style={{fontSize: grid.length === 3 ? '1.2rem' : '0.7rem'}}>
                            {cell}
                        </span>
                    </div>
                );
            })}
            
            {/* Visual overlay for mirroring logic if 9x9 */}
            {grid.length === 9 && (
                 <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/10 rounded-md"></div>
            )}
        </div>
    </div>
);

const Arrow: React.FC<{ rotation: number }> = ({ rotation }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" className="text-cyan-400/40 opacity-75 animate-pulse" style={{ transform: `rotate(${rotation}deg)` }}>
        <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 6L20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);


export const AnalysisPanel: React.FC<{ coreGrid: number[][], kernelFace: number[][] }> = ({ coreGrid, kernelFace }) => {
    return (
        <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center p-4 lg:p-10 fade-in-component">
            <h2 className="text-2xl font-orbitron font-bold text-cyan-300 tracking-widest uppercase mb-10 text-glow">KERNEL SYMMETRY ANALYSIS</h2>
            
            <div className="flex flex-col lg:flex-row items-center justify-around gap-12 w-full bg-slate-900/40 p-10 rounded-2xl border border-slate-800/50 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-[9px] font-mono text-cyan-900/40 bg-cyan-400/5 rounded-bl-lg">
                    REF: 00101101 :: kW=6
                </div>

                <TensorGrid grid={coreGrid} title="Seed Kernel (W)" cellSize="w-14 h-14" />

                <div className="flex flex-col items-center justify-center gap-6 relative">
                    <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full"></div>
                    <Arrow rotation={0} />
                    <div className="flex items-center gap-6 z-10">
                        <Arrow rotation={270} />
                        <div className="flex flex-col items-center">
                            <span className="font-orbitron text-cyan-400 text-xs tracking-[0.2em] uppercase font-bold text-glow">MATRICE</span>
                            <span className="font-mono text-cyan-600 text-[9px] tracking-[0.3em] uppercase">MIRRORING</span>
                        </div>
                        <Arrow rotation={90} />
                    </div>
                    <Arrow rotation={180} />
                </div>

                <TensorGrid grid={kernelFace} highlightCore title="Global Face (F)" cellSize="w-9 h-9" subGridSize={3}/>
            </div>

            <div className="max-w-2xl text-center mt-12 component-panel p-6 rounded-xl border-cyan-500/20">
                <p className="text-xs leading-relaxed font-mono text-gray-400 tracking-wide uppercase">
                    The 3x3 <strong className="text-cyan-400 text-glow">Seed Kernel (W)</strong> is the genetic template. 
                    Through <strong className="text-cyan-400 text-glow">Matrice Mirroring</strong>, it propagates into the 9x9 <strong className="text-cyan-400 text-glow">Global Face (F)</strong>, 
                    manifesting the weights <span className="text-white bg-slate-800 px-1 rounded mx-1">3-4-3</span>, <span className="text-white bg-slate-800 px-1 rounded mx-1">5-6-5</span>, <span className="text-white bg-slate-800 px-1 rounded mx-1">3-4-3</span>.
                    This ensures <strong className="text-cyan-400 text-glow">Toroidal Cohesion</strong> across the dual-rail state space.
                </p>
            </div>
        </div>
    );
};
