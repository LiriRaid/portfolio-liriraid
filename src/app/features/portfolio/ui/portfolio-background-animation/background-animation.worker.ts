/// <reference lib="webworker" />

type CircuitNode = { x: number; y: number; pulse: number };
type CircuitLine = { from: CircuitNode; to: CircuitNode; delay: number };

type BackgroundIntensity = {
  glowStart: number;
  glowMid: number;
  lineBase: number;
  linePulse: number;
  lineAccent: number;
  nodeBase: number;
  nodePulse: number;
  packet: number;
  packetGlow: number;
};

type WorkerMessage =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; dpr: number; primary: string; muted: string; isDark: boolean; enabled: boolean; scrollProgress: number }
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'theme'; primary: string; muted: string; isDark: boolean }
  | { type: 'scroll'; progress: number }
  | { type: 'enabled'; value: boolean }
  | { type: 'destroy' };

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

let nodes: CircuitNode[] = [];
let lines: CircuitLine[] = [];
let width = 0;
let height = 0;
let dpr = 1;
let time = 0;
let scrollProgress = 0;
let enabled = false;
let isDark = false;
let primaryColor = '#ffffff';
let mutedColor = '#ffffff';

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastFrameTime = 0;
let clearTimeoutId: ReturnType<typeof setTimeout> | null = null;

const FADE_OUT_DURATION_MS = 450;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'init':
      canvas = msg.canvas;
      ctx = canvas.getContext('2d', { alpha: true }) as OffscreenCanvasRenderingContext2D | null;
      width = msg.width;
      height = msg.height;
      dpr = msg.dpr;
      primaryColor = msg.primary;
      mutedColor = msg.muted;
      isDark = msg.isDark;
      scrollProgress = msg.scrollProgress;
      enabled = msg.enabled;
      applyDpr();
      buildCircuit();
      if (enabled) {
        startLoop();
      }
      break;

    case 'resize':
      width = msg.width;
      height = msg.height;
      dpr = msg.dpr;
      applyDpr();
      buildCircuit();
      if (enabled) {
        renderFrame(1 / 60);
      }
      break;

    case 'theme':
      primaryColor = msg.primary;
      mutedColor = msg.muted;
      isDark = msg.isDark;
      if (enabled) {
        renderFrame(1 / 60);
      }
      break;

    case 'scroll':
      scrollProgress = msg.progress;
      break;

    case 'enabled':
      enabled = msg.value;
      if (clearTimeoutId !== null) {
        clearTimeout(clearTimeoutId);
        clearTimeoutId = null;
      }
      if (enabled) {
        startLoop();
      } else {
        stopLoop();
        clearTimeoutId = setTimeout(() => {
          clear();
          clearTimeoutId = null;
        }, FADE_OUT_DURATION_MS);
      }
      break;

    case 'destroy':
      if (clearTimeoutId !== null) {
        clearTimeout(clearTimeoutId);
        clearTimeoutId = null;
      }
      stopLoop();
      canvas = null;
      ctx = null;
      break;
  }
};

function startLoop(): void {
  if (intervalId !== null) {
    return;
  }

  lastFrameTime = performance.now();
  const targetInterval = 1000 / 60;

  intervalId = setInterval(() => {
    const now = performance.now();
    const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;
    renderFrame(delta);
  }, targetInterval);
}

function stopLoop(): void {
  if (intervalId === null) {
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
}

function applyDpr(): void {
  if (!canvas || !ctx) {
    return;
  }

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildCircuit(): void {
  const columns = Math.max(7, Math.round(width / 180));
  const rows = Math.max(6, Math.round(height / 145));

  const gapX = width / Math.max(1, columns - 1);
  const gapY = height / Math.max(1, rows - 1);

  nodes = [];
  lines = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const isEdgeX = x === 0 || x === columns - 1;
      const isEdgeY = y === 0 || y === rows - 1;

      const offsetX = isEdgeX ? 0 : Math.sin((x + y) * 1.7) * gapX * 0.12;
      const offsetY = isEdgeY ? 0 : Math.cos((x - y) * 1.3) * gapY * 0.1;

      nodes.push({
        x: clamp(x * gapX + offsetX, 0, width),
        y: clamp(y * gapY + offsetY, 0, height),
        pulse: Math.random(),
      });
    }
  }

  const columns_ = columns;

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const right = nodes[index + 1];
    const bottom = nodes[index + columns_];

    if (right && index % columns_ !== columns_ - 1) {
      lines.push({ from: node, to: right, delay: Math.random() });
    }

    if (bottom) {
      lines.push({ from: node, to: bottom, delay: Math.random() });
    }
  }
}

function renderFrame(deltaSeconds: number): void {
  if (!ctx) {
    return;
  }

  time += deltaSeconds * 0.6;

  const intensity = getIntensity();

  ctx.clearRect(0, 0, width, height);

  drawAmbientGlow(intensity);
  drawCircuitLines(intensity);
  drawCircuitNodes(intensity);
  drawPackets(intensity);
}

function drawAmbientGlow(intensity: BackgroundIntensity): void {
  if (!ctx) {
    return;
  }

  const x = width * (0.18 + scrollProgress * 0.64);
  const y = height * (0.22 + Math.sin(time * 0.7) * 0.12);
  const radius = Math.max(width, height) * 0.38;

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

  gradient.addColorStop(0, withAlpha(primaryColor, intensity.glowStart));
  gradient.addColorStop(0.45, withAlpha(primaryColor, intensity.glowMid));
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCircuitLines(intensity: BackgroundIntensity): void {
  if (!ctx) {
    return;
  }

  ctx.lineWidth = 1;

  for (const line of lines) {
    const alpha = intensity.lineBase + Math.sin(time * 1.25 + line.delay * 8) * intensity.linePulse;

    ctx.beginPath();
    ctx.moveTo(line.from.x, line.from.y);
    ctx.lineTo(line.to.x, line.to.y);
    ctx.strokeStyle = withAlpha(mutedColor, alpha);
    ctx.stroke();

    if (line.delay > 0.72) {
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.strokeStyle = withAlpha(primaryColor, intensity.lineAccent);
      ctx.stroke();
    }
  }
}

function drawCircuitNodes(intensity: BackgroundIntensity): void {
  if (!ctx) {
    return;
  }

  for (const node of nodes) {
    const pulse = 0.5 + Math.sin(time * 1.6 + node.pulse * 10) * 0.5;
    const radius = 1 + pulse * 1.05;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(primaryColor, intensity.nodeBase + pulse * intensity.nodePulse);
    ctx.fill();
  }
}

function drawPackets(intensity: BackgroundIntensity): void {
  if (!ctx) {
    return;
  }

  for (let index = 0; index < lines.length; index += 4) {
    const line = lines[index];
    const progress = (time * 0.16 + line.delay) % 1;
    const fade = Math.sin(progress * Math.PI);

    const x = line.from.x + (line.to.x - line.from.x) * progress;
    const y = line.from.y + (line.to.y - line.from.y) * progress;

    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(primaryColor, intensity.packet * fade);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(primaryColor, intensity.packetGlow * fade);
    ctx.fill();
  }
}

function getIntensity(): BackgroundIntensity {
  if (isDark) {
    return {
      glowStart: 0.14,
      glowMid: 0.052,
      lineBase: 0.04,
      linePulse: 0.014,
      lineAccent: 0.052,
      nodeBase: 0.085,
      nodePulse: 0.075,
      packet: 0.26,
      packetGlow: 0.06,
    };
  }

  return {
    glowStart: 0.2,
    glowMid: 0.08,
    lineBase: 0.075,
    linePulse: 0.022,
    lineAccent: 0.085,
    nodeBase: 0.12,
    nodePulse: 0.095,
    packet: 0.34,
    packetGlow: 0.085,
  };
}

function clear(): void {
  ctx?.clearRect(0, 0, width, height);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const value =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex;

    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
  }

  return color;
}
