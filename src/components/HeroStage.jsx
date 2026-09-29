import React, { useRef, useEffect } from 'react';
import DroneScene from './DroneScene';

export default function HeroStage() {
  const scrollProgressRef = useRef(0);

  // References for continuous 60FPS background crossfades
  const bgRefs = {
    bg0: useRef(null), // Stage 0: Dark Nordic Forest
    bg1: useRef(null), // Stage 1: Glacial Arctic Peak
    bg2: useRef(null), // Stage 2: Alpine Storm Ridge
    bg3: useRef(null), // Stage 3: High-Altitude Clouds
    bg4: useRef(null), // Stage 4: Dark Volcanic Canyon
    bg5: useRef(null), // Stage 5: Aurora Night Sky
  };

  const backgrounds = [
    { ref: bgRefs.bg0, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85', defaultOpacity: 1 },
    { ref: bgRefs.bg1, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85', defaultOpacity: 0 },
    { ref: bgRefs.bg2, url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2560&q=85', defaultOpacity: 0 },
    { ref: bgRefs.bg3, url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2560&q=85', defaultOpacity: 0 },
    { ref: bgRefs.bg4, url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=85', defaultOpacity: 0 },
    { ref: bgRefs.bg5, url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=2560&q=85', defaultOpacity: 0 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScrollable > 0) {
        const progress = Math.min(Math.max(window.scrollY / totalScrollable, 0), 1);
        scrollProgressRef.current = progress;

        // Dynamic 60FPS background crossfade
        const bgProgress = progress * 5;
        const setBg = (ref, target) => {
          if (ref.current) ref.current.style.opacity = target;
        };

        setBg(bgRefs.bg0, Math.max(1 - Math.abs(bgProgress - 0), 0));
        setBg(bgRefs.bg1, Math.max(1 - Math.abs(bgProgress - 1), 0));
        setBg(bgRefs.bg2, Math.max(1 - Math.abs(bgProgress - 2), 0));
        setBg(bgRefs.bg3, Math.max(1 - Math.abs(bgProgress - 3), 0));
        setBg(bgRefs.bg4, Math.max(1 - Math.abs(bgProgress - 4), 0));
        setBg(bgRefs.bg5, Math.max(1 - Math.abs(bgProgress - 5), 0));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    /* Native 600vh Scroll Track */
    <div className="relative w-full h-[600vh] bg-[#05070b]">
      {/* Sticky Fullscreen Viewport Layer */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Multi-Environment Background Image Stack */}
        <div className="absolute inset-0 pointer-events-none">
          {backgrounds.map((bg, idx) => (
            <div
              key={idx}
              ref={bg.ref}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${bg.url}')`,
                opacity: bg.defaultOpacity,
              }}
            />
          ))}

          {/* Contrast & Depth Gradients */}
          <div className="absolute inset-0 bg-[#05070b]/75 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b]/90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070b]/90 via-transparent to-[#05070b]/90"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px]"></div>
        </div>

        {/* 3D WebGL Canvas Scene & UI Callouts */}
        <div className="absolute inset-0">
          <DroneScene scrollProgressRef={scrollProgressRef} />
        </div>
      </div>
    </div>
  );
}