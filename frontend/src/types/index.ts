import type { SPHEngine } from '../utils/sph-engine'

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  density: number;
  pressure: number;
  fx: number;
  fy: number;
}

export interface SimParams {
  gravity: number;
  viscosity: number;
  restDensity: number;
  gasConstant: number;
  smoothingRadius: number;
  particleMass: number;
  dt: number;
  damping: number;
  boundaryStiffness: number;
}

export interface Preset {
  name: string;
  label: string;
  description: string;
  params: Partial<SimParams>;
  particleCount: number;
  initialConfig: 'dam' | 'drop' | 'fountain' | 'wave';
}

export type SimSlot = 'A' | 'B';

export interface SimInstance {
  engine: SPHEngine | null;
  isRunning: boolean;
  particleCount: number;
  currentPreset: Preset;
  params: SimParams;
  fps: number;
  frameCount: number;
  _animId: number | null;
  _lastTime: number;
  _fpsAccum: number;
  _fpsFrames: number;
}
