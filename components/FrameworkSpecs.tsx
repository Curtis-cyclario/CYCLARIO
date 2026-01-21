import React from 'react';

const ConceptSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="component-panel rounded-xl p-8 border-cyan-500/10 hover:border-cyan-500/30 transition-colors bg-slate-900/30 backdrop-blur-sm mb-6">
        <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-4 tracking-widest uppercase text-glow">{title}</h3>
        <div className="text-sm text-gray-400 space-y-4 leading-relaxed font-mono">
            {children}
        </div>
    </div>
);

export const FrameworkSpecs: React.FC = () => {
    return (
        <div className="w-full max-w-5xl h-full flex flex-col items-center justify-start p-6 lg:p-12 fade-in-component overflow-y-auto custom-scrollbar">
            <h2 className="text-3xl font-orbitron font-bold text-cyan-300 tracking-[0.3em] uppercase holographic-title mb-12">CORE CONCEPTUAL FRAMEWORK</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <ConceptSection title="Hierarchical Model">
                    <p>The simulation evolves across three distinct hierarchical planes: micro-kernel logic, planar convolution, and 3D volumetric folding.</p>
                    <p>The substrate utilizes a 9x9x6 lattice of dual-rail binary state tiles representing coherent photonic states.</p>
                </ConceptSection>

                <ConceptSection title="Micro-Kernel Logic">
                   <p>Foundational logic is driven by a 3x3 seed matrix (Kernel W). This matrix dictates callable operators like XOR, Threshold, and Memory gates.</p>
                   <p>A random axis-flip operator (R) ensures scramble-protection of raw logic states across the toroidal grid.</p>
                </ConceptSection>

                 <ConceptSection title="Dimensional Folding">
                   <p>Planar layers are aggregated and folded through a master gate parity operator (P).</p>
                   <p>Symmetrical folding ensures rotational invariance through the application of the Swastika Symmetry Map (σ) during 3D quantization.</p>
                </ConceptSection>

                <ConceptSection title="Operational Discipline">
                   <p>System integrity is tracked via real-time metrics: Profile Latency, Reversibility Proofs, and Calibration recording.</p>
                   <p>Beauty is not just an aesthetic; it is a core functional specification for operational clarity.</p>
                </ConceptSection>
            </div>
            
            <div className="mt-12 text-[10px] text-slate-500 font-mono tracking-widest uppercase italic">
                System Status: Cohesive Toroidal Engine is Nominal.
            </div>
        </div>
    );
};