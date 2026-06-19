<script setup lang="ts">
import { computed } from 'vue'
import { useFluidStore } from '../store/fluid'
import { PRESETS } from '../utils/sph-engine'
import type { Preset, SimSlot } from '../types'

const store = useFluidStore()

const simA = computed(() => store.getSim('A'))
const simB = computed(() => store.getSim('B'))

function selectPreset(preset: Preset, slot: SimSlot = 'A') {
  store.initSimulation(preset, slot)
}

function isRunningAny(): boolean {
  return simA.value.isRunning || simB.value.isRunning
}

function toggleRun() {
  if (isRunningAny()) {
    store.stopAll()
  } else {
    store.startAll()
  }
}

function reset() {
  store.resetAll()
}

function stepOnce() {
  store.stepAll()
}

function makeParamHandler(key: keyof typeof simA.value.params, slot: SimSlot) {
  return (e: Event) => {
    store.updateParam(key, parseFloat((e.target as HTMLInputElement).value), slot)
  }
}

function onParticleCount(e: Event, slot: SimSlot) {
  store.setParticleCount(parseInt((e.target as HTMLInputElement).value), slot)
}
</script>

<template>
  <div class="w-72 bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col gap-4 overflow-auto h-full">
    <div>
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">显示模式</h3>
      <button
        @click="store.toggleCompareMode()"
        class="w-full py-2 rounded text-sm font-medium transition"
        :class="store.compareMode
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'"
      >
        {{ store.compareMode ? '◉ 双画面对比模式' : '○ 单画面模式' }}
      </button>
    </div>

    <div class="flex gap-2">
      <button
        @click="toggleRun"
        class="flex-1 py-2 rounded text-sm font-medium transition"
        :class="isRunningAny()
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'"
      >
        {{ isRunningAny() ? '暂停' : '开始' }}
      </button>
      <button
        @click="reset"
        class="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded text-sm transition"
      >
        重置
      </button>
      <button
        @click="stepOnce"
        :disabled="isRunningAny()"
        class="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 py-2 rounded text-sm transition"
      >
        单步
      </button>
    </div>

    <template v-for="slot in (store.compareMode ? (['A', 'B'] as SimSlot[]) : (['A'] as SimSlot[]))" :key="slot">
      <div class="border-t border-gray-700 pt-3">
        <div class="flex items-center gap-2 mb-2">
          <span
            class="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            :class="slot === 'A' ? 'bg-blue-600' : 'bg-orange-500'"
          >{{ slot }}</span>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">模拟 {{ slot }} — 预设场景</h3>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="preset in PRESETS"
            :key="preset.name + slot"
            @click="selectPreset(preset, slot)"
            class="text-xs px-2 py-2 rounded transition text-left"
            :class="store.getSim(slot).currentPreset.name === preset.name
              ? (slot === 'A' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white')
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ preset.label }}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ store.getSim(slot).currentPreset.description }}</p>
      </div>

      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">模拟 {{ slot }} — 参数</h3>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>重力</span>
            <span class="text-gray-300">{{ store.getSim(slot).params.gravity.toFixed(1) }}</span>
          </label>
          <input
            type="range" min="0" max="20" step="0.1"
            :value="store.getSim(slot).params.gravity"
            @input="makeParamHandler('gravity', slot)"
            class="w-full accent-blue-500 h-1.5"
            :class="slot === 'B' ? 'accent-orange-500' : ''"
          />
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>粘性</span>
            <span class="text-gray-300">{{ store.getSim(slot).params.viscosity.toFixed(1) }}</span>
          </label>
          <input
            type="range" min="0" max="5" step="0.1"
            :value="store.getSim(slot).params.viscosity"
            @input="makeParamHandler('viscosity', slot)"
            class="w-full accent-blue-500 h-1.5"
            :class="slot === 'B' ? 'accent-orange-500' : ''"
          />
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>光滑半径</span>
            <span class="text-gray-300">{{ store.getSim(slot).params.smoothingRadius.toFixed(0) }}</span>
          </label>
          <input
            type="range" min="10" max="50" step="1"
            :value="store.getSim(slot).params.smoothingRadius"
            @input="makeParamHandler('smoothingRadius', slot)"
            class="w-full accent-blue-500 h-1.5"
            :class="slot === 'B' ? 'accent-orange-500' : ''"
          />
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>粒子数量</span>
            <span class="text-gray-300">{{ store.getSim(slot).particleCount }}</span>
          </label>
          <input
            type="range" min="200" max="2000" step="50"
            :value="store.getSim(slot).particleCount"
            @input="onParticleCount($event, slot)"
            class="w-full accent-blue-500 h-1.5"
            :class="slot === 'B' ? 'accent-orange-500' : ''"
          />
          <p class="text-xs text-gray-600 mt-0.5">重置后生效</p>
        </div>

        <div>
          <label class="flex justify-between text-xs text-gray-400 mb-1">
            <span>时间步长</span>
            <span class="text-gray-300">{{ store.getSim(slot).params.dt.toFixed(4) }}</span>
          </label>
          <input
            type="range" min="0.001" max="0.02" step="0.001"
            :value="store.getSim(slot).params.dt"
            @input="makeParamHandler('dt', slot)"
            class="w-full accent-blue-500 h-1.5"
            :class="slot === 'B' ? 'accent-orange-500' : ''"
          />
        </div>
      </div>

      <div class="pt-3 border-t border-gray-700">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">模拟 {{ slot }} — 状态</h3>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">FPS</span>
            <p class="text-green-400 font-mono text-sm">{{ store.getSim(slot).fps }}</p>
          </div>
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">粒子数</span>
            <p class="text-blue-400 font-mono text-sm">{{ store.particleArrayOf(slot).length }}</p>
          </div>
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">平均密度</span>
            <p class="text-yellow-400 font-mono text-sm">{{ store.avgDensityOf(slot).toFixed(0) }}</p>
          </div>
          <div class="bg-gray-900 rounded px-2 py-1.5">
            <span class="text-gray-500">最大速度</span>
            <p class="text-red-400 font-mono text-sm">{{ store.maxVelocityOf(slot).toFixed(1) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
