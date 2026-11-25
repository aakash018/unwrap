// Voice note — a little cassette tape. Press play to hear the recording;
// the reels spin and the bars dance while it plays.
import { useRef, useState } from 'react';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// One cassette reel. Spins while playing.
function Reel({ spinning }) {
  return (
    <span
      className={`block size-7 rounded-full border-[6px] border-dotted border-[#F3E3D3] bg-cocoa ${
        spinning ? 'animate-spin [animation-duration:2.5s]' : ''
      }`}
    />
  );
}

export default function VoiceNoteBlock({ props, preview }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const hasAudio = Boolean(props.src);
  if (preview && !hasAudio) return null; // nothing recorded: receivers don't see an empty tape

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  };

  return (
    <div className="mx-auto flex w-[290px] flex-col gap-3 py-4">
      {/* cassette */}
      <div className="relative h-[180px] rounded-xl bg-[#F3E3D3] p-4 shadow-paper">
        <div className="flex h-[88px] flex-col justify-between rounded-lg bg-[#E9B8A4] px-3 py-2">
          <span className="font-hand text-[17px] text-cocoa">{props.label}</span>
          <div className="flex justify-center gap-14">
            <Reel spinning={playing} />
            <Reel spinning={playing} />
          </div>
        </div>
        <div className="absolute inset-x-14 bottom-0 h-8 bg-cocoa [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]" />
      </div>

      {/* controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!hasAudio}
          aria-label={playing ? 'Pause the voice note' : 'Play the voice note'}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40"
        >
          {playing ? (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" />
              <rect x="14" y="4" width="5" height="16" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4v16l13-8z" />
            </svg>
          )}
        </button>

        {playing ? (
          <span className="flex h-6 flex-1 items-center gap-0.5" aria-hidden="true">
            {[0, -0.2, -0.5, -0.1, -0.7, -0.3, -0.6, -0.4].map((delay, i) => (
              <span
                key={i}
                className="w-1 animate-eq rounded-sm bg-accent"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </span>
        ) : (
          <span className="h-[3px] flex-1 rounded-sm bg-line" />
        )}

        <span className="text-[13px] text-ink-soft tabular-nums">
          {hasAudio ? formatTime(duration) : 'no audio yet'}
        </span>
      </div>

      {hasAudio && (
        <audio
          ref={audioRef}
          src={props.src}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  );
}
