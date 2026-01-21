
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Lattice3D, MetricsData, UserPattern, GameState, SimulationMode, PhotonicBus, RoutingState, Photon, Interconnects, GlobalSettings, GateConfig } from '../types';
import { SIZE, DEPTH, DEFAULT_CORE_GRID, INTERCONNECT_CHANNELS } from '../constants';
import { generateLatticeFromPattern, DEFAULT_PATTERNS } from '../patterns';

const FIELD_SIZE = 540;
const CELL_SIZE = FIELD_SIZE / SIZE;

// SWASTIKA SYMMETRY MAP (σ) for Rotational Invariance (U+0968)
const applySymmetryMap = (i: number, j: number, size: number) => {
    // 4-fold rotational symmetry mapping
    const mid = (size - 1) / 2;
    const relI = i - mid;
    const relJ = j - mid;
    // Rotate 90 degrees
    return { ni: Math.round(mid + relJ), nj: Math.round(mid - relI) };
};

const createEmptyLattice = (depth: number): Lattice3D => 
    Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => Array(depth).fill(0)));

const generateDefaultLattice = (depth: number): Lattice3D => {
  const lattice = createEmptyLattice(depth);
  const midLayer = Math.floor(depth / 2);
  lattice[4][4][midLayer] = 1;
  lattice[3][4][midLayer] = 1;
  lattice[5][4][midLayer] = 1;
  return lattice;
};

const DEFAULT_GATE_CONFIGS: Record<number, GateConfig> = {
    3: { mode: 'SYMBOLIC', threshold: 1, weights: { A: 0.5, B: 1, C: 0.5, D: 1, F: 1, G: 0.5, H: 1, I: 0.5 } },
    4: { mode: 'SYMBOLIC', threshold: 2, weights: { A: 0.2, B: 0.2, C: 0.2, D: 0.5, F: 0.5, G: 0.2, H: 0.2, I: 0.2 } },
    5: { mode: 'SYMBOLIC', threshold: 1.5, weights: { A: -0.5, B: 1, C: -0.5, D: 1, F: 1, G: -0.5, H: 1, I: -0.5 } },
    6: { mode: 'SYMBOLIC', threshold: 0.5, weights: { A: -1, B: -1, C: -1, D: -1, F: -1, G: -1, H: -1, I: -1 } },
};

export const useSimulation = ({ globalSettings, activeMode }: { globalSettings: GlobalSettings, activeMode: SimulationMode }) => {
    const [coreGrid, setCoreGrid] = useState<number[][]>(DEFAULT_CORE_GRID);
    const [lattice, setLattice] = useState<Lattice3D>(() => generateDefaultLattice(DEPTH));
    const [prevLattice, setPrevLattice] = useState<Lattice3D>(() => generateDefaultLattice(DEPTH));
    const [running, setRunning] = useState<boolean>(false);
    const [delay, setDelay] = useState<number>(16); 
    const [metrics, setMetrics] = useState<MetricsData>({ 
        prediction_error: 0, latency: 0, invariance: 1.0, sync_delta: 0, 
        delta_swastika: 0, reversibility: 1.0, calibration_drift: 0, phase_continuity: 1.0 
    });
    const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
    const [interconnects, setInterconnects] = useState<Interconnects>({ rows: [false, false, false], cols: [false, false, false] });
    const [buses, setBuses] = useState<PhotonicBus[]>([]);
    const [showBorders, setShowBorders] = useState<boolean>(true);
    const [gateConfigs, setGateConfigs] = useState<Record<number, GateConfig>>(DEFAULT_GATE_CONFIGS);

    const kernelFace = useMemo(() => {
        const face = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                let r = i % 3, c = j % 3;
                if (Math.floor(i / 3) % 2 === 1) r = 2 - r;
                if (Math.floor(j / 3) % 2 === 1) c = 2 - c;
                face[i][j] = coreGrid[r][c];
            }
        }
        return face;
    }, [coreGrid]);

    // Add Effect to update buses for visualization when interconnects change
    useEffect(() => {
        const newBuses: PhotonicBus[] = [];
        INTERCONNECT_CHANNELS.forEach((idx, c) => {
            if (interconnects.rows[c]) {
                newBuses.push({
                    start: { x: 0, y: (idx + 0.5) * CELL_SIZE },
                    end: { x: FIELD_SIZE, y: (idx + 0.5) * CELL_SIZE },
                    intensity: 1.0,
                    color: '#ff64ff'
                });
            }
            if (interconnects.cols[c]) {
                newBuses.push({
                    start: { x: (idx + 0.5) * CELL_SIZE, y: 0 },
                    end: { x: (idx + 0.5) * CELL_SIZE, y: FIELD_SIZE },
                    intensity: 1.0,
                    color: '#64ffff'
                });
            }
        });
        setBuses(newBuses);
    }, [interconnects]);

    // QUA-LOB-PQQP: Unitary Spiking Evolution
    const evolve = useCallback((prev: Lattice3D): Lattice3D => {
        const next = createEmptyLattice(DEPTH);
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const gate = kernelFace[i][j];
                const currentState = prev[i][j][0];
                let state = 0;

                // Refractory Period Logic (State Machine)
                // 1 (Active) -> 2 (Refractory 1) -> 3 (Refractory 2) -> 0 (Ready)
                if (currentState === 1) {
                    state = 2; 
                } else if (currentState === 2) {
                    state = 3; 
                } else if (currentState === 3) {
                    state = 0; 
                } else {
                    // Standard Excitation Logic (only if currentState == 0)
                    let excitation = 0;
                    
                    // Neighborhood interaction (Dual-rail interference)
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;
                            const ni = (i + di + SIZE) % SIZE, nj = (j + dj + SIZE) % SIZE;
                            // Only ACTIVE cells (1) contribute to excitation
                            if (prev[ni][nj][0] === 1) excitation++;
                        }
                    }

                    // Photonic Interconnect contribution
                    INTERCONNECT_CHANNELS.forEach((idx, c) => {
                        if (i === idx && interconnects.rows[c]) {
                            for (let nj = 0; nj < SIZE; nj++) if (nj !== j && prev[i][nj][0] === 1) excitation += 0.5;
                        }
                        if (j === idx && interconnects.cols[c]) {
                            for (let ni = 0; ni < SIZE; ni++) if (ni !== i && prev[ni][j][0] === 1) excitation += 0.5;
                        }
                    });

                    // Gate-specific symbolic spiking
                    switch (gate) {
                        case 3: state = (Math.round(excitation) % 2 !== 0) ? 1 : 0; break;
                        case 4: state = (excitation >= 1.5) ? 1 : 0; break;
                        case 5: state = (prev[i][j][0] === 0 && Math.round(excitation) === 1) ? 1 : 0; break;
                        case 6: state = (excitation < 0.5) ? 1 : 0; break;
                    }
                }

                next[i][j][0] = state;
                // Temporal shift for depth (Z-axis stack)
                for (let k = 1; k < DEPTH; k++) next[i][j][k] = prev[i][j][k-1];
            }
        }
        return next;
    }, [kernelFace, interconnects]);

    const step = useCallback(() => {
        const start = performance.now();
        const nextLattice = evolve(lattice);
        
        // Calculate Protection Functional (Δs) via Symmetrical Folding
        let deltaS = 0;
        let invariance = 0;
        let reversibility = 0;

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const { ni, nj } = applySymmetryMap(i, j, SIZE);
                // Symmetry delta
                if (nextLattice[i][j][0] !== nextLattice[ni][nj][0]) deltaS += 1;
                // Conservation (Invariance) check (Count Active Only)
                if (nextLattice[i][j][0] === 1) invariance += 1;
                // Reversibility check (simplified entropy delta)
                if (nextLattice[i][j][0] !== lattice[i][j][0]) reversibility += 1;
            }
        }

        const normDeltaS = deltaS / (SIZE * SIZE);
        const normInvariance = invariance / (SIZE * SIZE);
        const normRev = 1.0 - (reversibility / (SIZE * SIZE * 0.5));

        const latency = performance.now() - start;
        const newMetrics: MetricsData = {
            prediction_error: normDeltaS * 100,
            latency,
            invariance: 1.0 - Math.abs(0.2 - normInvariance), // Phase conservation around 20% density
            sync_delta: deltaS,
            delta_swastika: deltaS * 0.42,
            reversibility: Math.max(0, normRev),
            calibration_drift: (Math.sin(Date.now() / 5000) * 0.05) + 0.01,
            phase_continuity: 0.99 + (Math.random() * 0.01)
        };

        setPrevLattice(lattice);
        setLattice(nextLattice);
        setMetrics(newMetrics);
        setMetricsHistory(h => [...h.slice(-128), newMetrics]);
    }, [lattice, evolve]);

    useEffect(() => {
        if (running) {
            const id = window.setInterval(step, delay);
            return () => clearInterval(id);
        }
    }, [running, step, delay]);

    const handleUpdateGateConfig = (id: number, config: GateConfig) => {
        setGateConfigs(prev => ({
            ...prev,
            [id]: config
        }));
    };

    return {
        lattice, prevLattice, coreGrid, kernelFace, running, metrics, delay, metricsHistory,
        showBorders, interconnects, patterns: DEFAULT_PATTERNS, buses, gateConfigs,
        setRunning, setDelay, setCoreGrid,
        handleStep: () => { setRunning(false); step(); },
        handleReset: () => { 
            setRunning(false); 
            const l = generateDefaultLattice(DEPTH);
            setLattice(l); setPrevLattice(l); setMetricsHistory([]);
        },
        handleCellClick: (i: number, j: number, k: number) => {
            const n = [...lattice.map(r => r.map(c => [...c]))];
            // Cycle: 0 (Inactive) -> 1 (Active) -> 2 (Refractory 1) -> 3 (Refractory 2) -> 0
            n[i][j][k] = (n[i][j][k] + 1) % 4;
            setLattice(n);
        },
        handleCoreGridChange: (i:number, j:number, v:number) => {
            const n = coreGrid.map(r => [...r]);
            n[i][j] = v; setCoreGrid(n);
        },
        handleInterconnectToggle: (t: 'rows' | 'cols', i: number) => setInterconnects(p => {
            const n = { ...p };
            n[t] = [...n[t]]; n[t][i] = !n[t][i];
            return n;
        }),
        handleApplyGeneratedPattern: (c: any) => {
            if (c.coreGrid) setCoreGrid(c.coreGrid);
            if (c.pattern) setLattice(generateLatticeFromPattern(c.pattern, DEPTH));
            setRunning(false);
        },
        onToggleBorders: () => setShowBorders(p => !p),
        handleLoadPattern: (id: string) => {
            const p = DEFAULT_PATTERNS.find(x => x.id === id);
            if (p) setLattice(p.data);
            setRunning(false);
        },
        handleResetCoreGrid: () => setCoreGrid(DEFAULT_CORE_GRID),
        handleClear: () => setLattice(createEmptyLattice(DEPTH)),
        handleUpdateGateConfig
    };
};
