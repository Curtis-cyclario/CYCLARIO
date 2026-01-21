import React from 'react';

const EquationSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-6 w-full">
        <h4 className="text-cyan-400/80 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase font-mono">{`// ${title}`}</h4>
        <div className="font-mono text-gray-300 bg-slate-950/60 p-5 rounded-lg text-sm lg:text-base leading-relaxed border border-slate-800/80 shadow-inner">
            {children}
        </div>
    </div>
);

export const TensorVis: React.FC = () => {
    return (
        <div className="w-full max-w-3xl h-full flex flex-col items-center justify-center p-6 lg:p-12 fade-in-component">
            <h2 className="text-2xl font-orbitron font-bold text-cyan-300 tracking-widest uppercase mb-10 text-glow">OPERATIONAL TENSOR MODEL</h2>
            
            <div className="w-full grid grid-cols-1 gap-4">
                <EquationSection title="Micro-Kernel Operation">
                    <p className="mb-2">Seed Tensor: <span className="text-fuchsia-400">W</span> &in; &#123;3,4,5,6&#125;<sup>3&times;3</sup></p>
                    <p>Field Evolution: <span className="text-cyan-400">H</span><sup>(t)</sup><sub>x,y,z</sub> = &Sigma;<sub>(i,j,k)&in;N</sub> <span className="text-amber-400">R</span><sub>x,y,z</sub> &middot; <span className="text-cyan-400">K</span><sub>w<sub>i,j,k</sub></sub>(<span className="text-white">C</span><sup>(t)</sup><sub>i,j,k</sub>)</p>
                    <p className="text-slate-500 mt-3 text-xs tracking-wider">// R: Random axis flip/rotation operator.</p>
                </EquationSection>
                
                <EquationSection title="Planar Folding Convolution">
                    <p>Layer State: <span className="text-cyan-400">L</span><sup>(t)</sup><sub>u</sub> = <span className="text-amber-400">F</span>(&Sigma;<sub>(i,j)&in;N</sub> <span className="text-amber-400">R</span><sub>u</sub> &middot; <span className="text-cyan-400">H</span><sup>(t)</sup><sub>i,j</sub>, <span className="text-fuchsia-400">P</span>)</p>
                     <p className="text-slate-500 mt-3 text-xs tracking-wider">// F: Master gate function; P: Parity operator.</p>
                </EquationSection>

                <EquationSection title="3D Volumetric Update">
                    <p><span className="text-white">C</span><sup>(t+1)</sup><sub>x,y,z</sub> = <span className="text-cyan-400">Q</span><sub>3D</sub>(<span className="text-amber-400">F</span>(&Sigma;<sup>6</sup><sub>z'=1</sub> <span className="text-cyan-400">L</span><sup>(t)</sup><sub>x,y,z'</sub>, <span className="text-fuchsia-400">P</span>, <span className="text-amber-400">&sigma;</span>))</p>
                    <p className="text-slate-500 mt-3 text-xs tracking-wider">// &sigma;: Swastika Symmetry Map; Q: 3D Quantization.</p>
                </EquationSection>

                <EquationSection title="Symbolic Protection Functional">
                    <p>&Delta;<sup>(t)</sup><sub>Swastika</sub> = ||<span className="text-amber-400">&sigma;</span>(<span className="text-white">C</span><sup>(t+1)</sup> &oplus; <span className="text-white">C</span><sup>(t)</sup>)||<sub>2</sub></p>
                    <p className="text-slate-500 mt-3 text-xs tracking-wider">// Primary change magnitude tracked via symbolic folding.</p>
                </EquationSection>
            </div>
            
            <div className="mt-8 text-[9px] font-mono text-slate-600 tracking-[0.4em] uppercase">
                End of mathematical specification. Compliance confirmed.
            </div>
        </div>
    );
};