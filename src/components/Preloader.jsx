import React, { useState, useEffect } from 'react';
import { useProgress, useGLTF } from '@react-three/drei';

// Preload the 3D model buffer immediately
useGLTF.preload('/drone.glb');

const BACKGROUND_URLS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2560&q=85',
  'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2560&q=85',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=85',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=2560&q=85',
];

export default function Preloader() {
  const { progress: modelProgress, active } = useProgress();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Preload background images into browser cache
  useEffect(() => {
    let loadedCount = 0;
    BACKGROUND_URLS.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loadedCount += 1;
        if (loadedCount >= BACKGROUND_URLS.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  // Compute combined loading percentage
  const totalPercent = Math.floor(
    (modelProgress * 0.7) + (imagesLoaded ? 30 : 0)
  );

  useEffect(() => {
    if (totalPercent >= 100 && !active) {
      const timer = setTimeout(() => setIsDone(true), 400);
      const removeTimer = setTimeout(() => setShouldRender(false), 1200);
      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }
  }, [totalPercent, active]);

  if (!shouldRender) return null;

  return (
    <aside
      aria-label="System Initializer"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-10 bg-[#05070b] transition-all duration-700 ease-in-out ${
        isDone ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Top Telemetry Header */}
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span className="text-white font-mono text-xs tracking-widest uppercase">
            AERO TACTICAL // OS BOOT SEQUENCE
          </span>
        </div>
        <div className="text-white/40 font-mono text-[10px] tracking-widest uppercase">
          AIRFRAME RECON MATRIX v4.12
        </div>
      </div>

      {/* Center Reticle & Calibration Readout */}
      <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto">
        {/* Radar Spinner Reticle */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-[spin_6s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border-t border-b border-sky-400/60 animate-[spin_2s_linear_infinite]"></div>
          <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8]"></div>
        </div>

        {/* Dynamic Percentage Display */}
        <div className="flex flex-col items-center">
          <div className="font-mono text-4xl font-black tracking-tight text-white">
            {totalPercent}%
          </div>
          <p className="text-white/50 font-mono text-[11px] tracking-[0.25em] uppercase mt-2">
            Buffering Subsystems & Terrain Shaders
          </p>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_10px_#38bdf8]"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Diagnostics Footer */}
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto border-t border-white/10 pt-4 text-white/40 font-mono text-[10px] tracking-widest uppercase">
        <span>MEM CHECK: OK</span>
        <span>GLTF CACHE: {modelProgress >= 100 ? 'READY' : 'STREAMING'}</span>
        <span>ENVIRONMENT: {imagesLoaded ? 'SYNCHRONIZED' : 'CACHING'}</span>
      </div>
    </aside>
  );
}