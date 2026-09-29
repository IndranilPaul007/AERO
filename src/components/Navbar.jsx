import React, { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Technology', hasSubmenu: true },
    { label: 'Gallery', hasSubmenu: false },
    { label: 'HyperShift Guidance', hasSubmenu: false },
    { label: 'Search & Rescue', hasSubmenu: false },
    { label: 'Pre-Order', hasSubmenu: false },
    { label: 'Developer Console', hasSubmenu: false },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between pointer-events-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <span className="text-2xl font-black tracking-widest text-white uppercase font-sans">
          AERO
        </span>
      </div>

      {/* Main Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 bg-black/40 backdrop-blur-md border border-white/10 px-8 py-2.5 rounded-full text-xs font-medium tracking-wider text-white/80 pointer-events-auto shadow-2xl">
        <a href="#home" className="hover:text-white transition-colors">Home</a>
        <a href="#videos" className="hover:text-white transition-colors">Videos</a>
        <a href="#corrections" className="hover:text-white transition-colors">Corrections</a>
        <a href="#exoskeletons" className="hover:text-white transition-colors">Exoskeletons</a>
        <button className="flex items-center gap-1 hover:text-white transition-colors">
          Compare
          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </nav>

      {/* Right Action Icons & Menu Trigger */}
      <div className="flex items-center gap-5 pointer-events-auto">
        <button className="text-xs font-semibold text-white/90 hover:text-white transition-colors tracking-wide">
          Log In
        </button>

        <button aria-label="Search" className="text-white/80 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Dynamic Hamburger / Close Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
          className="flex flex-col justify-center items-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-white backdrop-blur-md"
        >
          <div className="w-4 flex flex-col gap-1.5 items-center">
            <span
              className={`h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? 'w-4 rotate-45 translate-y-2' : 'w-4'
              }`}
            />
            <span
              className={`h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'w-3 self-end'
              }`}
            />
            <span
              className={`h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? 'w-4 -rotate-45 -translate-y-2' : 'w-4'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Backdrop overlay (clicking outside closes the drawer) */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs -z-10 pointer-events-auto transition-opacity duration-300"
        />
      )}

      {/* Slide-out Menu Panel */}
      <div
        className={`fixed top-24 right-8 w-72 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 transform transition-all duration-300 ease-out origin-top-right ${
          isMenuOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
            >
              <span>{item.label}</span>
              {item.hasSubmenu ? (
                <svg
                  className="w-4 h-4 text-white/40 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}