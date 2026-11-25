// The spray of flowers that spills over the edge of each ceremony's picture
// (chapter 2), like the fresh flowers tucked into a printed invitation.
//
// Cream champa blossoms (frangipani: five waxy petals turning like a
// pinwheel, warm yellow in the middle), a few closed buds, glossy dark
// leaves and one small marigold.
//
//   blossom(size)                 – one champa flower (a sprite, see themes/draw.js)
//   rose(size, tone)              – a garden rose seen from above ('white', 'blush', 'lilac' or 'crimson')
//   flowerSpray(ctx, w, h, seed, look)
//                                 – the whole spray, drawn into a w × h box,
//                                   growing out of its bottom-left corner;
//                                   look 'garden' = white and blush roses with
//                                   eucalyptus (the Christian invite)

import { sprite, stamp, leaf, marigold, seeded } from '../../themes/draw';

// One champa (frangipani) flower, `size` px across.
export function blossom(size) {
  return sprite(`champa-${size}`, size + 6, size + 6, (ctx) => {
    const s = size / 2;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i / 5) * Math.PI * 2);
      // each petal is a soft, wide teardrop leaning to one side (the pinwheel)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.18, -s * 0.5, s * 0.95, -s * 0.62, s * 0.98, -s * 0.12);
      ctx.bezierCurveTo(s * 1.0, s * 0.18, s * 0.45, s * 0.2, 0, 0);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, '#F2B640');
      g.addColorStop(0.28, '#F8DE9A');
      g.addColorStop(0.55, '#FFF7E6');
      g.addColorStop(1, '#EEDCC0');
      ctx.fillStyle = g;
      ctx.shadowColor = 'rgba(80, 50, 20, 0.28)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // a fine crease down the petal
      ctx.strokeStyle = 'rgba(170, 130, 80, 0.25)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.05);
      ctx.quadraticCurveTo(s * 0.55, -s * 0.28, s * 0.85, -s * 0.18);
      ctx.stroke();
      ctx.restore();
    }
    // the deep yellow throat
    const c = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.28);
    c.addColorStop(0, '#D98A1E');
    c.addColorStop(1, 'rgba(240, 180, 60, 0)');
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
  });
}

// A garden rose seen from above: rings of soft cupped petals turning in
// to a tight swirled heart. `tone`: 'white' (ivory), 'blush' or 'lilac'.
const ROSE_TONES = {
  white: { edge: '#E6D9C8', mid: '#F7F1E6', heart: '#EBDCC6', line: 'rgba(150, 120, 90, 0.35)' },
  blush: { edge: '#E0A99C', mid: '#F4D2C8', heart: '#D9978A', line: 'rgba(150, 80, 70, 0.35)' },
  lilac: { edge: '#B9A0C4', mid: '#E4D6EC', heart: '#A68AB4', line: 'rgba(110, 80, 130, 0.35)' },
  crimson: { edge: '#6E1222', mid: '#B4283C', heart: '#5A0C1A', line: 'rgba(60, 5, 15, 0.45)' },
};
export function rose(size, tone = 'white') {
  const c = ROSE_TONES[tone];
  return sprite(`rose-${size}-${tone}`, size + 6, size + 6, (ctx) => {
    const s = size / 2;
    // three rings of petals, outer ones bigger, each ring turned a little
    [[1, 7, 0.55], [0.72, 6, 0.48], [0.46, 5, 0.42]].forEach(([reach, count, width], ring) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.5;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(-s * width * 0.5, -s * 0.05);
        ctx.bezierCurveTo(-s * width * 0.7, -s * reach * 0.8, s * width * 0.7, -s * reach * 0.8, s * width * 0.5, -s * 0.05);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, -s * reach);
        g.addColorStop(0, c.heart);
        g.addColorStop(0.55, c.mid);
        g.addColorStop(1, c.edge);
        ctx.fillStyle = g;
        ctx.shadowColor = 'rgba(80, 50, 40, 0.25)';
        ctx.shadowBlur = 2.5;
        ctx.shadowOffsetY = 1;
        ctx.fill();
        ctx.restore();
      }
    });
    // the swirled heart
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let k = 0; k < 26; k++) {
      const a = k * 0.55;
      const r = s * 0.04 + k * s * 0.0085;
      k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.stroke();
    // light from the top left
    ctx.globalCompositeOperation = 'source-atop';
    const light = ctx.createRadialGradient(-s * 0.4, -s * 0.4, 0, 0, 0, s * 1.1);
    light.addColorStop(0, 'rgba(255, 255, 250, 0.25)');
    light.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    light.addColorStop(1, 'rgba(60, 30, 20, 0.2)');
    ctx.fillStyle = light;
    ctx.fillRect(-s - 3, -s - 3, size + 6, size + 6);
  });
}

// A closed bud: a slim twisted cream spindle.
function bud(length) {
  return sprite(`champa-bud-${length}`, length * 0.4, length + 4, (ctx) => {
    const h = length / 2;
    const w = length * 0.13;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.bezierCurveTo(w * 1.6, -h * 0.4, w * 1.2, h * 0.5, 0, h);
    ctx.bezierCurveTo(-w * 1.2, h * 0.5, -w * 1.6, -h * 0.4, 0, -h);
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, '#E9D3AE');
    g.addColorStop(0.5, '#FFF6E2');
    g.addColorStop(1, '#E2C79C');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(170, 120, 60, 0.3)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.6, -h * 0.5);
    ctx.quadraticCurveTo(w * 0.5, 0, -w * 0.2, h * 0.8);
    ctx.stroke();
  });
}

// The spray, rooted in the bottom-left corner of a w × h box and reaching
// up and to the right. (Flip the canvas for one reaching the other way.)
export function flowerSpray(ctx, w, h, seed = 1, look = 'hindu') {
  if (look === 'garden') return roseSpray(ctx, w, h, seed);
  const r = seeded(seed);
  const x0 = w * 0.3;
  const y0 = h * 0.72;
  // glossy leaves fanning out behind
  const leaves = [
    [-2.2, 92, '#2F4A26'],
    [-1.25, 100, '#3A5A2C'],
    [-0.55, 88, '#2F4A26'],
    [0.35, 96, '#46663A'],
    [1.15, 84, '#3A5A2C'],
    [2.5, 70, '#46663A'],
  ];
  for (const [a, length, color] of leaves) {
    const angle = a + (r() - 0.5) * 0.25;
    const d = length * 0.42;
    stamp(ctx, leaf(length, color), x0 + Math.sin(angle) * d, y0 - Math.cos(angle) * d, { angle });
  }
  // buds peeking out
  stamp(ctx, bud(34), x0 + 62, y0 - 70, { angle: 0.75 });
  stamp(ctx, bud(28), x0 - 50, y0 - 46, { angle: -0.95 });
  // a small marigold tucked in low
  stamp(ctx, marigold(13, 'saffron'), x0 - 30, y0 + 12);
  // the blossoms, back to front
  stamp(ctx, blossom(46), x0 + 44, y0 - 26, { angle: 0.6 });
  stamp(ctx, blossom(40), x0 - 22, y0 - 40, { angle: 2.1 });
  stamp(ctx, blossom(54), x0 + 8, y0 + 4, { angle: 1.2 });
}

// The garden invite's spray: white and blush roses, a bud, and long soft
// eucalyptus-green leaves.
function roseSpray(ctx, w, h, seed) {
  const r = seeded(seed);
  const x0 = w * 0.3;
  const y0 = h * 0.72;
  const leaves = [
    [-2.1, 88, '#7E9A86'],
    [-1.2, 104, '#5F7D69'],
    [-0.45, 92, '#8FAA94'],
    [0.4, 98, '#5F7D69'],
    [1.2, 86, '#7E9A86'],
    [2.4, 72, '#8FAA94'],
  ];
  for (const [a, length, color] of leaves) {
    const angle = a + (r() - 0.5) * 0.25;
    const d = length * 0.42;
    stamp(ctx, leaf(length, color), x0 + Math.sin(angle) * d, y0 - Math.cos(angle) * d, { angle });
  }
  stamp(ctx, bud(30), x0 + 60, y0 - 70, { angle: 0.7 });
  stamp(ctx, rose(30, 'blush'), x0 - 34, y0 - 34, { angle: r() * 6 });
  stamp(ctx, rose(40, 'white'), x0 + 40, y0 - 22, { angle: r() * 6 });
  stamp(ctx, rose(50, 'white'), x0 + 2, y0 + 4, { angle: r() * 6 });
}
