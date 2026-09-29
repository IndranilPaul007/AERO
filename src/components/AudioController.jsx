import React, { useState, useRef } from 'react';

export default function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

  const toggleAudio = () => {
    if (!isPlaying) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate procedural sci-fi turbine drone resonance
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // Low 55Hz engine drone

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, ctx.currentTime); // Harmonic pitch

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime); // Subtle volume

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      gainNodeRef.current = gain;
      setIsPlaying(true);
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-8 z-40">
      <button
        onClick={toggleAudio}
        aria-label="Toggle Soundscape"
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all shadow-xl font-mono text-[10px] tracking-widest uppercase cursor-pointer"
      >
        <span className="flex items-end gap-0.5 h-3">
          <span className={`w-0.5 bg-sky-400 rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`}></span>
          <span className={`w-0.5 bg-sky-400 rounded-full transition-all ${isPlaying ? 'h-2 animate-pulse delay-75' : 'h-1'}`}></span>
          <span className={`w-0.5 bg-sky-400 rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse delay-150' : 'h-1'}`}></span>
        </span>
        <span>{isPlaying ? 'AUDIO // ENGAGED' : 'AUDIO // MUTED'}</span>
      </button>
    </div>
  );
}