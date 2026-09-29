import React, { useState, useEffect } from 'react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import HeroStage from './components/HeroStage';
import PreOrderModal from './components/PreOrderModal';
import AudioController from './components/AudioController';

export default function App() {
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);

  // Global event listener so buttons in DroneScene or Navbar can trigger the modal
  useEffect(() => {
    const handleOpenModal = () => setIsPreOrderOpen(true);
    window.addEventListener('open-preorder', handleOpenModal);
    return () => window.removeEventListener('open-preorder', handleOpenModal);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#05070b] select-none text-white antialiased">
      {/* Zero-FOUC Asset & Terrain Preloader */}
      <Preloader />

      {/* Pinned Top Navigation */}
      <Navbar onOpenPreOrder={() => setIsPreOrderOpen(true)} />

      {/* Main 600vh Native Scrollytelling Stage */}
      <HeroStage />

      {/* Tactical Airframe Reservation Drawer */}
      <PreOrderModal 
        isOpen={isPreOrderOpen} 
        onClose={() => setIsPreOrderOpen(false)} 
      />

      {/* Ambient Sci-Fi Audio Controller (Synthesized Web Audio API) */}
      <AudioController />
    </div>
  );
}