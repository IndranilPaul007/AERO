import React from 'react';
import { ChevronRight } from 'lucide-react';

// Exact menu items from the video frame
const menuSections = [
  'Technology',
  'Gallery',
  'SuperShift Guidance',
  'Search & Rescue',
  'Pre-Order',
  'Developer Console'
];

export default function ControlSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="absolute top-1/4 right-0 z-20 w-72 bg-black/40 backdrop-blur-xl border-l border-t border-white/10 rounded-l-2xl py-4 shadow-2xl flex flex-col pointer-events-auto">
      
      <div className="flex flex-col">
        {menuSections.map((item) => {
          const isActive = activeTab === item;
          return (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`flex items-center justify-between w-full px-6 py-4 text-sm font-semibold tracking-wide transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-white/10 to-transparent text-white border-l-2 border-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <span>{item}</span>
              {/* Only show the arrow if the tab is active or hovered */}
              <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-white' : 'text-transparent'}`} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}