import * as THREE from "three";

/** Procedural lunar surface texture drawn on a canvas (no external assets). */
export function createMoonTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#9a9da3";
  ctx.fillRect(0, 0, size, size);

  // mare patches — darker basalt plains
  const mareCount = 9;
  for (let i = 0; i < mareCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 60 + Math.random() * 170;
    const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
    g.addColorStop(0, "rgba(70,73,80,0.55)");
    g.addColorStop(1, "rgba(70,73,80,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // craters with bright rims and shadowed floors
  const craterCount = 260;
  for (let i = 0; i < craterCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.pow(Math.random(), 2.2) * 46;

    const floor = ctx.createRadialGradient(x, y, 0, x, y, r);
    floor.addColorStop(0, "rgba(48,50,56,0.85)");
    floor.addColorStop(0.75, "rgba(78,81,88,0.65)");
    floor.addColorStop(1, "rgba(190,194,202,0.55)");
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // sunlit rim arc
    ctx.strokeStyle = "rgba(226,230,238,0.5)";
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.95, Math.PI * 0.15, Math.PI * 1.05);
    ctx.stroke();
  }

  // fine regolith noise
  for (let i = 0; i < 9000; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Procedural Martian surface texture — rust plains, dark dunes, polar caps. */
export function createMarsTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, "#d99b6c");
  base.addColorStop(0.5, "#b4623c");
  base.addColorStop(1, "#8f452b");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // dark volcanic regions
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * size;
    const y = size * 0.15 + Math.random() * size * 0.7;
    const r = 50 + Math.random() * 160;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(94,45,30,0.5)");
    g.addColorStop(1, "rgba(94,45,30,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // dune streaks
  ctx.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? "70,35,24" : "230,175,135"},0.25)`;
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 40, y - 20, x + 90, y + 25, x + 150, y);
    ctx.stroke();
  }

  // polar caps
  const cap = (top) => {
    const g = ctx.createLinearGradient(0, top ? 0 : size, 0, top ? size * 0.1 : size * 0.9);
    g.addColorStop(0, "rgba(255,252,245,0.92)");
    g.addColorStop(1, "rgba(255,252,245,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, top ? 0 : size * 0.88, size, size * 0.12);
  };
  cap(true);
  cap(false);

  // impact speckle
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1.5 + Math.random() * 10;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(60,28,18,0.6)");
    g.addColorStop(1, "rgba(60,28,18,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
