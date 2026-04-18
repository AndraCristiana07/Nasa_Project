import { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber';
import { useStore } from './store';
import './App.css';
import { Moon, Orion, Earth, Sun } from './planets'

const SUN_BUFFER = 1.02;
const EARTH_BUFFER = 1.5;
const MOON_BUFFER = 1.2;
const ORION_BUFFER = 2.5;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


const Trajectory = ({ curve, color = "white" }) => {
  const { showTrajectories } = useStore();
  // generate array of points from the curve
  const points = useMemo(() => {
    if (!curve) return []
    // return curve.getPoints(200)
    return curve.getPoints(1000)
  }, [curve])

  if (points.length === 0) return null

  return (
    <>
      {showTrajectories && (
        <Line
          points={points}
          color={color}
          lineWidth={1.5}
          dashed={true}
          dashScale={50}
          dashSize={0.5}
          dashGap={0.5}
        />
      )}
    </>
  )
}

function CameraTracker({ targetRef, targetName }) {
  const { camera, size } = useThree();
  const controlsRef = useRef();
  const lastPosition = useRef(new THREE.Vector3());

  const isSmallScreen = size.width < 768;
  const deltaRef = useRef(new THREE.Vector3());

  // move the camera at the same time as the planet moved
  useFrame(() => {
    if (targetRef.current && controlsRef.current) {
      const currentPosition = targetRef.current.position;

      // calculate the displacement of the planet
      const delta = deltaRef.current.subVectors(currentPosition, lastPosition.current);
      // apply that same displacement to the camera
      camera.position.add(delta);

      // keep OrbitControls centered on the planet
      controlsRef.current.target.copy(currentPosition);
      lastPosition.current.copy(currentPosition);
      controlsRef.current.update();
    }
  });

  // when the target changes, move the camera to it
  useEffect(() => {
    if (targetRef.current && camera && controlsRef.current) {
      const targetPos = new THREE.Vector3();
      targetRef.current.getWorldPosition(targetPos);

      // get the radius of the sphere 
      const radius = targetRef.current.getObjectByProperty('type', 'Mesh').geometry?.parameters?.radius || 1;

      const currentDist = camera.position.distanceTo(targetPos);
      if (currentDist > radius * 100) {
        camera.position.copy(targetPos).add(new THREE.Vector3(0, 0, 10));
      }

      // calculate the direction from target to camera
      let direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize();
      if (direction.length() === 0 || isNaN(direction.x)) direction.set(0, 0, 1);

      // to be diferent for a small screen
      let multiplier = isSmallScreen ? 4.0 : 2.5;
      if (targetName === 'Sun') multiplier = isSmallScreen ? 4.5 : 2.2;
      if (targetName === 'Orion') multiplier = isSmallScreen ? 15.0 : 10.0;

      const totalPush = radius * multiplier;
      // move the camera to the new position: Target + (Direction * Total Distance)
      const newPos = new THREE.Vector3().copy(targetPos).add(direction.multiplyScalar(totalPush));

      camera.position.copy(newPos);
      camera.lookAt(targetPos);
      if (targetName === 'Sun') controlsRef.current.minDistance = radius * SUN_BUFFER;
      if (targetName === 'Earth') controlsRef.current.minDistance = radius * EARTH_BUFFER;
      if (targetName === 'Moon') controlsRef.current.minDistance = radius * MOON_BUFFER;
      if (targetName === 'Orion') controlsRef.current.minDistance = radius * ORION_BUFFER;;

      controlsRef.current.target.copy(targetPos);
      controlsRef.current.update();

      lastPosition.current.copy(targetPos);
    }
  }, [targetName, isSmallScreen, camera, targetRef]);

  return (
    <><OrbitControls
      ref={controlsRef}
      enablePan={false}
      makeDefault
      enableDamping={true}
      screenSpacePanning={true}
      dampingFactor={0.05}
      maxDistance={1000000}
    />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.5}
          intensity={0.2}
          mipmapBlur />
      </EffectComposer>
    </>
  );
}

const MissionControl = ({ milestones }) => {
  const { progress, setProgress, shouldRun, setShouldRun } = useStore();

  const [wasPlaying, setWasPlaying] = useState(false);
  const totalDays = 10;

  const togglePlayback = () => setShouldRun(!shouldRun);

  return (
    <div className="fixed bottom-0 md:bottom-5 left-0 md:left-1/2 md:-translate-x-1/2 z-[100] w-full md:w-[600px] md:max-w-[90vw] ">
      <div className="bg-slate-900/95 backdrop-blur-xl border-t md:border border-blue-500/30 p-4 md:p-5 md:rounded-2xl shadow-2xl flex flex-col gap-3 md:gap-4">
        {/* progress */}
        <div className="flex justify-between items-end font-mono text-[9px] md:text-[10px] tracking-widest px-1">
          <div className="flex flex-col">
            <span className="text-blue-400 font-bold">ARTEMIS II</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30">

              <span className="hidden md:inline">PROGRESS: </span>{(progress * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* seek bar */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* play/pause button */}
          <button
            aria-label={shouldRun ? "pause" : "play"}
            onClick={togglePlayback}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all"
          >
            {shouldRun ? (
              <div className="flex gap-1.5">
                <div className="w-1 md:w-1.5 h-3.5 md:h-4 bg-white rounded-sm" />
                <div className="w-1 md:w-1.5 h-3.5 md:h-4 bg-white rounded-sm" />
              </div>
            ) : (
              <div className="ml-1 w-0 h-0 border-t-[7px] md:border-t-[9px] border-t-transparent border-l-[12px] md:border-l-[15px] border-l-white border-b-[7px] md:border-b-[9px] border-b-transparent" />
            )}
          </button>

          {/* seek container */}
          <div className="relative flex-1 group py-3 md:py-4">
            {/* day markers */}
            <div className="absolute inset-0 left-0 right-0 pointer-events-none">
              {milestones?.map((m) => {
                const percent = ((m.day - 1) / totalDays) * 100;

                return (
                  <div
                    key={m.day}
                    style={{ left: `${percent}%` }}
                    className="absolute inset-y-0 flex flex-col items-center justify-center"
                  >
                    {/* tick mark for days*/}
                    <div className="w-[1px] h-2 md:h-3 bg-blue-400/30 group-hover:bg-blue-400/60 transition-colors" />
                    {/* day label */}
                    <span className="absolute bottom-[-4px] text-[9px] font-mono text-slate-500 group-hover:text-blue-300 transition-colors">
                      D{m.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.0001"
              value={progress}
              onTouchStart={() => { setWasPlaying(shouldRun); setShouldRun(false); }}
              onTouchEnd={() => { if (wasPlaying) setShouldRun(true); }}
              onChange={(e) => {
                setShouldRun(false);
                setProgress(parseFloat(e.target.value));
              }}
              onMouseDown={() => {
                setWasPlaying(shouldRun);
                setShouldRun(false);
              }}
              onMouseUp={() => {
                if (wasPlaying) setShouldRun(true);
              }}
              className="relative w-full h-0.5 md:h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 z-10 hover:bg-slate-700 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ArtemisScene = ({ focusTarget, trajectories }) => {
  const earthRef = useRef()
  const moonRef = useRef()
  const sunRef = useRef()
  const orionRef = useRef()

  const shouldRun = useStore((s) => s.shouldRun);
  const advance = useStore((s) => s.advance);

  const curves = useMemo(() => {
    const format = (data) => data.map(p => new THREE.Vector3(p.x / 10000, p.z / 10000, -p.y / 10000));
    return {
      orion: trajectories.orion && trajectories.orion.length > 1 ? new THREE.CatmullRomCurve3(format(trajectories.orion)) : null,
      moon: trajectories.moon && trajectories.moon.length > 1 ? new THREE.CatmullRomCurve3(format(trajectories.moon)) : null,
      earth: trajectories.earth && trajectories.earth.length > 1 ? new THREE.CatmullRomCurve3(format(trajectories.earth)) : null,
      sun: trajectories.sun && trajectories.sun.length > 1 ? new THREE.CatmullRomCurve3(format(trajectories.sun)) : null
    };
  }, [trajectories]);

  let activeRef = moonRef;
  if (focusTarget === 'Earth') activeRef = earthRef;
  if (focusTarget === 'Sun') activeRef = sunRef;
  if (focusTarget === 'Orion') activeRef = orionRef;



  useFrame((state, delta) => {
    // delta -> time between frames provided by R3F
    if (shouldRun) {
      advance(delta);
    }
  });

  return (
    <group>
      <Trajectory curve={curves.earth} color='blue' />
      <Trajectory curve={curves.moon} color='yellow' />
      <Trajectory curve={curves.orion} color='red' />
      {/* trajectory for debugging to see if sun actually moves */}
      <Trajectory curve={curves.sun} color='purple' />
      <Sun ref={sunRef} curve={curves.sun} />
      <Earth ref={earthRef} curve={curves.earth} />
      <Moon ref={moonRef} curve={curves.moon} />
      <Orion ref={orionRef} curve={curves.orion} />
      {activeRef && <CameraTracker targetRef={activeRef} targetName={focusTarget} />}
    </group>
  );
};

const LoadingButtonSpinner = () => {
  const [frame, setFrame] = useState(0);
  const frames = ['/', '—', '\\', '|'];

  useEffect(() => {
    // spin while loading, cycling through signs
    const timer = setInterval(() => setFrame(f => (f + 1) % 4), 150);
    return () => clearInterval(timer);
  }, []);

  return <span>[ {frames[frame]} ]</span>;
};

const FocusMenu = ({ focusTarget, setFocusTarget, centerOrigin, setCenterOrigin }) => {
  const targets = ['Earth', 'Moon', 'Orion', 'Sun'];
  const origins = ['Earth', 'Moon', 'Sun'];

  const isOrbitLoading = useStore(s => s.isOrbitLoading);
  const [pendingOrigin, setPendingOrigin] = useState(null);

  const handleCenterChange = (name) => {
    setPendingOrigin(name);
    setCenterOrigin(name);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* camera focus */}
      <div className="flex flex-col gap-3">
        <div className="hidden md:block mb-2 px-1">
          <h2 className="text-blue-500 font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
            Focus target
          </h2>
          <div className="h-[1px] w-full bg-blue-500/30 my-1" />
        </div>
        {/* buttons group */}
        <div className="flex flex-row items-stretch gap-2">
          {/* small screen side label */}
          <div className="md:hidden flex items-center bg-blue-500/10 border-l border-blue-500/40 px-1 py-2">
            <span className="[writing-mode:vertical-lr] rotate-180 font-mono text-[8px] text-blue-400/80 tracking-tighter uppercase">
              Focus
            </span>
          </div>
          <div className="flex flex-row md:flex-col gap-2 md:px-0 overflow-x-auto custom-scrollbar">
            {targets.map(name => (
              <button
                key={name}
                onClick={() => setFocusTarget(name)}
                data-testid={`focus-${name}`}
                className={`
                flex-shrink-0 relative px-4 py-2 text-left transition-all duration-300 group cursor-pointer
                font-mono text-[10px] md:text-[12px] tracking-[0.2em] uppercase
                border-b-2 md:border-b-0 md:border-l-2
                ${focusTarget === name
                    ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.1)]'
                    : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }
              `}
              >
                <span className="relative z-10">
                  {focusTarget === name ? `> ${name}` : name}
                </span>
                {/* small corner detail */}
                <div className={`
                absolute top-0 right-0 w-1 h-1 border-t border-r transition-opacity 
                ${focusTarget === name ? 'border-blue-400 opacity-100' : 'border-white/20 opacity-0 group-hover:opacity-100'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* set center */}
      <div className="flex flex-col gap-3">
        <div className="hidden md:block mb-2 px-1">
          <h2 className="text-amber-500 font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
            Reference frame (center)
          </h2>
          <div className="h-[1px] w-full bg-amber-500/30 my-1" />
        </div>
        {/* buttons group */}
        <div className="flex flex-row items-stretch gap-2">
          {/* small screen side label */}
          <div className="md:hidden flex items-center bg-amber-500/10 border-l border-amber-500/40 px-1 py-2">
            <span className="[writing-mode:vertical-lr] rotate-180 font-mono text-[8px] text-amber-500/80 tracking-tighter uppercase">
              Center
            </span>
          </div>
          <div className="flex flex-row md:flex-col gap-2 md:px-0 overflow-x-auto custom-scrollbar">
            {origins.map(name => {
              const isActive = centerOrigin === name;
              const isWaiting = isOrbitLoading && pendingOrigin === name;
              return (
                <button
                  key={name}
                  data-testid={`center-${name}`}
                  disabled={isOrbitLoading}
                  onClick={() => handleCenterChange(name)}
                  className={`
                flex-shrink-0 relative px-4 py-2 text-left transition-all duration-300 group
                font-mono text-[9px] md:text-[11px] tracking-[0.2em] uppercase
                border-b-2 md:border-b-0 md:border-l-2
                ${isActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }
                ${isOrbitLoading ? 'cursor-wait' : 'hover:bg-blue-500/20 cursor-pointer'}
                ${isOrbitLoading && !isWaiting ? 'opacity-30' : 'opacity-100'}
              `}
                >
                  <span className="relative z-10 flex items-center justify-between">
                    {isWaiting ? (
                      <span className="text-amber-400">
                        <LoadingButtonSpinner />
                      </span>
                    ) : (
                      <span>{isActive ? `[ ${name} ]` : name}</span>
                    )}
                  </span>
                  {/* small corner detail */}
                  <div className={`
                  absolute w-1 h-1 top-0 right-0 border-t border-r transition-opacity
                  md:top-auto md:bottom-0 md:border-t-0 md:border-b md:border-r  
                  ${isActive ? 'border-amber-500 opacity-100' : 'border-white/20 opacity-0 group-hover:opacity-100'}
                `} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Timeline = ({ milestones, onTimelineClick }) => {

  return (
    <div className="
      fixed flex flex-col pointer-events-none
      bottom-[120px] left-0 w-full px-4
      md:right-6 md:top-8 md:translate-y-0 md:left-auto md:bottom-auto
      md:w-64 md:max-h-[calc(100vh-220px)] z-50
      xl:top-1/2 xl:-translate-y-1/2 
      ">
      <div className="mb-2 md:mb-4 px-2 pointer-events-auto">
        <h2 className="text-blue-400 font-mono text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase">Mission Timeline</h2>
        <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/50 to-transparent mt-1" />
      </div>
      <div className="
        flex flex-col gap-3 custom-scrollbar pointer-events-auto
        flex-row overflow-x-auto pb-4
        md:flex-col md:overflow-y-auto md:pr-4 md:pb-0 ">
        {milestones?.map((m, idx) => (
          <button key={idx}
            onClick={() => {
              onTimelineClick(m);
              useStore.getState().setIsGalleryOpen(true);
            }}
            className="
              flex-shrink-0 flex group relative transition-all cursor-pointer
              pl-3 py-1 md:pl-4 md:hover:translate-x-1
              w-[80px] md:w-full "
          >
            {/* indicator line to be bottom on small screens and left on large screens  */}
            <div className="
            absolute bg-slate-800 group-hover:bg-blue-500 transition-colors
            bottom-0 left-0 w-full h-[2px]
            md:top-0 md:left-0 md:w-[2px] md:h-full" />
            <div className="flex flex-col text-left py-1">
              <span className="text-white text-[10px] md:text-[12px] font-mono opacity-50 group-hover:text-blue-400">DAY {String(m.day).padStart(2, '0')}</span>
              <h4 className="text-white text-[11px] md:text-sm font-semibold">{m.label}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, isLoading, children, isEmpty, emptyMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end pointer-events-none">
      <div
        className="absolute border border-blue-500/40 inset-0 pointer-events-auto"
        onClick={onClose}
      />

      <div className="
          w-full md:max-w-[450px] 
          h-full md:h-screen
          bg-slate-950/95 
          backdrop-blur-2xl 
          border-l border-blue-500/30 
          shadow-[-20px_0_60px_rgba(0,0,0,0.8)]
          pointer-events-auto 
          flex flex-col 
          animate-slide-in-bottom md:animate-slide-in-right duration-500 animate-ease-out
        ">
        {/* header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-blue-400 font-bold text-lg md:text-xl uppercase">
            {title}
          </h2>
          <button
            data-testid="close-modal"
            onClick={onClose}
            className="text-white hover:text-red-500 text-2xl transition-colors"
          >✕</button>
        </div>

        {/* content */}
        <div className="overflow-y-auto snap-y snap-mandatory p-4 md:p-8 min-h-[400px] custom-scrollbar flex-1 p-8 flex flex-col">
          {isLoading ? (
            /* loading state */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative w-20 h-20 mb-8">
                {/* spinning outer ring */}
                <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                {/* pulsing inner dot */}
                <div className="absolute inset-4 bg-blue-500/40 rounded-full animate-pulse"></div>
              </div>
              <p className="text-blue-400 font-mono text-xs tracking-[0.3em] animate-pulse">RECEIVING DATA...</p>
            </div>
          ) : isEmpty ? (
            /* no data */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-4">📡</span>
              <h3 className="text-white font-bold mb-2 uppercase tracking-widest">No Visual Data</h3>
              <p className="text-slate-500 text-sm max-w-[280px]">{emptyMessage}</p>
            </div>
          ) : (
            /* loaded data */
            children
          )}
        </div>
      </div>
    </div>
  );
};

const ImageCard = ({ img }) => {
  return (
    <div className="mb-8 md:mb-10 last:mb-0 group animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* image container */}
      <div className="relative overflow-hidden rounded-lg md:rounded-xl mb-3 border border-white/10 bg-white/5">
        <img
          src={img.url}
          alt={img.title}
          loading="lazy"
          onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
          className="w-full h-auto opacity-0 transition-all duration-1000 ease-out transform group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
        />
      </div>

      {/* text content */}
      <div className="px-1">
        <h3 className="text-white text-sm md:text-md font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">
          {img.title}
        </h3>
        <p className="text-slate-400 text-[11px] md:text-xs italic leading-relaxed mt-1 line-clamp-3">
          {img.description}
        </p>
      </div>
    </div>
  );
};

const Gallery = ({ galleryData, onClose, isOpen, isLoadingGallery, selectedDay }) => {
  if (!isOpen) return null;
  const dayDisplay = galleryData?.day || selectedDay || "??";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={galleryData?.label || `Mission Day ${dayDisplay}`}
      isLoading={isLoadingGallery}
      isEmpty={!galleryData?.gallery?.length}
      emptyMessage={`No visual telemetry for Day ${dayDisplay}.`}
    >
      {galleryData?.gallery?.map((img, i) => (
        <ImageCard key={i} img={img} />
      ))}
    </Modal>
  );
};

const SearchBar = () => {
  const [localInput, setLocalInput] = useState("");
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen);

  const handleTriggerSearch = () => {
    if (!localInput.trim()) return;

    useStore.setState({ globalSearchQuery: localInput });
    setIsSearchOpen(true);
    setLocalInput("");
  };

  return (
    <div className="flex items-center pointer-events-auto">
      <div className="flex bg-slate-900/90 backdrop-blur-md border border-blue-500/30 rounded-sm px-3 py-2 hover:border-blue-400 transition-all">
        <input
          type="text"
          data-testid="search-input"
          placeholder="SEARCH ARCHIVE..."
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTriggerSearch()}
          className="bg-transparent outline-none text-[10px] md:text-xs font-mono tracking-[0.2em] text-blue-400 w-32 md:w-40 xl:w-48 placeholder:text-blue-900/60"
        />
        <button
          onClick={handleTriggerSearch}
          className="ml-2 text-blue-500 hover:text-white transition-colors"
        >
          🔍
        </button>
      </div>
    </div>
  );
};

const SearchGallery = ({ allImages }) => {
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen);
  const globalQuery = useStore((s) => s.globalSearchQuery);

  const results = useMemo(() => {
    if (!globalQuery) return [];
    if (!Array.isArray(allImages)) return [];
    const term = globalQuery.toLowerCase();

    // search the archive fetched on load
    return allImages.filter(img =>
      img.title?.toLowerCase().includes(term) ||
      img.description?.toLowerCase().includes(term) ||
      img.keywords?.some(k => k.toLowerCase().includes(term))
    );
  }, [globalQuery, allImages]);

  return (
    <Modal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      title={`Search: ${globalQuery}`}
      isEmpty={results.length === 0}
      emptyMessage={`No mission data found for "${globalQuery}"`}
    >
      <div className="flex flex-col gap-2">
        {results.map((img, i) => (
          <ImageCard key={i} img={img} />
        ))}
      </div>
    </Modal>
  );
};

const Settings = () => {
  const { showLabels, showTrajectories, toggleLabels, toggleTrajectories, speed, setSpeed, resetSpeed } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative pointer-events-auto">
      {/* open settings button */}
      <button
        data-testid="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        className="group cursor-pointer p-3 bg-slate-900/90 backdrop-blur-md border border-blue-500/30 rounded-full text-white hover:border-blue-400 hover:bg-white/10 backdrop-blur-md transition-all"
      > <div className="transition-transform duration-500 ease-in-out group-hover:rotate-90">⚙️</div>
      </button>

      {/* menu */}
      {isOpen && (
         <div className="absolute z-[200] top-full right-0 mt-2 p-4 bg-black/90 border border-white/20 rounded-lg w-64 xl:w-75 shadow-2xl animate-in fade-in zoom-in-95 origin-top-right">
       
          <h3 className="text-blue-400 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-4 opacity-70">
            Control Deck
          </h3>

          <div className="space-y-5">
            {/* speed section */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] md:text-[11px] font-mono uppercase">Time Warp</span>
                <div className="flex items-center gap-2">
                  {/* reset to default speed */}
                  <button onClick={resetSpeed}
                    className={`text-[8px] md:text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all ${speed !== 0.008
                      ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10 cursor-pointer'
                      : 'border-slate-800 text-slate-700 cursor-default'
                      }`}>
                    RESET
                  </button>
                  <span className="text-blue-400 font-mono text-[10px] md:md:text-[11px]">{(speed / 0.008).toFixed(1)}x</span>
                </div>
              </div>
              <input
                type="range" min="0.001" max="0.04" step="0.001"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[8px] md:md:text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            <div className="h-[px] w-full bg-white/5" />
            {/* label toggle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-slate-300 text-[10px] md:text-[11px] font-mono uppercase">Labels</span>
                <button onClick={toggleLabels} className={`w-8 h-4 rounded-full transition-colors relative ${showLabels ? 'bg-blue-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showLabels ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
              {/* trajectory toggle */}
              <div className="flex justify-between items-center whitespace-nowrap">
                <span className="text-slate-300 text-[10px] md:text-[11px] font-mono uppercase">Trajectories</span>
                <button onClick={toggleTrajectories} className={`w-8 h-4 rounded-full transition-colors relative ${showTrajectories ? 'bg-blue-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showTrajectories ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [focusTarget, setFocusTarget] = useState('Earth');

  const [trajectories, setTrajectories] = useState({ orion: [], moon: [], earth: [] });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasLoadingTimeout, setHasLoadingTimeout] = useState(false);

  const [milestones, setMilestones] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const setShouldRun = useStore((s) => s.setShouldRun);
  const setProgress = useStore((s) => s.setProgress);

  const [galleryData, setGalleryData] = useState(null);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const isGalleryOpen = useStore((s) => s.isGalleryOpen);

  const [centerOrigin, setCenterOrigin] = useState('Earth');

  const isSearchOpen = useStore((s) => s.isSearchOpen);

  const [fullArchive, setFullArchive] = useState([]);

  const setIsOrbitLoading = useStore(s => s.setIsOrbitLoading);

  useEffect(() => {
    if (isGalleryOpen || isSearchOpen) {
      setShouldRun(false);
    }
  }, [isGalleryOpen, isSearchOpen, setShouldRun]);

  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        setIsOrbitLoading(true);
        // fetch mission data and archive 
        const [missionRes, archiveRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/mission/data`),
          axios.get(`${BACKEND_URL}/api/mission/archive`)
        ]);

        setFullArchive(archiveRes.data);
        setMilestones(missionRes.data.milestones);

        // fetch trajectories with a tiny stagger or sequentially
        const trajectoryKeys = ['artemis', 'moon', 'earth', 'sun'];
        const origin = centerOrigin.toLowerCase();
        const newTrajectories = {};

        for (const obj of trajectoryKeys) {
          const res = await axios.get(`${BACKEND_URL}/api/trajectory/${obj}/${origin}`);
          // map artemis to orion
          const stateKey = obj === 'artemis' ? 'orion' : obj;
          newTrajectories[stateKey] = res.data;
        }

        setTrajectories(newTrajectories);
        setIsDataLoaded(true);
      } catch (err) {
        console.error("Data Load Fail:", err);
      } finally {
        setIsOrbitLoading(false);
      }
    };

    fetchMissionData();
  }, [centerOrigin, setIsOrbitLoading]);

  useEffect(() => {
    // if data isn't loaded after 10 seconds=> timeout state
    const timer = setTimeout(() => {
      if (!isDataLoaded) {
        setHasLoadingTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isDataLoaded]);

  const handleTimelineClick = async (m) => {
    // setShouldRun(false);
    setSelectedDay(m.day);
    setGalleryData(null);
    setIsLoadingGallery(true);
    setProgress((m.day - 1) / 10);

    try {
      const res = await axios.get(`${BACKEND_URL}/api/mission/day/${m.day}`);
      setGalleryData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleCloseGallery = () => {
    setSelectedDay(null);
    setGalleryData(null);

    useStore.getState().setIsGalleryOpen(false);
  };

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden h-[100dvh]">
      {!isDataLoaded && (
        <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-6 text-center">
          {!hasLoadingTimeout ? (
            // loading state 
            <>
              <div className="w-64 h-[2px] bg-blue-900/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-500 animate-loading-bar" />
              </div>
              <p className="mt-4 text-blue-400 font-mono text-[10px] tracking-[0.4em] animate-pulse">
                ESTABLISHING SATELLITE DATA...
              </p>
            </>
          ) : (
            // timeout state 
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <div className="text-red-500 text-4xl mb-4">🛰️</div>
              <h2 className="text-white font-mono text-sm font-bold tracking-widest uppercase mb-2">
                Signal Lost
              </h2>
              <p className="text-slate-400 font-mono text-[10px] max-w-[280px] leading-relaxed">
                The mission backend is taking longer than expected to respond.
                <br /><br />
                <span className="text-blue-400">Render's free tier is likely waking up. </span>
                Please wait a few moments and refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 border border-blue-500/50 text-blue-400 font-mono text-[10px] hover:bg-blue-500/10 transition-colors uppercase tracking-widest"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      )}

      <Canvas
        gl={{ logarithmicDepthBuffer: true }}
        camera={{
          fov: 75,
          near: 0.01,
          far: 10000000 // to see objects further away
        }}>
        <Stars radius={500000} depth={50} count={50000} factor={4} />
        <ambientLight intensity={0.2} />
        {isDataLoaded && (
          <ArtemisScene focusTarget={focusTarget} milestones={milestones} trajectories={trajectories} />
        )}
      </Canvas>

      {isDataLoaded && !isGalleryOpen && !isSearchOpen && (
        <>
          {/* top container*/}
          <div className="fixed top-2 left-0 right-0 z-[100] px-4 xl:px-8 xl:top-6 flex flex-col xl:flex-row xl:justify-between items-start pointer-events-none gap-4">
            {/* search bar and settings: left on small screens, right on bigger */}
            <div className="flex flex-row items-center gap-2 pointer-events-auto order-1 xl:order-2 self-start xl:self-auto">
              <SearchBar />
              <Settings />
            </div>
            <div className="pointer-events-auto order-2 xl:order-1 self-start">
              <FocusMenu
                focusTarget={focusTarget}
                setFocusTarget={setFocusTarget}
                centerOrigin={centerOrigin}
                setCenterOrigin={setCenterOrigin}
              />
            </div>
          </div>

          <MissionControl milestones={milestones} />
          <Timeline milestones={milestones} onTimelineClick={handleTimelineClick} />
        </>
      )}
      {/* gallery*/}
      {isGalleryOpen && (
        <Gallery galleryData={galleryData} isOpen={isGalleryOpen} onClose={handleCloseGallery} isLoadingGallery={isLoadingGallery} selectedDay={selectedDay} />
      )}
      <SearchGallery allImages={fullArchive} />
    </div>
  );
}