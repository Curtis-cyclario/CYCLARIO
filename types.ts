
export type Lattice3D = number[][][];

export interface Point {
  x: number;
  y: number;
}

export interface Ball {
  pos: Point;
  vel: Point;
}

export interface Paddle {
  y: number;
  targetY: number;
}

export interface GameState {
  player1: { ball: Ball; paddle: Paddle };
  player2: { ball: Ball; paddle: Paddle };
}

export interface Photon {
  id: string;
  pos: Point;
  vel: Point;
  color: string;
  energy: number;
  life: number;
}

export interface RoutingState {
  photons: Photon[];
  sources: Point[];
  sinks: Point[];
}

export interface Interconnects {
  rows: boolean[];
  cols: boolean[];
}

export interface MetricsData {
  // Spec Mandated Metrics
  prediction_error: number; 
  latency: number;          
  invariance: number;       // Phase/Intensity Conservation
  sync_delta: number;
  delta_swastika: number;   // Protection Functional Output
  reversibility: number;    // det(Unitary(g)) approx 1
  calibration_drift: number;
  phase_continuity: number;
}

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type AudioSourceMetric = 'delta_swastika' | 'reversibility' | 'invariance' | 'phase_continuity';
export type AudioProfile = 'synth_blip' | 'thermal_noise';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserPattern {
  id: string;
  name: string;
  data: Lattice3D;
  isDefault?: boolean;
}

/**
 * 3 Master Modes per Showcase Engineering Specification
 */
export type SimulationMode = 
  | 'CONSUMER_LEVEL'      // Aesthetic Beauty, Macro Project Visualization
  | 'PHYSXZARD_CORE'      // DSL Compliance: Mandatory Simulation Constraints
  | 'CINEMATIC_STACK';    // MMPitch: High Dimensionality & Foundational Vision

export interface GlobalSettings {
  recurrenceDepth: number;
  particleDensity: number;
  glowIntensity: number;
  loopGain: number;
  phaseShift: number;
  showNeuralLinks: boolean;
}

export interface PhotonicBus {
  start: Point;
  end: Point;
  intensity: number;
  color: string;
}

export interface GateWeightMap {
    A: number; B: number; C: number;
    D: number; F: number;
    G: number; H: number; I: number;
}

export interface GateConfig {
    mode: 'SYMBOLIC' | 'WEIGHTED';
    threshold: number;
    weights: GateWeightMap;
}
