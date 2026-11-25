// The garden (Christian) wedding invite's ceremony pictures (chapter 2),
// drawn in code. Each a little still life or scene, with one thing that moves:
//   chapel  – a small white chapel at golden hour, fireflies   (Wedding service, Ceremony)
//   rings   – two gold rings on ivory linen, the diamond glints (Engagement, Magni)
//   bouquet – a bouquet of white and blush roses, petals falling (Bridal shower)
//   cake    – a three-tier white cake with roses, gold glitter falling (Cake, Tea)
//   toast   – two champagne glasses touching, bubbles rising   (Reception, Dinner)
//   candles – a unity candle between two tapers, all lit       (Prayer, Rehearsal)
//
// Each is `size` px square (shown cut into a circle): paint(ctx, size) draws
// the still part once; live(size) returns draw(ctx, t, dt) for the moving part.
// Which ceremony gets which: pictures.js.

import { silk, velvet } from '../texture';
import { foil, leaf, sparkle, crystal, stamp, seeded } from '../../themes/draw';
import { paper } from '../art';
import { fairyLight, bokehLight } from '../lanterns';
import { treeLine } from '../garden/garden';
import { rose } from './flowers';
import { lamplight, scatter, bigFlame, fallingPetals } from './picture-kit';

const SAGE_LEAVES = ['#7E9A86', '#5F7D69', '#8FAA94'];

// Roses and eucalyptus leaves heaped around (x, y).
function roses(ctx, x, y, spread, count, seed) {
  const r = seeded(seed);
  for (let i = 0; i < count * 1.3; i++) {
    const a = r() * Math.PI * 2;
    const d = spread * (0.6 + r() * 0.6);
    stamp(ctx, leaf(Math.round(30 + r() * 26), SAGE_LEAVES[i % 3]), x + Math.cos(a) * d, y + Math.sin(a) * d, { angle: a + Math.PI / 2 });
  }
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * spread;
    stamp(ctx, rose(Math.round(22 + r() * 16), r() < 0.35 ? 'blush' : 'white'), x + Math.cos(a) * d, y + Math.sin(a) * d, { angle: r() * 6 });
  }
}

// A gold ring seen at a slant: an ellipse of thick gold with light on it.
function ring(ctx, x, y, R, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  paper(ctx, () => {
    ctx.strokeStyle = foil(ctx, -R, -R, R, R, 'gold');
    ctx.lineWidth = R * 0.22;
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
  }, { color: 'rgba(40, 30, 20, 0.45)', blur: 10, y: 6 });
  ctx.strokeStyle = 'rgba(255, 248, 220, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.06, R * 0.66, 0, Math.PI * 1.1, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

// Where the engagement ring's diamond sits.
const diamondOf = (size) => [size * 0.4, size * 0.33];

export const GARDEN_PICTURES = {
  chapel: {
    paint(ctx, size) {
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, '#5A3F6A');
      g.addColorStop(0.45, '#D98A78');
      g.addColorStop(0.75, '#F6CE98');
      g.addColorStop(1, '#F9DDAE');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      treeLine(ctx, size, size * 0.74, size, '#8A6070', 21);
      // the chapel: white walls, a steep roof, a steeple with a cross
      const cx = size / 2;
      const base = size * 0.84;
      paper(ctx, () => {
        ctx.fillStyle = '#F3ECE2';
        ctx.fillRect(cx - 58, base - 86, 116, 86); // the nave
        ctx.fillRect(cx - 17, base - 150, 34, 70); // the tower
        ctx.beginPath(); // the steeple
        ctx.moveTo(cx - 21, base - 150);
        ctx.lineTo(cx, base - 196);
        ctx.lineTo(cx + 21, base - 150);
        ctx.fill();
      }, { color: 'rgba(60, 30, 40, 0.35)', blur: 10, y: 4 });
      ctx.fillStyle = '#7A5A66'; // the roof
      ctx.beginPath();
      ctx.moveTo(cx - 66, base - 84);
      ctx.lineTo(cx, base - 124);
      ctx.lineTo(cx + 66, base - 84);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#F3ECE2'; // the tower in front of the roof
      ctx.fillRect(cx - 17, base - 124, 34, 40);
      ctx.fillStyle = foil(ctx, cx - 6, 0, cx + 6, 0, 'gold'); // the cross
      ctx.fillRect(cx - 1.2, base - 214, 2.4, 20);
      ctx.fillRect(cx - 6, base - 208, 12, 2.4);
      // the doors open, warm light inside; a round window above
      const lit = ctx.createLinearGradient(0, base - 52, 0, base);
      lit.addColorStop(0, '#FFE4A8');
      lit.addColorStop(1, '#F2A85A');
      ctx.fillStyle = lit;
      ctx.beginPath();
      ctx.moveTo(cx - 14, base);
      ctx.lineTo(cx - 14, base - 36);
      ctx.arc(cx, base - 36, 14, Math.PI, 0);
      ctx.lineTo(cx + 14, base);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, base - 108 - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      for (const dx of [-38, 38]) {
        ctx.beginPath(); // tall side windows
        ctx.moveTo(cx + dx - 6, base - 30);
        ctx.lineTo(cx + dx - 6, base - 58);
        ctx.arc(cx + dx, base - 58, 6, Math.PI, 0);
        ctx.lineTo(cx + dx + 6, base - 30);
        ctx.fill();
      }
      // the lawn in front, roses by the door
      ctx.fillStyle = '#5E6B44';
      ctx.fillRect(0, base, size, size - base);
      roses(ctx, cx - 44, base + 4, 16, 5, 3);
      roses(ctx, cx + 44, base + 4, 16, 5, 5);
      lamplight(ctx, size, '255, 210, 150', 0.1);
    },
    // fireflies drifting in the dusk
    live: (size) => {
      const r = seeded(13);
      const flies = Array.from({ length: 12 }, () => ({ x: r() * size, y: size * (0.3 + r() * 0.6), phase: r() * 6, speed: 0.3 + r() * 0.5 }));
      return (ctx, t) => {
        for (const f of flies) {
          const x = f.x + Math.sin(t * f.speed + f.phase) * 14;
          const y = f.y + Math.cos(t * f.speed * 0.8 + f.phase) * 10;
          stamp(ctx, fairyLight(12), x, y, { alpha: 0.5 + 0.5 * Math.sin(t * 2 + f.phase) });
        }
      };
    },
  },

  rings: {
    paint(ctx, size) {
      silk(ctx, size, 0, size, { base: '#EFE4D6', light: '#FFF8EE', dark: '#C9B8A2', motif: 46, sheen: true });
      roses(ctx, size * 0.78, size * 0.78, 34, 6, 9);
      scatter(ctx, size, 61, 10);
      ring(ctx, size * 0.44, size * 0.5, 50, -0.35);
      ring(ctx, size * 0.6, size * 0.56, 44, 0.3);
      // the engagement ring's diamond on top
      const [dx, dy] = diamondOf(size);
      stamp(ctx, crystal(22), dx, dy, { angle: Math.PI });
      lamplight(ctx, size, '255, 225, 180', 0.12);
    },
    // a glint travels round the diamond
    live: (size) => {
      const [dx, dy] = diamondOf(size);
      return (ctx, t) => {
        const k = (Math.sin(t * 1.6) + 1) / 2;
        stamp(ctx, sparkle(16, '#FFFFFF'), dx + 4, dy - 6, { alpha: k, angle: t * 0.5, scale: 0.6 + k * 0.6 });
        stamp(ctx, sparkle(10, '#FFF1C8'), dx - 7, dy + 2, { alpha: 1 - k });
      };
    },
  },

  bouquet: {
    paint(ctx, size) {
      silk(ctx, size, 0, size, { base: '#66806E', light: '#86A08C', dark: '#3A4C40', motif: 46, sheen: true });
      // satin ribbon tails trailing down
      ctx.strokeStyle = '#F6EEE4';
      ctx.lineCap = 'round';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(size * 0.5, size * 0.55);
      ctx.bezierCurveTo(size * 0.45, size * 0.75, size * 0.62, size * 0.8, size * 0.56, size * 0.98);
      ctx.moveTo(size * 0.52, size * 0.55);
      ctx.bezierCurveTo(size * 0.7, size * 0.7, size * 0.66, size * 0.86, size * 0.8, size * 0.94);
      ctx.stroke();
      roses(ctx, size * 0.5, size * 0.44, 62, 15, 17);
      lamplight(ctx, size, '255, 225, 190', 0.14);
    },
    live: (size) => fallingPetals(size, ['#F2C9C0', '#FBF4EA', '#E8A598'], 7, 21),
  },

  cake: {
    paint(ctx, size) {
      velvet(ctx, size, 0, size, { from: '#4E6358', to: '#2E3D36', fold: 36 });
      const cx = size / 2;
      // the gold stand
      paper(ctx, () => {
        ctx.fillStyle = foil(ctx, cx - 90, 0, cx + 90, 0, 'gold');
        ctx.beginPath();
        ctx.ellipse(cx, size * 0.86, 92, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 10, size * 0.86, 20, 30);
      }, { color: 'rgba(0, 0, 0, 0.45)', blur: 12, y: 6 });
      // three tiers, bottom up
      [[80, 58], [60, 50], [42, 44]].reduce((bottom, [half, h]) => {
        const top = bottom - h;
        ctx.fillStyle = '#FBF5EC';
        ctx.fillRect(cx - half, top, half * 2, h);
        ctx.beginPath();
        ctx.ellipse(cx, top, half, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        const shade = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
        shade.addColorStop(0, 'rgba(150, 120, 100, 0.22)');
        shade.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
        shade.addColorStop(1, 'rgba(150, 120, 100, 0.28)');
        ctx.fillStyle = shade;
        ctx.fillRect(cx - half, top, half * 2, h);
        ctx.fillStyle = '#EADFCF'; // the piped pearls along its foot
        for (let x = cx - half + 4; x < cx + half; x += 7) {
          ctx.beginPath();
          ctx.arc(x, bottom - 2, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        return top;
      }, size * 0.85);
      // roses cascading down one side
      roses(ctx, cx + 30, size * 0.36, 16, 4, 23);
      roses(ctx, cx + 56, size * 0.56, 14, 3, 25);
      roses(ctx, cx + 70, size * 0.76, 14, 3, 27);
      lamplight(ctx, size, '255, 220, 170', 0.16);
    },
    // gold glitter drifting down
    live: (size) => {
      const r = seeded(29);
      const bits = Array.from({ length: 14 }, () => ({ x: r() * size, y: r() * size, fall: 6 + r() * 8, phase: r() * 6 }));
      return (ctx, t, dt) => {
        for (const b of bits) {
          b.y += b.fall * dt;
          if (b.y > size + 6) b.y = -6;
          stamp(ctx, sparkle(8), b.x + Math.sin(t + b.phase) * 6, b.y, { alpha: 0.5 + 0.5 * Math.sin(t * 3 + b.phase), angle: t + b.phase });
        }
      };
    },
  },

  toast: {
    paint(ctx, size) {
      const g = ctx.createRadialGradient(size / 2, size * 0.4, 0, size / 2, size * 0.4, size * 0.8);
      g.addColorStop(0, '#6A4A52');
      g.addColorStop(1, '#2A1E2A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      // party lights far behind, out of focus
      const r = seeded(33);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) stamp(ctx, bokehLight(Math.round(24 + r() * 40), i % 3), r() * size, r() * size * 0.7);
      ctx.restore();
      // two flutes leaning together, touching at the rim
      for (const [x, lean] of [[size * 0.38, 0.16], [size * 0.62, -0.16]]) flute(ctx, x, size * 0.9, lean);
      lamplight(ctx, size, '255, 210, 150', 0.08);
    },
    // bubbles rising in both glasses
    live: (size) => {
      const r = seeded(37);
      const bubbles = Array.from({ length: 16 }, (_, i) => ({ glass: i % 2, k: r(), speed: 0.12 + r() * 0.15, wobble: r() * 6 }));
      return (ctx, t, dt) => {
        ctx.fillStyle = 'rgba(255, 250, 225, 0.85)';
        for (const b of bubbles) {
          b.k += b.speed * dt;
          if (b.k > 1) b.k = 0;
          const [x, lean] = b.glass ? [size * 0.62, -0.16] : [size * 0.38, 0.16];
          // up the bowl of the glass (see flute): from the bottom of the wine to its top
          const y = -110 - b.k * 70;
          ctx.save();
          ctx.translate(x, size * 0.9);
          ctx.rotate(lean);
          ctx.scale(FLUTE, FLUTE);
          ctx.beginPath();
          ctx.arc(Math.sin(t * 2 + b.wobble) * 4, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };
    },
  },

  candles: {
    paint(ctx, size) {
      velvet(ctx, size, 0, size, { from: '#3E2A3A', to: '#1E141E', fold: 38 });
      const cx = size / 2;
      const base = size * 0.8;
      // greenery and roses round the foot
      roses(ctx, cx, base + 8, 80, 12, 41);
      // the tall unity candle and the two tapers
      for (const [x, w, h] of [[cx - 62, 12, 120], [cx + 62, 12, 120], [cx, 34, 150]]) {
        paper(ctx, () => {
          const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
          g.addColorStop(0, '#E2D6C6');
          g.addColorStop(0.45, '#FFFBF4');
          g.addColorStop(1, '#D6C8B6');
          ctx.fillStyle = g;
          ctx.fillRect(x - w / 2, base - h, w, h);
        }, { color: 'rgba(0, 0, 0, 0.5)', blur: 12, y: 6 });
        ctx.fillStyle = foil(ctx, x - w, 0, x + w, 0, 'gold'); // gold holders
        ctx.fillRect(x - w / 2 - 4, base - 6, w + 8, 8);
      }
      // a fine gold band on the unity candle
      ctx.fillStyle = foil(ctx, cx - 17, 0, cx + 17, 0, 'gold');
      ctx.fillRect(cx - 17, base - 92, 34, 3);
      roses(ctx, cx, base - 6, 30, 4, 43);
      lamplight(ctx, size, '255, 180, 110', 0.2);
    },
    live: (size) => (ctx, t) => {
      const base = size * 0.8;
      bigFlame(ctx, size / 2 - 62, base - 120, t, 1, 1);
      bigFlame(ctx, size / 2 + 62, base - 120, t, 1, 3);
      bigFlame(ctx, size / 2, base - 150, t, 1.4, 5);
    },
  },
};

// A champagne flute leaning by `lean` radians, standing at (x, y), drawn
// at FLUTE × its 200 px height so both fit inside the circle.
const FLUTE = 0.78;
function flute(ctx, x, y, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(FLUTE, FLUTE);
  ctx.strokeStyle = 'rgba(255, 250, 240, 0.75)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); // foot, stem, bowl
  ctx.ellipse(0, 0, 22, 4, 0, 0, Math.PI * 2);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -100);
  ctx.moveTo(-6, -100);
  ctx.quadraticCurveTo(-18, -160, -15, -200);
  ctx.lineTo(15, -200);
  ctx.quadraticCurveTo(18, -160, 6, -100);
  ctx.closePath();
  ctx.stroke();
  // the champagne, gold, up to near the rim
  const wine = ctx.createLinearGradient(0, -185, 0, -100);
  wine.addColorStop(0, 'rgba(250, 215, 130, 0.85)');
  wine.addColorStop(1, 'rgba(225, 170, 80, 0.85)');
  ctx.fillStyle = wine;
  ctx.beginPath();
  ctx.moveTo(-6, -102);
  ctx.quadraticCurveTo(-17, -150, -15, -185);
  ctx.lineTo(15, -185);
  ctx.quadraticCurveTo(17, -150, 6, -102);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // a highlight down the glass
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-11, -190);
  ctx.quadraticCurveTo(-13, -160, -6, -120);
  ctx.stroke();
  ctx.restore();
}
