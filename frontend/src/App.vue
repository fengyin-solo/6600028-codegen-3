<script setup lang="ts">
import { onMounted } from 'vue'
import { useFluidStore } from './store/fluid'
import { PRESETS } from './utils/sph-engine'
import FluidCanvas from './components/FluidCanvas.vue'
import ControlPanel from './components/ControlPanel.vue'

const store = useFluidStore()

onMounted(() => {
  store.initSimulation(PRESETS[0], 'A')
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white tracking-wide">流体力学 SPH 粒子模拟器</h1>
          <p class="text-xs text-gray-500 mt-1">Smoothed Particle Hydrodynamics — 点击画布施加冲量</p>
        </div>
        <div
          v-if="store.compareMode"
          class="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-semibold"
        >
          双画面对比模式
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden p-4 gap-4">
      <!-- Left: Canvas(es) -->
      <div class="flex-1 flex flex-col items-start gap-2 min-w-0">
        <div
          v-if="!store.compareMode"
          class="w-full flex justify-center"
        >
          <FluidCanvas slot="A" />
        </div>
        <div
          v-else
          class="w-full flex flex-col lg:flex-row gap-3 justify-center items-start"
        >
          <div class="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div class="flex items-center gap-2 self-start">
              <span class="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold bg-blue-600">A</span>
              <span class="text-sm font-medium text-blue-400">{{ store.getSim('A').currentPreset.label }}</span>
            </div>
            <FluidCanvas slot="A" :show-label="true" :compact="true" />
          </div>
          <div class="hidden lg:flex items-center justify-center">
            <div class="text-gray-600 text-2xl font-light">VS</div>
          </div>
          <div class="lg:hidden flex items-center justify-center w-full">
            <div class="text-gray-600 text-xl font-light">—— VS ——</div>
          </div>
          <div class="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div class="flex items-center gap-2 self-start">
              <span class="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold bg-orange-500">B</span>
              <span class="text-sm font-medium text-orange-400">{{ store.getSim('B').currentPreset.label }}</span>
            </div>
            <FluidCanvas slot="B" :show-label="true" :compact="true" />
          </div>
        </div>
      </div>

      <!-- Right: Controls -->
      <div class="flex-shrink-0">
        <ControlPanel />
      </div>
    </div>

    <!-- Bottom Stats Bar -->
    <footer class="bg-gray-800 border-t border-gray-700 px-6 py-2 flex items-center gap-4 text-xs flex-wrap">
      <template v-if="!store.compareMode">
        <div class="flex items-center gap-2">
          <span class="text-gray-500">FPS:</span>
          <span class="text-green-400 font-mono">{{ store.getSim('A').fps }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">粒子:</span>
          <span class="text-blue-400 font-mono">{{ store.particleArrayOf('A').length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">平均密度:</span>
          <span class="text-yellow-400 font-mono">{{ store.avgDensityOf('A').toFixed(1) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">最大速度:</span>
          <span class="text-red-400 font-mono">{{ store.maxVelocityOf('A').toFixed(1) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">当前预设:</span>
          <span class="text-purple-400">{{ store.getSim('A').currentPreset.label }}</span>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <span class="text-gray-500">帧数:</span>
          <span class="text-gray-300 font-mono">{{ store.getSim('A').frameCount }}</span>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center gap-3 pr-3 border-r border-gray-700">
          <span class="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold bg-blue-600">A</span>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">FPS:</span>
            <span class="text-green-400 font-mono">{{ store.getSim('A').fps }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">粒子:</span>
            <span class="text-blue-400 font-mono">{{ store.particleArrayOf('A').length }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">密度:</span>
            <span class="text-yellow-400 font-mono">{{ store.avgDensityOf('A').toFixed(0) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">帧:</span>
            <span class="text-gray-300 font-mono">{{ store.getSim('A').frameCount }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold bg-orange-500">B</span>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">FPS:</span>
            <span class="text-green-400 font-mono">{{ store.getSim('B').fps }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">粒子:</span>
            <span class="text-blue-400 font-mono">{{ store.particleArrayOf('B').length }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">密度:</span>
            <span class="text-yellow-400 font-mono">{{ store.avgDensityOf('B').toFixed(0) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500">帧:</span>
            <span class="text-gray-300 font-mono">{{ store.getSim('B').frameCount }}</span>
          </div>
        </div>
      </template>
    </footer>
  </div>
</template>
