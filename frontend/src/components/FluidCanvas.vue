<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useFluidStore } from '../store/fluid'
import type { SimSlot } from '../types'

const props = withDefaults(defineProps<{
  slot?: SimSlot
  showLabel?: boolean
  compact?: boolean
}>(), {
  slot: 'A',
  showLabel: false,
  compact: false,
})

const store = useFluidStore()
const canvas = ref<HTMLCanvasElement | null>(null)

const W = 800
const H = 500

const sim = computed(() => store.getSim(props.slot))

function velocityToColor(speed: number): string {
  const maxSpeed = 200
  const t = Math.min(speed / maxSpeed, 1)
  const hue = (1 - t) * 240
  const sat = 80
  const light = 40 + t * 20
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

function slotAccentColor(): string {
  return props.slot === 'A' ? '#3b82f6' : '#f97316'
}

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#0c1222'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 3
  ctx.strokeRect(2, 2, W - 4, H - 4)

  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 0.3
  for (let x = 0; x < W; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y < H; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  const engine = sim.value.engine
  if (!engine) return

  const gridSize = 20
  const gw = Math.ceil(W / gridSize)
  const gh = Math.ceil(H / gridSize)
  const densityGrid = new Float32Array(gw * gh)
  for (const p of engine.particles) {
    const gx = Math.floor(p.x / gridSize)
    const gy = Math.floor(p.y / gridSize)
    if (gx >= 0 && gx < gw && gy >= 0 && gy < gh) {
      densityGrid[gy * gw + gx] += p.density
    }
  }
  const maxDens = Math.max(...densityGrid, 1)
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const d = densityGrid[gy * gw + gx]
      if (d > 0) {
        const alpha = Math.min(d / maxDens * 0.15, 0.15)
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
        ctx.fillRect(gx * gridSize, gy * gridSize, gridSize, gridSize)
      }
    }
  }

  const particles = engine.particles
  for (const p of particles) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const color = velocityToColor(speed)
    const radius = 4

    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(W - 80, 5, 75, 22)
  ctx.fillStyle = '#22c55e'
  ctx.font = 'bold 12px monospace'
  ctx.fillText(`FPS: ${sim.value.fps}`, W - 74, 20)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(W - 120, 30, 115, 22)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px monospace'
  ctx.fillText(`Frame: ${sim.value.frameCount}`, W - 114, 44)

  if (props.showLabel) {
    const accent = slotAccentColor()
    ctx.fillStyle = accent
    ctx.fillRect(5, 5, 36, 28)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(props.slot, 16, 25)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(5, 37, 210, 22)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '11px sans-serif'
    ctx.fillText(sim.value.currentPreset.label, 12, 52)
  }
}

let raf: number | null = null
function animate() {
  draw()
  raf = requestAnimationFrame(animate)
}

function onClick(e: MouseEvent) {
  const engine = sim.value.engine
  if (!engine || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = W / rect.width
  const scaleY = H / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  engine.applyImpulse(x, y, 300)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="relative">
    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      class="rounded-lg border border-gray-700 cursor-crosshair w-full"
      :class="compact ? 'max-w-[600px]' : 'max-w-[800px]'"
      @click="onClick"
    />
  </div>
</template>
