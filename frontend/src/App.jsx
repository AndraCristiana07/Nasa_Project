import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber';
import { useStore } from './store';
import './App.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

import { Moon, Orion, Earth, Sun } from './planets'

const Trajectory = ({ curve, color = "white" }) => {
  // generate array of points from the curve
  const points = useMemo(() => {
    if (!curve) return []
    // return curve.getPoints(200)
    return curve.getPoints(1000)
  }, [curve])

  if (points.length === 0) return null

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      dashed={true}
      dashScale={50}
      dashSize={0.5}
      dashGap={0.5}
    />
  )
}

function CameraTracker({ targetRef, targetName }) {
  const { camera, size } = useThree();
  const controlsRef = useRef();
  const lastPosition = useRef(new THREE.Vector3());

  const isSmallScreen = size.width < 768;

  // move the camera at the same time as the planet moved
  useFrame(() => {
    if (targetRef.current && controlsRef.current) {
      const currentPosition = targetRef.current.position;

      const radius = targetRef.current.geometry?.parameters?.radius || 1;

      let minBuffer = 1.1;
      if (targetName === 'Sun') minBuffer = 1.02;
      if (targetName === 'Earth') minBuffer = 1.5;
      if (targetName === 'Moon') minBuffer = 1.2;
      if (targetName === 'Orion') minBuffer = 2.5;
      controlsRef.current.minDistance = radius * minBuffer;

      // calculate the displacement of the planet
      const delta = new THREE.Vector3().subVectors(currentPosition, lastPosition.current);

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
      let radius = 0.1;
      if (targetName === 'Sun') radius = 2400;
      else if (targetName === 'Earth') radius = 0.3;
      else if (targetName === 'Moon') radius = 0.1;
      else if (targetName === 'Orion') radius = 0.015;

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

      controlsRef.current.minDistance = radius * 1.15;
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
      dampingFactor={0.05} 
      maxDistance={10000000} 
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
            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all"
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

  const [isPaused, setIsPaused] = useState(false);

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


  const advance = useStore((s) => s.advance);

  useFrame((state, delta) => {
    // delta -> time between frames provided by R3F
    if (!isPaused) {
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
        <Sun ref={sunRef} curve={curves.sun} isPaused={isPaused} setIsPaused={setIsPaused} />
        <Earth ref={earthRef} curve={curves.earth} isPaused={isPaused} />
        <Moon ref={moonRef} curve={curves.moon} isPaused={isPaused} setIsPaused={setIsPaused} />
        <Orion ref={orionRef} curve={curves.orion} isPaused={isPaused} />
        {activeRef && <CameraTracker targetRef={activeRef} targetName={focusTarget} />}
      </group>
  );
};

const FocusMenu = ({ focusTarget, setFocusTarget, centerOrigin, setCenterOrigin }) => {
  const targets = ['Earth', 'Moon', 'Orion', 'Sun'];
  const origins = ['Earth', 'Moon', 'Sun']; 

  return (
    <div className="absolute top-4 left-1 md:top-8 md:left-8 z-50 flex flex-col gap-8">
      {/* camera focus */}
      <div className="flex flex-col gap-3">
        <div className="hidden md:block mb-2 px-1">
          <h2 className="text-blue-500 font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
            Focus target
          </h2>
          <div className="h-[1px] w-full bg-blue-500/30 my-1" />
        </div>
        {/* buttons group */}
        <div className="flex flex-row md:flex-col gap-2 px-4 md:px-0 overflow-x-auto no-scrollbar">
          {targets.map(name => (
            <button
              key={name}
              onClick={() => setFocusTarget(name)}
              data-testid={`focus-${name}`}
              className={`
                flex-shrink-0 relative px-4 py-2 text-left transition-all duration-300 group
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
              <div className={`absolute top-0 right-0 w-1 h-1 border-t border-r transition-opacity ${focusTarget === name ? 'border-blue-400 opacity-100' : 'border-white/20 opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
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
        <div className="flex flex-row md:flex-col gap-2 px-4 md:px-0 overflow-x-auto no-scrollbar">
          {origins.map(name => (
            <button
              key={name}
              data-testid={`center-${name}`}
              onClick={() => setCenterOrigin(name)}
              className={`
                flex-shrink-0 relative px-4 py-2 text-left transition-all duration-300 group
                font-mono text-[9px] md:text-[11px] tracking-[0.2em] uppercase
                border-b-2 md:border-b-0 md:border-l-2
                ${centerOrigin === name
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                }
              `}
            >
              <span className="relative z-10">
                {centerOrigin === name ? `[ ${name} ]` : name}
              </span>
              <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r transition-opacity ${centerOrigin === name ? 'border-amber-500 opacity-100' : 'border-white/20 opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
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
              flex-shrink-0 flex group relative transition-all
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

const Gallery = ({ galleryData, onClose, isOpen, isLoadingGallery, selectedDay }) => {
  if (!isOpen) return null;
  const dayDisplay = galleryData?.day || selectedDay || "??";

  return (
    <div className="fixed inset-0 z-[150] flex justify-end pointer-events-none">
      <div className="absolute border border-blue-500/40 inset-0 pointer-events-auto"
        onClick={onClose} />

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
            {galleryData?.label || `Mission Day ${dayDisplay} Status`}
          </h2>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-white hover:text-red-500 text-2xl transition-colors"
          >✕</button>
        </div>

        {/* content */}
        <div className="overflow-y-auto snap-y snap-mandatory p-4 md:p-8 min-h-[400px] custom-scrollbar flex-1 p-8 flex flex-col">
          {isLoadingGallery ? (
            /* loading state */
            <div className="flex-1 flex flex-col items-center justify-center text-center ">
              <div className="relative w-20 h-20 mb-8">
                {/* spinning outer ring */}
                <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                {/* pulsing inner dot */}
                <div className="absolute inset-4 bg-blue-500/40 rounded-full animate-pulse"></div>
              </div>
              <p className="text-blue-400 font-mono text-xs tracking-[0.3em] animate-pulse">
                RECEIVING DATA...
              </p>
            </div>

          ) : galleryData && Array.isArray(galleryData.gallery) && galleryData.gallery.length > 0 ? (
            /* loaded data */
            galleryData.gallery.map((img, i) => (
              <div key={i} className="mb-8 md:mb-10 last:mb-0 group">
                <div className="relative overflow-hidden rounded-lg md:rounded-xl mb-3 border border-white/10">
                  <img
                    src={img.url}
                    onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                    className="w-full h-auto transform transition-transform duration-1000 hover:scale-115"
                  />
                </div>
                <p className="text-white text-sm md:text-md font-bold">{img.title}</p>
                <p className="text-slate-400 text-xs md:text-sm italic leading-relaxed">{img.description}</p>
              </div>
            ))

          ) : (
            /* no data for day */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-4">📡</span>
              <h3 className="text-white font-bold mb-2 uppercase tracking-widest">No Visual Data</h3>
              <p className="text-slate-500 text-sm max-w-[280px]">
                Day {dayDisplay} contains no images.
              </p>
            </div>
          )}
        </div>
      </div>
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
  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        const trajectoryKeys = ['artemis', 'moon', 'earth', 'sun'];
        const origin = centerOrigin.toLowerCase();
        const requests = [
          axios.get(`${BACKEND_URL}/api/mission/trajectory`),
          ...trajectoryKeys.map(obj => axios.get(`${BACKEND_URL}/api/trajectory/${obj}/${origin}`))
        ];

        const responses = await Promise.all(requests);

        const [missionRes, orionRes, moonRes, earthRes, sunRes] = responses;

        setMilestones(missionRes.data.milestones);
        setTrajectories({
          orion: orionRes.data,
          moon: moonRes.data,
          earth: earthRes.data,
          sun: sunRes.data
        });

        setIsDataLoaded(true);

      } catch (err) {
        console.error("Data Load Fail:", err);
      }
    };

    fetchMissionData();
  }, [centerOrigin]);

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
    setShouldRun(false);
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


      {isDataLoaded && !isGalleryOpen && (
        <>
          <FocusMenu focusTarget={focusTarget} setFocusTarget={setFocusTarget} centerOrigin={centerOrigin} setCenterOrigin={setCenterOrigin} />
          <MissionControl milestones={milestones} />
          <Timeline milestones={milestones} onTimelineClick={handleTimelineClick} />

        </>
      )}
      {/* gallery*/}
      {isGalleryOpen && (
        <Gallery galleryData={galleryData} isOpen={isGalleryOpen} onClose={handleCloseGallery} isLoadingGallery={isLoadingGallery} selectedDay={selectedDay} />
      )}
    </div>
  );
}