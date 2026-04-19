import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import axios from "axios";
import { useStore } from "./store";
import "./App.css";

import { Settings } from "./components/Settings";
import { MissionControl } from "./components/MissionControl";
import { ArtemisScene } from "./components/ArtemisScene";
import { FocusMenu } from "./components/FocusMenu";
import { Timeline } from "./components/Timeline";
import { Gallery } from "./components/Gallery";
import { SearchBar, SearchGallery } from "./components/Search";
import { MilestoneTracker, PopUp } from "./components/MilestoneTracker";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
  const [focusTarget, setFocusTarget] = useState("Earth");

  const [trajectories, setTrajectories] = useState({
    orion: [],
    moon: [],
    earth: [],
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasLoadingTimeout, setHasLoadingTimeout] = useState(false);

  const [milestones, setMilestones] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const setShouldRun = useStore((s) => s.setShouldRun);
  const setProgress = useStore((s) => s.setProgress);

  const [galleryData, setGalleryData] = useState(null);
  const [galleryCache, setGalleryCache] = useState({});

  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const isGalleryOpen = useStore((s) => s.isGalleryOpen);

  const [centerOrigin, setCenterOrigin] = useState("Earth");

  const isSearchOpen = useStore((s) => s.isSearchOpen);

  const [fullArchive, setFullArchive] = useState([]);

  const setIsOrbitLoading = useStore((s) => s.setIsOrbitLoading);

  const starCount = useStore((state) => state.starCount);

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
          axios.get(`${BACKEND_URL}/api/mission/archive`),
        ]);

        setFullArchive(archiveRes.data);
        setMilestones(missionRes.data.milestones);

        // fetch trajectories
        const trajectoryKeys = ["artemis", "moon", "earth", "sun"];
        const origin = centerOrigin.toLowerCase();
        const newTrajectories = {};

        for (const obj of trajectoryKeys) {
          const res = await axios.get(
            `${BACKEND_URL}/api/trajectory/${obj}/${origin}`,
          );
          // map artemis to orion
          const stateKey = obj === "artemis" ? "orion" : obj;
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
    setSelectedDay(m.day);
    setProgress((m.day - 1) / 10);

    if (galleryCache[m.day]) {
      // if it already is in cache, use it
      setGalleryData(galleryCache[m.day]);
      return;
    }

    setGalleryData(null);
    setIsLoadingGallery(true);

    try {
      const res = await axios.get(`${BACKEND_URL}/api/mission/day/${m.day}`);
      const data = res.data;
      setGalleryData(data);
      setGalleryCache((prev) => ({ ...prev, [m.day]: data }));
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
    <div
      className="relative w-screen h-screen bg-black text-white 
        overflow-hidden h-[100dvh]"
    >
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
                <br />
                <br />
                <span className="text-blue-400">
                  Render's free tier is likely waking up.{" "}
                </span>
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
          far: 10000000, // to see objects further away
        }}
      >
        <Stars radius={500000} depth={50} count={starCount} factor={4} />
        <ambientLight intensity={0.2} />
        {isDataLoaded && (
          <ArtemisScene
            focusTarget={focusTarget}
            milestones={milestones}
            trajectories={trajectories}
          />
        )}
      </Canvas>

      {isDataLoaded && !isGalleryOpen && !isSearchOpen && (
        <>
          {/* top container*/}
          <div
            className="fixed top-2 left-0 right-0 z-[99999998] px-4 xl:px-8 
              xl:top-6 flex flex-col xl:flex-row xl:justify-between 
              items-start pointer-events-none gap-4"
          >
            {/* search bar and settings: left on small screens, right on bigger */}
            <div
              className="flex flex-row items-center gap-2 
                pointer-events-auto order-1 xl:order-2 self-start xl:self-auto "
            >
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
          <Timeline
            milestones={milestones}
            onTimelineClick={handleTimelineClick}
          />
          <MilestoneTracker />
        </>
      )}
      {/* gallery*/}
      {isGalleryOpen && (
        <Gallery
          galleryData={galleryData}
          isOpen={isGalleryOpen}
          onClose={handleCloseGallery}
          isLoadingGallery={isLoadingGallery}
          selectedDay={selectedDay}
          onDaySelect={handleTimelineClick}
          milestones={milestones}
        />
      )}
      <SearchGallery allImages={fullArchive} />
      <PopUp />
    </div>
  );
}
