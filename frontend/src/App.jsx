import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'
import Globe from 'react-globe.gl';
import axios from 'axios';
import * as THREE from 'three';

import moonColor from './assets/moon_color_8k.jpg';
import moonHeight from './assets/moon_height_8k.png';

function App() {

  const globeEl = useRef();

  const [missionMilestones, setMissionMilestones] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [galleryData, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.5; 
  }, []);

  // globe pins
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/mission/trajectory');
        const milestones = res.data.milestones;
        const milestonesWithImages = await Promise.all(milestones.map(async (m) => {
          try {
            const dayRes = await axios.get(`http://localhost:5000/api/mission/day/${m.day}`);
            return {
              ...m,
              previewUrl: dayRes.data.gallery[0]?.url || null // take first image
            };
          } catch {
            return m; // fallback if a specific day's gallery fails
          }
        }));

        setMissionMilestones(milestonesWithImages);

      } catch (err) {
        console.error("Fetching data failes:", err);
      }
    };
    fetchMapData();
  }, []);

  const fetchDayData = async (day) => {
    setLoading(true);
    setSelectedDay(day);

    try {
      const response = await axios.get(`http://localhost:5000/api/mission/day/${day}`);
      console.log(`Gallery data for Day ${day}:`, response.data);
      setGallery(response.data);
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={moonColor}
        bumpImageUrl={moonHeight}
        showAtmosphere={true}
        bumpScale={0.5}

        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        // milestone Pins
        pointsData={missionMilestones}
        pointLabel={d => `
            <div style="
              position: absolute;
              bottom: 20px; 
              left: 50%;
              transform: translateX(-50%);
              width: 250px;
              background: #0a0f1c; 
              border: 1px solid #3b82f6; 
              border-radius: 10px; 
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.8);
              pointer-events: none;
            ">
              ${d.previewUrl ? `<img src="${d.previewUrl}" style="width:100%; height:120px; object-fit:cover; display:block;">` : ''}
              
              <div style="padding:12px; line-height: 1.2;">
                <div style="color:#60a5fa; font-family:monospace; font-size:9px; font-weight:bold; margin-bottom:3px;">DAY ${d.day}</div>
                <h3 style="color:white; margin:0 0 3px 0; font-size:14px; font-family:sans-serif;">${d.label}</h3>
                <p style="color:#94a3b8; margin:0; font-size:11px; font-family:sans-serif;">${d.info}</p>
              </div>

              <div style="background:rgba(59,130,246,0.1); padding:6px; text-align:center; border-top:1px solid rgba(255,255,255,0.05);">
                <span style="color:#60a5fa; font-size:9px; font-weight:bold; text-transform:uppercase; font-family:sans-serif;">Click to View Full Gallery</span>
              </div>
            </div>
          `}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointColor={d => d.color || '#ff0000'}
        pointAltitude={0.08}
        pointRadius={0.7}

        onPointClick={(point, event) => {
          // close existing opened modals
          setSelectedDay(null);
          setGallery(null);

          // move the camera before showing the modal
          const transitionDuration = 1000;
          globeEl.current.pointOfView(
            { lat: point.lat, lng: point.lng, altitude: 1.0 },
            transitionDuration
          );

          setTimeout(() => {
            setPopupPos({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2
            });

            fetchDayData(point.day);
          }, transitionDuration + 100);
        }}
      />

      <div className="fixed top-6 left-6 z-50 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-lg">
        <h1 className="text-blue-400 font-bold text-sm mb-1"> STATUS: ACTIVE</h1>
        <div className="font-mono text-xs text-slate-300">
          <p>DAY: <span className="text-white">9 / 10</span></p>
        </div>
      </div>
      {/*image gallery modal */}
      {selectedDay && galleryData && (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl border border-blue-500/40 rounded-3xl w-[90%] max-w-[50vh] max-h-[70vh] flex flex-col animate-in zoom-in-90 fade-in duration-300">

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-blue-500/5 rounded-t-3xl">
              <div>
                <h2 className="text-blue-400 font-bold text-xl uppercase">{galleryData.label}</h2>
                <p className="text-slate-500 text-xs font-mono mt-1">LUNAR COORDINATES: {missionMilestones[selectedDay - 1].lat}, {missionMilestones[selectedDay - 1].lng}</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="bg-slate-800 hover:bg-red-900/40 w-10 h-10 rounded-full flex items-center justify-center transition-all border border-white/10"
              >✕</button>
            </div>

            {/* Images + description */}
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                {galleryData?.gallery?.map((img, idx) => (
                  <div key={idx} className="group">
                    <div className="rounded-xl overflow-hidden border bg-black mb-3 shadow-lg">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="text-white text-sm font-bold">{img.title}</h3>
                    <p className="text-slate-400 text-xs mt-2 font-light italic">
                      {img.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {loading && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-blue-600 px-4 py-2 rounded-full text-white text-xs font-bold animate-pulse">
          LOADING NASA IMAGE DATA...
        </div>
      )}


    </>
  )
}

export default App
