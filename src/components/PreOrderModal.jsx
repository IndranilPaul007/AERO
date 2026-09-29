import React, { useState } from 'react';

export default function PreOrderModal({ isOpen, onClose }) {
  const [tier, setTier] = useState('recon');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    { id: 'recon', name: 'Tactical Recon', price: '$8,400', badge: 'Standard EO/IR' },
    { id: 'survey', name: 'LiDAR Survey', price: '$12,200', badge: 'Dual LiDAR Array' },
    { id: 'defense', name: 'Autonomous Core', price: '$18,900', badge: 'Encrypted Mil-Spec' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#070b12]/95 border border-white/15 p-8 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.95)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-xl mb-4">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Reservation Queued</h3>
            <p className="text-white/50 text-xs font-mono">
              Telemetry uplink confirmed. Priority slot secured.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-400/20">
                Direct Deployment
              </span>
              <h2 className="text-2xl font-bold text-white mt-3">Reserve Airframe</h2>
              <p className="text-white/50 text-xs mt-1">Select specification tier for tactical field allotment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      tier === t.id
                        ? 'bg-sky-500/10 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-white/40">{t.badge}</div>
                    <div className="text-xs font-bold mt-1 text-white">{t.name}</div>
                    <div className="text-xs font-mono text-sky-400 mt-2">{t.price}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <input
                  required
                  type="email"
                  placeholder="Operator or Organization Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400 font-mono"
                />
                <input
                  required
                  type="text"
                  placeholder="Operational Region / Callcode"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-white text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Confirm Priority Allocation
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}