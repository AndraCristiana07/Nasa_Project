import { forwardRef, useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import sunColor from './assets/2k_sun.jpg'
import { useStore } from './store';
import { convertCoords } from './utils/solarConverter'
import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


const SUN_RADIUS = 2400;
const MOON_RADIUS = 0.10;
const ORION_RADIUS = 0.015;
const EARTH_RADIUS = 0.3;

// mock data 
const MOCK_FLARES = [
  {
    "lat": 2,
    "lng": 30,
    "id": "2026-04-01T13:38:00-FLR-001",
    "class": "C5.3",
    "peakTime": "2026-04-01T13:48Z",
    "size": 0.765,
    "color": "#efdf67"
  },
  {
    "lat": 20,
    "lng": -23,
    "id": "2026-04-01T23:08:00-FLR-001",
    "class": "C6.1",
    "peakTime": "2026-04-01T23:28Z",
    "size": 0.8049999999999999,
    "color": "#efdf67"
  },
  {
    "lat": 12,
    "lng": -18,
    "id": "2026-04-02T17:23:00-FLR-001",
    "class": "M3.5",
    "peakTime": "2026-04-02T18:15Z",
    "size": 1.35,
    "color": "#f98029"
  },
  {
    "lat": 2,
    "lng": 7,
    "id": "2026-04-03T07:45:00-FLR-001",
    "class": "M1.3",
    "peakTime": "2026-04-03T07:56Z",
    "size": 1.13,
    "color": "#f98029"
  },
  {
    "lat": 2,
    "lng": 4,
    "id": "2026-04-03T12:46:00-FLR-001",
    "class": "M1.3",
    "peakTime": "2026-04-03T12:50Z",
    "size": 1.13,
    "color": "#f98029"
  },
  {
    "lat": 2,
    "lng": -2,
    "id": "2026-04-04T01:07:00-FLR-001",
    "class": "M7.5",
    "peakTime": "2026-04-04T01:17Z",
    "size": 1.75,
    "color": "#f98029"
  },
  {
    "lat": 3,
    "lng": -7,
    "id": "2026-04-04T07:38:00-FLR-001",
    "class": "M1.7",
    "peakTime": "2026-04-04T07:58Z",
    "size": 1.17,
    "color": "#f98029"
  },
  {
    "lat": 2,
    "lng": -9,
    "id": "2026-04-04T11:58:00-FLR-001",
    "class": "M1.2",
    "peakTime": "2026-04-04T12:11Z",
    "size": 1.12,
    "color": "#f98029"
  },
  {
    "lat": 3,
    "lng": -16,
    "id": "2026-04-04T22:54:00-FLR-001",
    "class": "M1.0",
    "peakTime": "2026-04-04T23:04Z",
    "size": 1.1,
    "color": "#f98029"
  },
  {
    "lat": 18,
    "lng": 75,
    "id": "2026-04-07T23:10:00-FLR-001",
    "class": "C2.4",
    "peakTime": "2026-04-07T23:20Z",
    "size": 0.62,
    "color": "#efdf67"
  },
  {
    "lat": 1,
    "lng": -76,
    "id": "2026-04-09T08:23:00-FLR-001",
    "class": "M1.0",
    "peakTime": "2026-04-09T08:45Z",
    "size": 1.1,
    "color": "#f98029"
  }
]


const PlanetLabel = ({ name, color, radius }) => {

  const colors = {
    blue: "text-blue-500 border-blue-500/50 ",
    red: "text-red-500 border-red-500/50",
    yellow: "text-yellow-500 border-yellow-500/50",
    purple: "text-purple-500 border-purple-500/50",

  };

  const groupRef = useRef();
  // ref for div for styling
  const domRef = useRef();

  useFrame(({ camera }) => {
    if (!groupRef.current || !domRef.current) return;

    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);

    const dist = camera.position.distanceTo(worldPos);

    // hide label if camera is too close 
    const isTooClose = dist < radius * 8;
    domRef.current.style.opacity = isTooClose ? '0' : '1';
    domRef.current.style.visibility = isTooClose ? 'hidden' : 'visible';
  });

  return (
    <group ref={groupRef}>
      <Html
        center
        zIndexRange={[100, 0]}
        occlude="blending"
        pointerEvents="none"
        style={{
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.5s',
          zIndex: 1000,
        }}
      >
        <div ref={domRef} className="flex flex-col items-center group">
          {/* text box */}
          <div className={`
          px-2 py-1 bg-black/60 border ${colors[color]}
          font-mono text-[10px] uppercase tracking-widest
        `}>
            {name}
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- EARTH ---
const Earth = forwardRef(({ curve }, ref) => {
  const texture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  const showLabels = useStore((state) => state.showLabels);

  useFrame(() => {
    const { progress } = useStore.getState();
    if (ref.current && curve) {
      ref.current.position.copy(curve.getPoint(progress));

      const totalSpins = 20;
      const currentRotation = progress * Math.PI * 2 * totalSpins;
      ref.current.rotation.y = currentRotation;
    }
  });

  return (
    <group ref={ref}>
      <mesh >
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.1}
          emissive={new THREE.Color('#000000')}
        />
      </mesh>
      {showLabels && (
        <group position={[0, EARTH_RADIUS * 1.5, 0]}>
          <PlanetLabel name="Earth" color="blue" radius={EARTH_RADIUS} />
        </group>
      )}
    </group>

  );
});

// --- MOON ---
const Moon = forwardRef(({ curve }, ref) => {
  const texture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
  const showLabels = useStore((state) => state.showLabels);

  useFrame(() => {
    const { progress } = useStore.getState();

    if (ref.current && curve) {
      ref.current.position.copy(curve.getPoint(progress));

      const totalSpins = 20;
      const currentRotation = progress * Math.PI * 2 * totalSpins;
      ref.current.rotation.y = currentRotation;
    }
  });


  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {showLabels && (
        <group position={[0, MOON_RADIUS * 1.5, 0]}>
          <PlanetLabel name="Moon" color="yellow" radius={MOON_RADIUS} />
        </group>
      )}
    </group>
  );

});

// --- ORION ---
const Orion = forwardRef(({ curve }, ref) => {
  const { scene } = useGLTF('/orionspacecraft.glb');
  const showLabels = useStore((state) => state.showLabels);

  useFrame(() => {
    const { progress } = useStore.getState();
    if (!curve || !ref.current) return;

    const point = curve.getPoint(progress);
    ref.current.position.copy(point);

    if (progress < 0.99) {
      const nextPoint = curve.getPoint(progress + 0.01);
      ref.current.lookAt(nextPoint);
    }
  });

  return (
    <group ref={ref}>
      <mesh >
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial
          visible={false}
          transparent={true}
          depthWrite={false}
          depthTest={false}
        />
        <primitive
          object={scene}
          ref={ref}
          scale={ORION_RADIUS}
          rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      {showLabels && (
        <group position={[0, ORION_RADIUS * 4, 0]}>
          <PlanetLabel name="Orion" color="red" radius={ORION_RADIUS} />
        </group>
      )}

    </group>

  );
});
useGLTF.preload('/orionspacecraft.glb');

// --- SUN ---
const FlareMarker = ({ flare, sunRef }) => {
  const [hovered, setHover] = useState(false)
  const setShouldRun = useStore((s) => s.setShouldRun);
  const flarePaused = useRef(false);
  const meshRef = useRef()

  const { curve, startPoint, thickness, baseSize, lightPower, emissivePow } = useMemo(() => {
    const start = convertCoords(flare.lat, flare.lng, SUN_RADIUS + 10)

    const midHeight = SUN_RADIUS + 20 + (flare.size * 50)
    const mid = convertCoords(flare.lat + 0.5, flare.lng + 0.5, midHeight)
    const end = convertCoords(flare.lat + 1, flare.lng + 1, SUN_RADIUS + 20)

    return {
      curve: new THREE.QuadraticBezierCurve3(start, mid, end),
      startPoint: start,
      baseSize: flare.size * 15,
      thickness: flare.size * 8,
      lightPower: Math.pow(flare.size, 2),
      emissivePow: 4 + flare.size * 2
    }
  }, [flare])

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.getElapsedTime()
    const pulseSpeed = flare.class.startsWith('X') ? 8 : flare.class.startsWith('M') ? 4 : 2
    // dynamic glow
    meshRef.current.material.emissiveIntensity = 2 + Math.sin(t * pulseSpeed) * 1.5
  })

  // hover calculation to only be able to hover when flare is in "front" relative to the camera
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!sunRef?.current) return;

    const distToFlare = e.distance;
    const distToSun = e.camera.position.distanceTo(sunRef.current.position);

    if (distToFlare > distToSun + 5) return;

    setHover(true);
    const isCurrentlyRunning = useStore.getState().shouldRun;
    if (isCurrentlyRunning) {
      setShouldRun(false);
      flarePaused.current = true;
    }
    document.body.style.cursor = 'pointer';
  };

  return (
    <>
      <group>
        {/* arc */}
        <mesh ref={meshRef}>
          <tubeGeometry args={[curve, 32, thickness, 8, false]} />
          <meshStandardMaterial
            color={flare.color}
            emissive={flare.color}
            emissiveIntensity={emissivePow}
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* flare halo */}
        <mesh position={startPoint}
          data-testid="flare-halo"
          onPointerOver={handlePointerOver}
          onPointerOut={() => {
            setHover(false);
            if (flarePaused.current) {
              setShouldRun(true);
              flarePaused.current = false;
            }
            document.body.style.cursor = 'auto';
          }}

          onPointerMove={(e) => e.stopPropagation()}>
          <sphereGeometry args={[flare.size * 50, 32, 32]} />
          <meshBasicMaterial
            color={flare.color}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>

        {/* base*/}
        <mesh position={startPoint}>
          <sphereGeometry args={[baseSize, 12, 12]} />
          <meshBasicMaterial color="white" toneMapped={false} />
        </mesh>

        <pointLight
          position={startPoint}
          color="#f98029"
          distance={flare.size * 2000}

          intensity={lightPower * 5000000}
          decay={2}
        />
      </group>
      {hovered && (
        <Html position={startPoint} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            border: `2px solid ${flare.color}`,
            pointerEvents: 'none',
            marginTop: '-60px',
            boxShadow: `0 0 15px ${flare.color}`
          }}>
            <strong style={{ color: flare.color }}>{flare.class} Class</strong><br />
            {new Date(flare.peakTime).toLocaleDateString('en-GB')}
          </div>
        </Html>
      )}
    </>
  )
}

const Sun = forwardRef(({ curve }, ref) => {
  const [flares, setFlares] = useState(MOCK_FLARES)
  const flareGroupRef = useRef();
  const texture = useTexture(sunColor);

  const showLabels = useStore((state) => state.showLabels);

  useEffect(() => {
    const fetchFlares = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/solar-flares`);

        // set real data if it has at least one flare
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setFlares(res.data);
        }
      } catch (err) {
        console.error("Solar API unreachable. Falling back to local data.", err);
      }
    };
    fetchFlares()
  }, [])

  useFrame(() => {
    const { progress } = useStore.getState();

    if (ref.current && curve) {
      const newPos = curve.getPoint(progress);

      ref.current.position.copy(newPos);

      if (flareGroupRef.current) {
        flareGroupRef.current.position.copy(newPos);
      }

      const totalSpins = 10;
      const currentRotation = progress * Math.PI * 2 * totalSpins;

      ref.current.rotation.y = currentRotation;
      if (flareGroupRef.current) {
        flareGroupRef.current.rotation.y = currentRotation;;
      }
    }
  });

  return (
    <group>
      <mesh
        ref={ref}
        onPointerOver={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onPointerOut={(e) => e.stopPropagation()}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive={new THREE.Color('#ffaa00')}
          emissiveIntensity={2}
          emissiveMap={texture}
          transparent={false}
          opacity={1}
          depthWrite={true}
          side={THREE.FrontSide}
        />
        <pointLight intensity={15} distance={20000} decay={0} color="#fff5d1" />
      </mesh>

      {showLabels && (
        <group position={[0, SUN_RADIUS + 5000, 0]}>
          <PlanetLabel name="Sun" color="purple" radius={SUN_RADIUS} />
        </group>
      )}
      <group ref={flareGroupRef}>
        {flares.map(flare => (
          <FlareMarker key={flare.id} flare={flare} sunRef={ref} />
        ))}
      </group>
    </group>
  );
});
export { Moon, Earth, Orion, Sun, FlareMarker };