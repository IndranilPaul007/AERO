import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF, Center, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function DroneModel({ finishMode, isExploded, explodeFactorRef }) {
  const droneRef = useRef();
  const { scene } = useGLTF('/drone.glb');

  // Defined PBR Materials
  const materials = useMemo(() => ({
    wireframe: new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      metalness: 0.95,
      roughness: 0.1,
      wireframe: true,
    }),
    stealth: new THREE.MeshStandardMaterial({
      color: '#16191f',
      metalness: 0.88,
      roughness: 0.32,
      wireframe: false,
    }),
    milspec: new THREE.MeshStandardMaterial({
      color: '#2e382b',
      metalness: 0.25,
      roughness: 0.65,
      wireframe: false,
    }),
  }), []);

  // Initialize and cache original positions and radial explode vectors for all meshes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          if (child.name.toLowerCase().includes('ground') || child.name.toLowerCase().includes('plane')) {
            child.visible = false;
          } else {
            // Cache original transform
            if (!child.userData.origPos) {
              child.userData.origPos = child.position.clone();
              
              // Compute outward radial direction from component center
              let dir = new THREE.Vector3();
              if (child.geometry && child.geometry.boundingBox) {
                child.geometry.boundingBox.getCenter(dir);
              }
              if (dir.lengthSq() < 0.001) {
                dir.copy(child.position);
              }
              if (dir.lengthSq() < 0.001) {
                dir.set(0, 1, 0);
              } else {
                dir.normalize();
              }

              // Accentuate vertical separation for payload & rotor tiers
              dir.y *= 1.5;
              dir.normalize();
              child.userData.explodeDir = dir;
            }

            // Apply selected finish
            child.material = materials[finishMode] || materials.wireframe;
          }
        }
      });
    }
  }, [scene, finishMode, materials]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (droneRef.current) {
      // Idle hovering bob
      droneRef.current.position.y = Math.sin(time * 1.2) * 0.025;
    }

    // Smooth continuous lerp for the exploded view state
    const targetFactor = isExploded ? 1.0 : 0.0;
    explodeFactorRef.current = THREE.MathUtils.lerp(explodeFactorRef.current, targetFactor, delta * 3.5);

    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.userData.origPos && child.userData.explodeDir) {
          const offset = child.userData.explodeDir
            .clone()
            .multiplyScalar(explodeFactorRef.current * 18.0); // Scaled explosion displacement
          child.position.copy(child.userData.origPos).add(offset);
        }
      });
    }
  });

  return (
    <group ref={droneRef} position={[0, 0, 0]}>
      <Center>
        <primitive object={scene} scale={0.018} />
      </Center>
    </group>
  );
}

function SceneDirector({ refs, scrollProgressRef, explodeFactorRef }) {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0.8, 5.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const tempVec = useRef(new THREE.Vector3());

  // Calibrated 3D Subsystem coordinates
  const subsystem3DPositions = {
    p1: new THREE.Vector3(0, 0.08, 0.32),       // Subsystem 01: Front Optical Gimbal
    p2: new THREE.Vector3(-0.75, 0.30, 0.40),   // Subsystem 02: Forward Left Motor & Rotor
    p3: new THREE.Vector3(0, 0.28, 0.02),       // Subsystem 03: Central Avionics Fuselage
    p4: new THREE.Vector3(0.20, -0.15, -0.12),  // Subsystem 04: Power Matrix & Skid
  };

  useFrame((_, delta) => {
    const offset = scrollProgressRef.current || 0;

    const getRange = (start, end) => Math.min(Math.max((offset - start) / (end - start), 0), 1);
    const r1 = getRange(0.00, 0.20);
    const r2 = getRange(0.20, 0.40);
    const r3 = getRange(0.40, 0.60);
    const r4 = getRange(0.60, 0.80);
    const r5 = getRange(0.80, 1.00);

    // 1. Dynamic Camera Orbits
    if (offset < 0.20) {
      targetPos.current.set(
        THREE.MathUtils.lerp(0, 0.75, r1),
        THREE.MathUtils.lerp(0.8, -0.25, r1),
        THREE.MathUtils.lerp(5.0, 2.3, r1)
      );
      targetLookAt.current.set(
        THREE.MathUtils.lerp(0, 0, r1),
        THREE.MathUtils.lerp(0, 0.05, r1),
        0
      );
    } else if (offset < 0.40) {
      targetPos.current.set(
        THREE.MathUtils.lerp(0.75, -2.1, r2),
        THREE.MathUtils.lerp(-0.25, 2.6, r2),
        THREE.MathUtils.lerp(2.3, 2.4, r2)
      );
      targetLookAt.current.set(
        THREE.MathUtils.lerp(0, -0.3, r2),
        THREE.MathUtils.lerp(0.05, 0.2, r2),
        0
      );
    } else if (offset < 0.60) {
      targetPos.current.set(
        THREE.MathUtils.lerp(-2.1, 2.4, r3),
        THREE.MathUtils.lerp(2.6, 0.45, r3),
        THREE.MathUtils.lerp(2.4, 2.1, r3)
      );
      targetLookAt.current.set(
        THREE.MathUtils.lerp(-0.3, 0, r3),
        THREE.MathUtils.lerp(0.2, 0.15, r3),
        0
      );
    } else if (offset < 0.80) {
      targetPos.current.set(
        THREE.MathUtils.lerp(2.4, -1.7, r4),
        THREE.MathUtils.lerp(0.45, -0.8, r4),
        THREE.MathUtils.lerp(2.1, 2.7, r4)
      );
      targetLookAt.current.set(
        THREE.MathUtils.lerp(0, 0, r4),
        THREE.MathUtils.lerp(0.15, -0.1, r4),
        0
      );
    } else {
      targetPos.current.set(
        THREE.MathUtils.lerp(-1.7, 0, r5),
        THREE.MathUtils.lerp(-0.8, 1.8, r5),
        THREE.MathUtils.lerp(2.7, 5.8, r5)
      );
      targetLookAt.current.set(0, 0, 0);
    }

    camera.position.lerp(targetPos.current, delta * 3.5);
    camera.lookAt(targetLookAt.current);

    // 2. Real-Time 3D-to-2D Screen Projection (Tracks position including exploded displacement)
    const updateCalloutLock = (cardRef, lineRef, dotRef, pos3D, isLeft, start, end) => {
      if (!cardRef.current || !lineRef.current || !dotRef.current) return;

      // Follow part outward if exploded
      tempVec.current.copy(pos3D);
      const explodeShift = pos3D.clone().normalize().multiplyScalar(explodeFactorRef.current * 0.35);
      tempVec.current.add(explodeShift);

      tempVec.current.project(camera);
      const targetScreenX = (tempVec.current.x * 0.5 + 0.5) * size.width;
      const targetScreenY = (-tempVec.current.y * 0.5 + 0.5) * size.height;

      dotRef.current.style.transform = `translate(${targetScreenX}px, ${targetScreenY}px)`;

      const cardRect = cardRef.current.getBoundingClientRect();
      const cardJointX = isLeft ? cardRect.right : cardRect.left;
      const cardJointY = cardRect.top + cardRect.height * 0.5;

      const midX = isLeft 
        ? Math.min(cardJointX + (targetScreenX - cardJointX) * 0.5, targetScreenX - 30)
        : Math.max(cardJointX + (targetScreenX - cardJointX) * 0.5, targetScreenX + 30);
      
      const pathString = `M ${targetScreenX} ${targetScreenY} L ${midX} ${targetScreenY} L ${midX} ${cardJointY} L ${cardJointX} ${cardJointY}`;
      lineRef.current.setAttribute('d', pathString);

      const inRange = offset >= start && offset <= end;
      let p = 0;
      if (inRange) {
        const mid = (start + end) / 2;
        p = offset < mid ? (offset - start) / (mid - start) : (end - offset) / (end - mid);
        p = Math.min(Math.max(p, 0), 1);
      }

      const dotScale = p > 0.05 ? Math.min(p * 2, 1) : 0;
      dotRef.current.style.opacity = dotScale;

      const lineLen = lineRef.current.getTotalLength ? lineRef.current.getTotalLength() : 400;
      lineRef.current.style.strokeDasharray = lineLen;
      const lineProgress = Math.min(Math.max((p - 0.15) / 0.35, 0), 1);
      lineRef.current.style.strokeDashoffset = (1 - lineProgress) * lineLen;

      const cardProgress = Math.min(Math.max((p - 0.45) / 0.55, 0), 1);
      cardRef.current.style.transform = `scale(${0.75 + cardProgress * 0.25})`;
      cardRef.current.style.opacity = cardProgress;
      cardRef.current.style.pointerEvents = cardProgress > 0.6 ? 'auto' : 'none';
    };

    updateCalloutLock(refs.c1, refs.l1, refs.d1, subsystem3DPositions.p1, true, 0.12, 0.32);
    updateCalloutLock(refs.c2, refs.l2, refs.d2, subsystem3DPositions.p2, false, 0.32, 0.52);
    updateCalloutLock(refs.c3, refs.l3, refs.d3, subsystem3DPositions.p3, true, 0.52, 0.72);
    updateCalloutLock(refs.c4, refs.l4, refs.d4, subsystem3DPositions.p4, false, 0.72, 0.88);

    if (refs.hero.current) {
      const heroAlpha = offset < 0.12 ? 1 - offset / 0.12 : 0;
      refs.hero.current.style.opacity = heroAlpha;
      refs.hero.current.style.pointerEvents = heroAlpha > 0.5 ? 'auto' : 'none';
    }

    if (refs.finale.current) {
      const finAlpha = offset > 0.86 ? (offset - 0.86) / 0.14 : 0;
      refs.finale.current.style.opacity = finAlpha;
      refs.finale.current.style.transform = `scale(${0.9 + finAlpha * 0.1})`;
      refs.finale.current.style.pointerEvents = finAlpha > 0.6 ? 'auto' : 'none';
    }
  });

  return null;
}

export default function DroneScene({ scrollProgressRef }) {
  const [finishMode, setFinishMode] = useState('wireframe');
  const [isExploded, setIsExploded] = useState(false);
  const explodeFactorRef = useRef(0);

  const refs = {
    hero: useRef(null),
    c1: useRef(null), l1: useRef(null), d1: useRef(null),
    c2: useRef(null), l2: useRef(null), d2: useRef(null),
    c3: useRef(null), l3: useRef(null), d3: useRef(null),
    c4: useRef(null), l4: useRef(null), d4: useRef(null),
    finale: useRef(null),
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* 3D WebGL Canvas Layer */}
      <Canvas 
        camera={{ position: [0, 0.8, 5.0], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={finishMode === 'wireframe' ? 0.9 : 1.3} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={4} color="#ffffff" />
        <spotLight position={[-10, 5, -10]} color="#38bdf8" intensity={finishMode === 'wireframe' ? 3 : 1.5} />
        
        <Sparkles count={50} scale={8} size={1.4} speed={0.3} opacity={0.3} color="#38bdf8" />
        <Environment preset="night" />
        
        <React.Suspense fallback={null}>
          <SceneDirector refs={refs} scrollProgressRef={scrollProgressRef} explodeFactorRef={explodeFactorRef} />
          <DroneModel finishMode={finishMode} isExploded={isExploded} explodeFactorRef={explodeFactorRef} />
        </React.Suspense>

        <ContactShadows position={[0, -1.2, 0]} opacity={0.7} scale={8} blur={2} far={3.5} color="#000000" frames={1} />
      </Canvas>

      {/* Screen-Space Precision Connector Lines */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
        <path ref={refs.l1} stroke="#000000" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={refs.l2} stroke="#000000" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={refs.l3} stroke="#000000" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={refs.l4} stroke="#000000" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Dynamic 3D Projected Pointers (Locked to Drone Parts) */}
      <div 
        ref={refs.d1} 
        className="fixed top-0 left-0 -ml-2 -mt-2 w-4 h-4 rounded-full border border-white bg-black flex items-center justify-center pointer-events-none z-30 transition-opacity duration-150"
        style={{ opacity: 0 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
      </div>

      <div 
        ref={refs.d2} 
        className="fixed top-0 left-0 -ml-2 -mt-2 w-4 h-4 rounded-full border border-white bg-black flex items-center justify-center pointer-events-none z-30 transition-opacity duration-150"
        style={{ opacity: 0 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
      </div>

      <div 
        ref={refs.d3} 
        className="fixed top-0 left-0 -ml-2 -mt-2 w-4 h-4 rounded-full border border-white bg-black flex items-center justify-center pointer-events-none z-30 transition-opacity duration-150"
        style={{ opacity: 0 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
      </div>

      <div 
        ref={refs.d4} 
        className="fixed top-0 left-0 -ml-2 -mt-2 w-4 h-4 rounded-full border border-white bg-black flex items-center justify-center pointer-events-none z-30 transition-opacity duration-150"
        style={{ opacity: 0 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
      </div>

      {/* Stage 0: Hero Header & Scroll Callout */}
      <div 
        ref={refs.hero}
        className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-14"
      >
        <div className="flex justify-between w-full max-w-6xl mx-auto pt-20">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-3 shadow-2xl pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full border-[1.5px] border-white"></span>
            8K RAW CAPTURE
          </div>
          <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-3 shadow-2xl pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full border-[1.5px] border-white"></span>
            HYPERSHIFT GUIDANCE
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pb-8 text-center">
          <p className="text-white/50 text-[11px] tracking-[0.25em] uppercase font-mono animate-pulse">
            Scroll to inspect tactical architecture
          </p>
          <div className="w-4 h-8 border border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-sky-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Subsystem 01: EO/IR Gimbal (Left side) */}
      <div className="fixed top-1/2 left-8 md:left-20 -translate-y-1/2 z-20 pointer-events-none flex items-center">
        <div 
          ref={refs.c1}
          className="w-80 md:w-96 bg-black/92 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-l-4 border-l-black origin-right transition-transform duration-75"
          style={{ opacity: 0, transform: 'scale(0.7)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase">
              Subsystem 01 // Payload
            </span>
            <span className="text-sky-400 font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              LOCKED
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">Tri-Sensor EO/IR Gimbal</h3>
          <p className="text-white/70 text-xs leading-relaxed mb-5 font-light">
            Underslung 3-axis brushless gimbal housing a 1-inch CMOS primary sensor, long-wave radiometric thermal microbolometer, and 1,200m eye-safe LiDAR.
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <div className="text-white font-mono text-sm font-bold">8K 60fps</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Cinematic Raw</div>
            </div>
            <div>
              <div className="text-white font-mono text-sm font-bold">640 × 512</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Thermal Sensor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem 02: Propulsion (Right side) */}
      <div className="fixed top-1/2 right-8 md:right-20 -translate-y-1/2 z-20 pointer-events-none flex items-center flex-row-reverse">
        <div 
          ref={refs.c2}
          className="w-80 md:w-96 bg-black/92 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-r-4 border-r-black origin-left transition-transform duration-75"
          style={{ opacity: 0, transform: 'scale(0.7)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase">
              Subsystem 02 // Propulsion
            </span>
            <span className="text-indigo-400 font-mono text-[10px] tracking-widest uppercase">LOCKED</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">Coaxial Vector Propulsors</h3>
          <p className="text-white/70 text-xs leading-relaxed mb-5 font-light">
            High-torque FOC brushless outrunner motors spinning folding carbon-composite blades, acoustically tuned to suppress high-frequency harmonic flutter.
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <div className="text-white font-mono text-sm font-bold">92 km/h</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Sprint Velocity</div>
            </div>
            <div>
              <div className="text-white font-mono text-sm font-bold">18 m/s</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Wind Resistance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem 03: Avionics Core (Left side) */}
      <div className="fixed top-1/2 left-8 md:left-20 -translate-y-1/2 z-20 pointer-events-none flex items-center">
        <div 
          ref={refs.c3}
          className="w-80 md:w-96 bg-black/92 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-l-4 border-l-black origin-right transition-transform duration-75"
          style={{ opacity: 0, transform: 'scale(0.7)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase">
              Subsystem 03 // Compute & Control
            </span>
            <span className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase">LOCKED</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">Edge Neural Architecture</h3>
          <p className="text-white/70 text-xs leading-relaxed mb-5 font-light">
            Fuselage core featuring dual RTK-GNSS anti-jamming antennas, triple-redundant IMU array, and on-die tensor compute for SLAM navigation in GPS-denied zones.
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <div className="text-white font-mono text-sm font-bold">275 TOPS</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Edge Inference</div>
            </div>
            <div>
              <div className="text-white font-mono text-sm font-bold">&lt; 0.01ms</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Sensor Fusion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem 04: Power Matrix (Right side) */}
      <div className="fixed top-1/2 right-8 md:right-20 -translate-y-1/2 z-20 pointer-events-none flex items-center flex-row-reverse">
        <div 
          ref={refs.c4}
          className="w-80 md:w-96 bg-black/92 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-r-4 border-r-black origin-left transition-transform duration-75"
          style={{ opacity: 0, transform: 'scale(0.7)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase">
              Subsystem 04 // Energy & Structure
            </span>
            <span className="text-amber-400 font-mono text-[10px] tracking-widest uppercase">LOCKED</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">Solid-State Energy Core</h3>
          <p className="text-white/70 text-xs leading-relaxed mb-5 font-light">
            Quick-eject silicon-anode solid-state battery coupled with ultra-light Toray T800 carbon fiber landing struts engineered for heavy impact unpaved terrain.
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <div className="text-white font-mono text-sm font-bold">52 min</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Flight Endurance</div>
            </div>
            <div>
              <div className="text-white font-mono text-sm font-bold">1.42 kg</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wider">Dry Weight</div>
            </div>
          </div>
        </div>
      </div>

      {/* Finale: Tactical Deployment */}
      <div 
        ref={refs.finale}
        className="fixed inset-0 z-20 flex flex-col justify-center items-center px-8 text-center pointer-events-none transition-all duration-150"
        style={{ opacity: 0, transform: 'scale(0.9)' }}
      >
        <div className="max-w-2xl bg-black/92 backdrop-blur-2xl border border-white/15 p-10 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col items-center">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-4">
            Deployment // Tactical Envelope
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Ready For Tactical Insertion
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-lg font-light">
            Fully certified for search and rescue, perimeter reconnaissance, and remote infrastructure survey across all weather domains.
          </p>

          <div className="grid grid-cols-3 gap-6 w-full mb-8 border-y border-white/10 py-5">
            <div>
              <div className="text-white font-mono text-xl font-bold">15 km</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Max Telemetry Link</div>
            </div>
            <div>
              <div className="text-white font-mono text-xl font-bold">IP67</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Ingress Rating</div>
            </div>
            <div>
              <div className="text-white font-mono text-xl font-bold">-20° to 50°C</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Operational Temp</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-preorder'))}
              className="px-8 py-3.5 bg-white text-black font-semibold rounded-full text-xs uppercase tracking-wider hover:bg-white/90 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] cursor-pointer pointer-events-auto"
            >
              Deploy Airframe
            </button>
            <button className="px-8 py-3.5 bg-white/5 border border-white/20 text-white font-semibold rounded-full text-xs uppercase tracking-wider hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer pointer-events-auto">
              Download Avionics Whitepaper
            </button>
          </div>
        </div>
      </div>

      {/* Tactical Viewport HUD Controller (Docked Bottom-Right) */}
      <div className="fixed bottom-6 right-8 z-40 flex items-center gap-3">
        {/* Exploded View Toggle Switch */}
        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border text-[10px] font-mono tracking-widest uppercase transition-all shadow-xl cursor-pointer ${
            isExploded
              ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
              : 'bg-black/70 border-white/10 text-white/60 hover:text-white hover:border-white/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isExploded ? 'bg-sky-400 animate-ping' : 'bg-white/40'}`} />
          <span>{isExploded ? 'EXPLODED // ON' : 'EXPLODE VIEW'}</span>
        </button>

        {/* Material & Finish Switcher */}
        <div className="flex items-center p-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-xl">
          {[
            { id: 'wireframe', label: 'WIREFRAME' },
            { id: 'stealth', label: 'STEALTH' },
            { id: 'milspec', label: 'MIL-SPEC' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFinishMode(mode.id)}
              className={`px-3 py-1.5 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                finishMode === mode.id
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}