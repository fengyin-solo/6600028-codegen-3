import { defineStore } from 'pinia'
import { SPHEngine, DEFAULT_PARAMS, PRESETS } from '../utils/sph-engine'
import type { SimParams, Preset, SimSlot, SimInstance } from '../types'

function createDefaultInstance(): SimInstance {
  return {
    engine: null,
    isRunning: false,
    particleCount: 800,
    currentPreset: PRESETS[0],
    params: { ...DEFAULT_PARAMS },
    fps: 0,
    frameCount: 0,
    _animId: null,
    _lastTime: 0,
    _fpsAccum: 0,
    _fpsFrames: 0,
  }
}

function getParticleArray(inst: SimInstance) {
  return inst.engine?.particles ?? []
}

function getAvgDensity(inst: SimInstance) {
  if (!inst.engine || inst.engine.particles.length === 0) return 0
  const sum = inst.engine.particles.reduce((s, p) => s + p.density, 0)
  return sum / inst.engine.particles.length
}

function getMaxVelocity(inst: SimInstance) {
  if (!inst.engine || inst.engine.particles.length === 0) return 0
  return Math.max(...inst.engine.particles.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy)))
}

export const useFluidStore = defineStore('fluid', {
  state: () => ({
    compareMode: false,
    simA: createDefaultInstance(),
    simB: createDefaultInstance(),
  }),
  getters: {
    activeSlot(): SimSlot {
      return 'A'
    },
    engine: (state) => state.simA.engine,
    isRunning: (state) => state.simA.isRunning,
    particleCount: (state) => state.simA.particleCount,
    currentPreset: (state) => state.simA.currentPreset,
    params: (state) => state.simA.params,
    fps: (state) => state.simA.fps,
    frameCount: (state) => state.simA.frameCount,
    particleArray: (state) => getParticleArray(state.simA),
    avgDensity: (state) => getAvgDensity(state.simA),
    maxVelocity: (state) => getMaxVelocity(state.simA),
  },
  actions: {
    getSim(slot: SimSlot): SimInstance {
      return slot === 'A' ? this.simA : this.simB
    },

    initSimulation(preset?: Preset, slot: SimSlot = 'A') {
      const inst = this.getSim(slot)
      if (preset) {
        inst.currentPreset = preset
        inst.params = { ...DEFAULT_PARAMS, ...preset.params }
        inst.particleCount = preset.particleCount
      }
      const canvas = { width: 800, height: 500 }
      inst.engine = new SPHEngine(inst.particleCount, canvas.width, canvas.height, inst.params)
      inst.engine.initParticles(inst.currentPreset.initialConfig, inst.particleCount)
      inst.frameCount = 0
      inst.fps = 0
    },

    start(slot: SimSlot = 'A') {
      const inst = this.getSim(slot)
      if (inst.isRunning || !inst.engine) return
      inst.isRunning = true
      inst._lastTime = performance.now()
      inst._fpsAccum = 0
      inst._fpsFrames = 0
      const loop = (now: number) => {
        if (!inst.isRunning || !inst.engine) return
        const elapsed = now - inst._lastTime
        inst._lastTime = now
        inst._fpsAccum += elapsed
        inst._fpsFrames++
        if (inst._fpsAccum >= 500) {
          inst.fps = Math.round(inst._fpsFrames / (inst._fpsAccum / 1000))
          inst._fpsAccum = 0
          inst._fpsFrames = 0
        }
        const subSteps = 3
        for (let s = 0; s < subSteps; s++) {
          inst.engine.step()
        }
        inst.frameCount++
        inst._animId = requestAnimationFrame(loop)
      }
      inst._animId = requestAnimationFrame(loop)
    },

    stop(slot: SimSlot = 'A') {
      const inst = this.getSim(slot)
      inst.isRunning = false
      if (inst._animId !== null) {
        cancelAnimationFrame(inst._animId)
        inst._animId = null
      }
    },

    reset(slot: SimSlot = 'A') {
      this.stop(slot)
      this.initSimulation(undefined, slot)
    },

    stepOnce(slot: SimSlot = 'A') {
      const inst = this.getSim(slot)
      if (!inst.engine || inst.isRunning) return
      const subSteps = 3
      for (let s = 0; s < subSteps; s++) {
        inst.engine.step()
      }
      inst.frameCount++
    },

    updateParam(key: keyof SimParams, value: number, slot: SimSlot = 'A') {
      const inst = this.getSim(slot)
      inst.params[key] = value
      if (inst.engine) {
        inst.engine.params[key] = value
        if (key === 'smoothingRadius') {
          inst.engine['cellSize'] = value
        }
      }
    },

    setParticleCount(count: number, slot: SimSlot = 'A') {
      this.getSim(slot).particleCount = count
    },

    toggleCompareMode() {
      this.compareMode = !this.compareMode
      if (this.compareMode) {
        if (!this.simB.engine) {
          this.initSimulation(PRESETS[1], 'B')
        }
      }
    },

    startAll() {
      this.start('A')
      if (this.compareMode) this.start('B')
    },

    stopAll() {
      this.stop('A')
      this.stop('B')
    },

    resetAll() {
      this.reset('A')
      if (this.compareMode) this.reset('B')
    },

    stepAll() {
      this.stepOnce('A')
      if (this.compareMode) this.stepOnce('B')
    },

    particleArrayOf(slot: SimSlot) {
      return getParticleArray(this.getSim(slot))
    },

    avgDensityOf(slot: SimSlot) {
      return getAvgDensity(this.getSim(slot))
    },

    maxVelocityOf(slot: SimSlot) {
      return getMaxVelocity(this.getSim(slot))
    },
  },
})
