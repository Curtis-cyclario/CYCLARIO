


export const SIZE = 9;
export const DEPTH = 6;

// --- Cortical Module Weights ---
export const INTRA_MODULE_WEIGHT = 1.0;
export const INTER_MODULE_WEIGHT = 0.5;
export const INTERCONNECT_WEIGHT = 0.15;

export const INTERCONNECT_CHANNELS = [1, 4, 7];

// --- Kernel color map ---
export const COLORS: { [key: number]: string } = {
  3: "#00aaff", // XOR -> Electric Blue
  4: "#9933ff", // Threshold -> Violet
  5: "#00ffcc", // Memory -> Teal
  6: "#ff5500", // NOT -> Vibrant Orange-Red
};

export const REFRACTORY_COLORS: { [key: number]: string } = {
  3: "#005580",
  4: "#4d1a80",
  5: "#008066",
  6: "#802b00",
};

export const INACTIVE_COLORS: { [key: number]: string } = {
  3: "#002233",
  4: "#260d40",
  5: "#003329",
  6: "#401500",
};

export const GATE_NAMES: { [key: number]: string } = {
  3: 'XOR (Phase)',
  4: 'THRESHOLD (Amp)',
  5: 'MEMORY (Latch)',
  6: 'NOT (Invert)',
};

export const GATE_DESCRIPTIONS: { [key: number]: string } = {
  3: 'XOR: Phase interference logic. Active on odd parity sums.',
  4: 'THRESHOLD: Amplitude filter. Active if signal intensity >= 2.',
  5: 'MEMORY: Optical Latch. Sets on 1, Resets on >1, Holds otherwise.',
  6: 'NOT: Signal Inverter. Active only in vacuum state (0).',
};

export const GATE_BG_COLORS: { [key: number]: string } = {
  3: 'bg-blue-900/60 hover:bg-blue-800/60 border-blue-700/80',
  4: 'bg-violet-900/60 hover:bg-violet-800/60 border-violet-700/80',
  5: 'bg-teal-900/60 hover:bg-teal-800/60 border-teal-700/80',
  6: 'bg-orange-900/60 hover:bg-orange-800/60 border-orange-700/80',
}

export const WEIGHT_OFFSETS: Record<string, { di: number; dj: number }> = {
    A: { di: -1, dj: -1 },
    B: { di: 0, dj: -1 },
    C: { di: 1, dj: -1 },
    D: { di: -1, dj: 0 },
    // E is Center, skipped usually
    F: { di: 1, dj: 0 },
    G: { di: -1, dj: 1 },
    H: { di: 0, dj: 1 },
    I: { di: 1, dj: 1 },
};

// --- 3x3 core ---
export const DEFAULT_CORE_GRID: number[][] = [
  [3, 4, 3],
  [5, 6, 5],
  [3, 4, 3]
];

export const GATE_TYPES = [3, 4, 5, 6];

export const SYSTEM_INSTRUCTION = `You are the architect of the Cyclario Recurrent Automaton. 
Focus on the "Cohesive Toroidal Engine" and "Photonic DSL".
Your goal is to explain the 3 Master Modes: Field Dynamics (Macro View), PhysXzard (DSL Compliance), and Cinematic Stack (MMPitch).
Emphasize "Logic in light, language by lumens".
`;

export interface KernelPreset {
  name: string;
  grid: number[][];
}

// "11 10 01 - 10 10 10 - 01 10 00" interpreted as logic gates 3,4,5 approx for variety
// Let's use 3=11(3), 2=10(4?), 1=01(5?). Mapping for diversity: 
// 11 -> 3 (XOR)
// 10 -> 4 (THRESH)
// 01 -> 5 (MEM)
// 00 -> 6 (NOT)
export const KERNEL_PRESETS: KernelPreset[] = [
  {
    name: 'Standard',
    grid: DEFAULT_CORE_GRID,
  },
  {
    name: 'Cyclario Seed', // The prompt's seed pattern
    grid: [
      [3, 4, 5], // 11 10 01
      [4, 4, 4], // 10 10 10
      [5, 4, 6]  // 01 10 00
    ],
  },
  {
    name: 'Chaotic Growth',
    grid: [
      [6, 3, 6],
      [3, 4, 3],
      [6, 3, 6]
    ],
  },
  {
    name: 'Oscillator',
    grid: [
      [4, 5, 4],
      [5, 3, 5],
      [4, 5, 4]
    ],
  },
  {
    name: 'Blockade',
    grid: [
      [5, 5, 5],
      [5, 6, 5],
      [5, 5, 5]
    ],
  }
];
