import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber';
import { useStore } from './store';

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

function CameraTracker({ targetRef }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const lastPosition = useRef(new THREE.Vector3());

  // move the camera at the same time as the planet moved
  useFrame(() => {
    if (targetRef.current && controlsRef.current) {
      const currentPosition = targetRef.current.position;

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
      const targetPos = targetRef.current.position;

      // get the radius of the sphere 
      const radius = targetRef.current.geometry?.parameters?.radius || 1;
      const totalPush = radius * 1.7;

      // calculate the direction from target to camera
      let direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize();
      if (direction.length() === 0 || isNaN(direction.x)) direction.set(0, 0, 1);

      // move the camera to the new position: Target + (Direction * Total Distance)
      const newPos = new THREE.Vector3().copy(targetPos).add(direction.multiplyScalar(totalPush));

      camera.position.copy(newPos);
      camera.lookAt(targetPos);

      lastPosition.current.copy(targetPos);
      controlsRef.current.target.copy(targetPos);
      controlsRef.current.update();
    }
  }, [targetRef]);

  return (
    <><OrbitControls
      ref={controlsRef}
      enablePan={false}
      makeDefault
      minDistance={0.5}
      maxDistance={10000000} />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.5}
          intensity={0.2}
          mipmapBlur />
      </EffectComposer>
    </>
  );
}

const TrajectoryDays = ({ rawData, milestones }) => {
  if (!rawData || rawData.length === 0) return null;

  // convert raw NASA km string to scaled 3D units
  const getScaledPos = (point) => {
    return new THREE.Vector3(
      parseFloat(point.x) / 10000,
      parseFloat(point.z) / 10000,
      -parseFloat(point.y) / 10000
    );
  };

  return (
    <group>
      {milestones.map((m) => {
        // data is hourly => day1 is index 0, day2 is index 24, ... dayN is (N-1)*24 
        const hourIndex = (m.day - 1) * 24;

        // safety check in case the trajectory is shorter than the milestone day
        const point = rawData[hourIndex] || rawData[rawData.length - 1];
        const position = getScaledPos(point);

        return (
          <group key={m.day} position={position}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const MissionControl = ({ milestones }) => {
  const { progress, setProgress, shouldRun, setShouldRun } = useStore();
  const totalDays = 10;
  const togglePlayback = () => setShouldRun(!shouldRun);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[600px] max-w-[90vw]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 p-5 rounded-2xl shadow-2xl flex flex-col gap-6"> {/* Increased gap here */}

        {/* progress */}
        <div className="flex justify-between items-end font-mono text-[10px] tracking-widest px-1">
          <div className="flex flex-col">
            <span className="text-blue-400 font-bold">ARTEMIS II</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30">
              PROGRESS: {(progress * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* seek bar */}
        <div className="flex items-center gap-6">
          {/* play/pause button */}
          <button
            onClick={togglePlayback}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all"
          >
            {shouldRun ? (
              <div className="flex gap-1.5">
                <div className="w-1.5 h-4 bg-white rounded-sm" />
                <div className="w-1.5 h-4 bg-white rounded-sm" />
              </div>
            ) : (
              <div className="ml-1 w-0 h-0 border-t-[9px] border-t-transparent border-l-[15px] border-l-white border-b-[9px] border-b-transparent" />
            )}
          </button>

          {/* seek container */}
          <div className="relative flex-1 group py-4">

            {/* day markers */}
            <div className="absolute inset-0 left-0 right-0 pointer-events-none">
              {milestones.map((m) => {
                const percent = ((m.day - 1) / totalDays) * 100;

                return (
                  <div
                    key={m.day}
                    style={{ left: `${percent}%` }}
                    className="absolute inset-y-0 flex flex-col items-center justify-center"
                  >
                    {/* tick mark for days*/}
                    <div className="w-[1px] h-3 bg-blue-400/30 group-hover:bg-blue-400/60 transition-colors" />

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
              onChange={(e) => {
                setShouldRun(false);
                setProgress(parseFloat(e.target.value));
              }}
              className="relative w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 z-10 hover:bg-slate-700 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const ArtemisScene = ({ focusTarget, milestones, trajectories }) => {
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
    <>
      <group>
        <Trajectory curve={curves.earth} color='blue' />
        <Trajectory curve={curves.moon} color='yellow' />
        <Trajectory curve={curves.orion} color='red' />
        <TrajectoryDays
          rawData={trajectories.orion}
          milestones={milestones}
        />
        <Sun ref={sunRef} curve={curves.sun} isPaused={isPaused} setIsPaused={setIsPaused} />
        <Earth ref={earthRef} curve={curves.earth} isPaused={isPaused} />
        <Moon ref={moonRef} curve={curves.moon} isPaused={isPaused} setIsPaused={setIsPaused} />
        <Orion ref={orionRef} curve={curves.orion} isPaused={isPaused} />
        {activeRef && <CameraTracker targetRef={activeRef} />}
      </group>

    </>
  );
};

export default function App() {
  const [focusTarget, setFocusTarget] = useState('Earth');

  const [trajectories, setTrajectories] = useState({ orion: [], moon: [], earth: [] });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [milestones, setMilestones] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const setShouldRun = useStore((s) => s.setShouldRun);
  const setProgress = useStore((s) => s.setProgress);

  const [galleryData, setGalleryData] = useState(null);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  useEffect(() => {
  const fetchMissionData = async () => {
    try {
      const trajectoryKeys = ['artemis', 'moon', 'earth', 'sun'];
      
      const requests = [
        axios.get(`${BACKEND_URL}/api/mission/trajectory`),
        ...trajectoryKeys.map(key => axios.get(`${BACKEND_URL}/api/trajectory/${key}`))
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
}, []);
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

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {!isDataLoaded && (
        <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center">
          <div className="w-64 h-[2px] bg-blue-900/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-500 animate-loading-bar" />
          </div>
          <p className="mt-4 text-blue-400 font-mono text-[10px] tracking-[0.4em] animate-pulse">
            ESTABLISHING SATELLITE DATA...
          </p>
        </div>
      )}
      {/* UI to change focus */}
      {isDataLoaded && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {['Earth', 'Moon', 'Orion', 'Sun'].map(name => (
            <button
              key={name}
              onClick={() => setFocusTarget(name)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                background: focusTarget === name ? 'cyan' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              Focus {name}
            </button>
          ))}
        </div>
      )}

      <Canvas camera={{
        fov: 75,
        near: 0.1,
        far: 10000000 // to see objects further away
      }}>
        <Stars radius={10000} depth={50} count={50000} factor={4} />
        <ambientLight intensity={0.2} />
        {isDataLoaded && (
          <ArtemisScene focusTarget={focusTarget} milestones={milestones} trajectories={trajectories} />
        )}
      </Canvas>

      <MissionControl milestones={milestones} />
      {/* timeline */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 w-64 max-h-[80vh] z-50 flex flex-col pointer-events-none">
        <div className="mb-4 px-2 pointer-events-auto">
          <h2 className="text-blue-400 font-mono text-sm font-bold tracking-[0.2em] uppercase">Mission Timeline</h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/50 to-transparent mt-1" />
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto pr-4 no-scrollbar pointer-events-auto">
          {milestones.map((m, idx) => (
            <button key={idx} onClick={() => handleTimelineClick(m)} className="flex group relative pl-4 transition-all hover:translate-x-1">
              <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${m.weather?.risk === 'HIGH' ? 'bg-red-500' : 'bg-slate-800'}`} />
              <div className="flex flex-col text-left py-1">
                <span className="text-white text-[12px] font-mono opacity-50">DAY {String(m.day).padStart(2, '0')}</span>
                <h4 className="text-white text-sm font-semibold">{m.label}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* gallery*/}
      {selectedDay && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl w-[90%] max-w-[600px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">

            {/* header with button to close modal */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-blue-400 font-bold text-xl uppercase">
                {galleryData?.label || `Day ${selectedDay} Status`}
              </h2>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setGalleryData(null);
                  setShouldRun(true);
                }}
                className="text-white hover:text-red-500 text-2xl transition-colors"
              >✕</button>
            </div>

            <div className="overflow-y-auto p-6 min-h-[400px]">
              {isLoadingGallery ? (
                /* loading state */
                <div className="flex flex-col items-center justify-center h-full py-20">
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

              ) : galleryData?.gallery?.length > 0 ? (
                /* loaded data */
                galleryData.gallery.map((img, i) => (
                  <div key={i} className="mb-10 last:mb-0 group">
                    <div className="relative overflow-hidden rounded-xl mb-3 border border-white/10">
                      <img
                        src={img.url}
                        className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-white text-md font-bold">{img.title}</p>
                    <p className="text-slate-400 text-sm italic leading-relaxed">{img.description}</p>
                  </div>
                ))

              ) : (
                /* no data for day */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-4xl mb-4">📡</span>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-widest">No Visual Data</h3>
                  <p className="text-slate-500 text-sm max-w-[280px]">
                    Day {selectedDay} telemetry contains no image packets.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}