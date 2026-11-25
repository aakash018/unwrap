// The Preview tab with a device switcher: Mobile · Tablet · Desktop.
//
// The gift is designed phone-first. To see it the way guests on each
// device will:
//   Desktop – the page as this computer shows it (filling it)
//   Mobile  – inside a 390 × 844 frame (an iPhone-sized screen)
//   Tablet  – inside an 820 × 1180 frame (an iPad-sized screen)
// Mobile and Tablet load the same preview inside an <iframe> of that exact
// size, so it scrolls, fits and pins exactly as it would on that device.
// The frame is shrunk to fit the window when it's too big.
//
// On a real phone the bar isn't shown: the phone IS the preview.
//   saved, since, channel – see Preview.jsx
//   framedUrl      – the address of the plain preview, for the frames
'use client';

import { useEffect, useState } from 'react';
import Preview from './Preview';

const DEVICES = {
  mobile: { label: 'Mobile', width: 390, height: 844, radius: 46, bezel: 10 },
  tablet: { label: 'Tablet', width: 820, height: 1180, radius: 30, bezel: 14 },
  desktop: { label: 'Desktop' },
};
const SAVED = 'unwrap-preview-device'; // remembers the last choice

function useWindowSize() {
  const read = () => ({ width: window.innerWidth, height: window.innerHeight });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const update = () => setSize(read());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function readSaved() {
  try {
    return DEVICES[localStorage.getItem(SAVED)] ? localStorage.getItem(SAVED) : 'desktop';
  } catch {
    return 'desktop';
  }
}

export default function DevicePreview({ saved, since, channel, framedUrl }) {
  const [device, setDevice] = useState(readSaved);
  const { width, height } = useWindowSize();

  const choose = (id) => {
    setDevice(id);
    try {
      localStorage.setItem(SAVED, id);
    } catch {
      // private mode: just don't remember it
    }
  };

  // a real phone: no switcher, just the gift
  if (width < 600) return <Preview saved={saved} since={since} channel={channel} />;

  const bar = (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-[#1E1714]/85 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
      {Object.entries(DEVICES).map(([id, d]) => (
        <button
          key={id}
          type="button"
          onClick={() => choose(id)}
          aria-pressed={device === id}
          title={d.width ? `${d.width} × ${d.height}` : 'This window'}
          className={`rounded-full px-4 py-1.5 font-sans text-[13px] transition-colors ${
            device === id ? 'bg-[#F3E9DA] text-[#1E1714]' : 'text-[#F3E9DA]/75 hover:text-[#F3E9DA]'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );

  if (device === 'desktop') {
    return (
      <>
        {bar}
        <Preview saved={saved} since={since} channel={channel} />
      </>
    );
  }

  // Mobile / Tablet: the device's screen, in a dark rounded bezel,
  // shrunk to fit the window if needed
  const d = DEVICES[device];
  const outerW = d.width + d.bezel * 2;
  const outerH = d.height + d.bezel * 2;
  const scale = Math.min(1, (height - 96) / outerH, (width - 48) / outerW);

  return (
    <main
      className="flex min-h-screen items-start justify-center pt-[72px]"
      style={{ background: 'radial-gradient(120% 80% at 50% 0%, #2B211E 0%, #120D0C 60%, #0B0807 100%)' }}
    >
      {bar}
      <div style={{ width: outerW * scale, height: outerH * scale }}>
        <div
          className="origin-top-left bg-[#0A0807] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          style={{ width: outerW, height: outerH, padding: d.bezel, borderRadius: d.radius, transform: `scale(${scale})` }}
        >
          <iframe
            key={device}
            src={framedUrl}
            title={`${d.label} preview`}
            className="block border-0 bg-black"
            style={{ width: d.width, height: d.height, borderRadius: d.radius - d.bezel }}
          />
        </div>
      </div>
    </main>
  );
}
