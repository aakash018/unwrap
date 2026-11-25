// Scratch card — rub the card with a finger or mouse to reveal what's hidden.
// The cover is drawn on a <canvas>; scratching erases it. Once most of it is
// gone, the rest fades away.
import { useEffect, useRef, useState } from 'react';
import Hint from '../shared/Hint';

const CANVAS_W = 600; // drawing resolution (shown at 300×170, so it stays sharp)
const CANVAS_H = 340;
const BRUSH = 24; // scratch radius, in canvas pixels
const REVEAL_AT = 0.55; // fade the rest once 55% is scratched off

function paintCover(canvas, text) {
  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'source-over';

  // gold foil with a brushed sheen, and a thin frame
  const foil = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  ['#B98E45', '#EBD093', '#C9A154', '#F4E2B0', '#BE9650', '#E3C684'].forEach((color, i, all) => foil.addColorStop(i / (all.length - 1), color));
  ctx.fillStyle = foil;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(90,55,15,0.06)';
    ctx.fillRect(0, (i * 131) % CANVAS_H, CANVAS_W, 1 + (i % 3));
  }
  ctx.strokeStyle = 'rgba(90, 55, 20, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, CANVAS_W - 36, CANVAS_H - 36);

  ctx.fillStyle = '#5A3A30';
  ctx.font = '44px Kalam, cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2);
}

// What fraction of the cover has been scratched away (0–1)?
function scratchedAmount(canvas) {
  const { data } = canvas.getContext('2d').getImageData(0, 0, CANVAS_W, CANVAS_H);
  let clear = 0;
  for (let i = 3; i < data.length; i += 4 * 16) if (data[i] === 0) clear++; // sample every 16th pixel
  return clear / (data.length / (4 * 16));
}

export default function ScratchCardBlock({ props }) {
  const canvasRef = useRef(null);
  const last = useRef(null); // where the finger just was
  const [revealed, setRevealed] = useState(false);

  // (Re)paint the cover when the block appears, its text changes, or "Reset" is pressed.
  useEffect(() => {
    const canvas = canvasRef.current;
    setRevealed(false);
    paintCover(canvas, props.coverText);
    // repaint once the Kalam font has loaded, so the cover text uses it
    document.fonts?.load('44px Kalam').then(() => paintCover(canvas, props.coverText));
  }, [props.coverText, props.resetKey]);

  const scratch = (e) => {
    if (!(e.buttons & 1)) return; // only while pressed
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // convert screen position → canvas pixels (works at any zoom level)
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    // a stroke from where it was, so a quick swipe leaves no gaps
    ctx.lineCap = 'round';
    ctx.lineWidth = BRUSH * 2;
    ctx.beginPath();
    ctx.moveTo(...(last.current ?? [x, y]));
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = [x, y];
  };

  const checkRevealed = () => {
    if (scratchedAmount(canvasRef.current) >= REVEAL_AT) setRevealed(true);
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative h-[170px] w-[300px] overflow-hidden rounded-xl bg-sheet shadow-paper">
        {/* the hidden surprise */}
        <div className="flex size-full items-center justify-center p-5 text-center">
          <span className="font-display text-[26px] leading-tight whitespace-pre-wrap text-maroon">
            {props.hiddenText}
          </span>
        </div>

        {/* the scratchable cover (data-no-drag: scratching here doesn't move the card) */}
        <canvas
          data-no-drag
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={`absolute inset-0 size-full cursor-crosshair touch-none transition-opacity duration-700 ${
            revealed ? 'pointer-events-none opacity-0' : ''
          }`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            scratch(e);
          }}
          onPointerMove={scratch}
          onPointerUp={checkRevealed}
        />
      </div>

      <Hint>{revealed ? 'surprise!' : 'scratch the card'}</Hint>
    </div>
  );
}
