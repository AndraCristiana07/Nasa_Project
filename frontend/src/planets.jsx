import { forwardRef, useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import sunColor from './assets/2k_sun.jpg'
import { useStore } from './store';

import { useGLTF } from '@react-three/drei';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


const SPEED = 0.1
const SUN_RADIUS = 2400;
const MOON_RADIUS = 0.10;
const ORION_RADIUS = 0.015;
const EARTH_RADIUS = 0.3;

const convertCoords = (lat, lng, radius) => {
  // convert to 3D Vector
  const latRad = (90 - lat) * (Math.PI / 180)
  const lngRad = (lng + 180) * (Math.PI / 180)
  // x = r * cos(lat) * cos(lng)
  // y = r * sin(lat)
  // z = r * cos(lat) * sin(lng)
  return new THREE.Vector3(
    -radius * Math.sin(latRad) * Math.cos(lngRad),
    radius * Math.cos(latRad),
    radius * Math.sin(latRad) * Math.sin(lngRad)
  )
}


// --- EARTH ---
const Earth = forwardRef(({ curve }, ref) => {
  const texture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  const progress = useStore((s) => s.progress);

  useFrame(() => {
    if (ref.current && curve) {
      ref.current.position.copy(curve.getPoint(progress));
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        metalness={0.1}
        emissive={new THREE.Color('#000000')}
      />
    </mesh>
  );
});

// --- MOON ---

const Moon = forwardRef(({ curve, isPaused, setIsPaused }, ref) => {
  const texture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

  const progress = useStore((s) => s.progress);

  useFrame(() => {
    if (ref.current && curve && !isPaused) {
      ref.current.position.copy(curve.getPoint(progress));
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );

});

// --- ORION ---
const Orion = forwardRef(({ curve }, ref) => {

  const { scene } = useGLTF('/orionspacecraft.glb');
  const progress = useStore((s) => s.progress);

  useFrame(() => {
    if (!curve || !ref.current) return;
    
    const point = curve.getPoint(progress);
    ref.current.position.copy(point);

    if (progress < 0.99) {
      const nextPoint = curve.getPoint(progress + 0.01);
      ref.current.lookAt(nextPoint);
    }
  });
  return (
    <mesh ref={ref}>
      <primitive
        object={scene}
        ref={ref}
        scale={ORION_RADIUS} 
        rotation={[Math.PI / 2, 0, 0]} />
    </mesh>
  );
});
useGLTF.preload('/models/your-model.glb');
// --- SUN ---

const FlareMarker = ({ flare, setSunPaused }) => {
  const [hovered, setHover] = useState(false)

  const meshRef = useRef()
  const lightRef = useRef()

  const { curve, startPoint, thickness, baseSize, lightPower, emissivePow } = useMemo(() => {
    const start = convertCoords(flare.lat, flare.lng, SUN_RADIUS + 20)

    const midHeight = SUN_RADIUS + 20 + (flare.size * 50)
    const mid = convertCoords(flare.lat + 0.5, flare.lng + 0.5, midHeight)
    const end = convertCoords(flare.lat + 1, flare.lng + 1, SUN_RADIUS + 20)

    return {
      curve: new THREE.QuadraticBezierCurve3(start, mid, end),
      startPoint: start,
      baseSize: flare.size * 15,
      thickness: flare.size * 8,
      lightPower: Math.pow(flare.size, 2) * 50,
      emissivePow: 4 + flare.size * 2
    }
  }, [flare])

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.getElapsedTime()
    const pulseSpeed = flare.class.startsWith('X') ? 8 : flare.class.startsWith('M') ? 4 : 2
    // dynamic Glow
    meshRef.current.material.emissiveIntensity = 2 + Math.sin(t * pulseSpeed) * 1.5
  })

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

        {/* hitbox for hovering */}
        <mesh
          position={startPoint}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHover(true)
            setSunPaused(true)
          }}
          onPointerOut={() => {
            setHover(false)
            setSunPaused(false)
          }}
        >
          <boxGeometry args={[flare.size * 60, flare.size * 60, flare.size * 60]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* flare halo */}
        <mesh position={startPoint}>
          <sphereGeometry args={[flare.size * 50, 32, 32]} />
          <meshBasicMaterial
            color={flare.color}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
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

          intensity={Math.pow(flare.size, 2) * 5000000}
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

const Sun = forwardRef(({ curve, isPaused, setIsPaused }, ref) => {
  const [flares, setFlares] = useState([])
  const progress = useStore((s) => s.progress);
  useEffect(() => {
    
    // mock data for testing
    const mockFlares = [
      {
        "lat": 20,
        "lng": -23,
        "id": "2026-04-10T14:45:00-FLR-001",
        "class": "M5.4",
        "peakTime": "2026-04-10T14:45Z",
        "size": 1.54,
        "color": "#f98029"
      },
      {
        "lat": -15,
        "lng": 45,
        "id": "2026-04-11T02:10:00-FLR-001",
        "class": "X1.2",
        "peakTime": "2026-04-11T02:10Z",
        "size": 2.24,
        "color": "#f11515"
      },
      {
        "lat": 42,
        "lng": 10,
        "id": "2026-04-11T08:30:00-FLR-002",
        "class": "C8.1",
        "peakTime": "2026-04-11T08:30Z",
        "size": 0.905,
        "color": "#efdf67"
      },
      {
        "lat": -30,
        "lng": -60,
        "id": "2026-04-12T12:00:00-FLR-001",
        "class": "M1.2",
        "peakTime": "2026-04-12T12:00Z",
        "size": 1.12,
        "color": "#f98029"
      },
      {
        "lat": 10,
        "lng": 120,
        "id": "2026-04-12T18:15:00-FLR-002",
        "class": "X9.3",
        "peakTime": "2026-04-12T18:15Z",
        "size": 3.86,
        "color": "#f11515"
      },
      {
        "lat": -5,
        "lng": -150,
        "id": "2026-04-13T04:20:00-FLR-001",
        "class": "C3.4",
        "peakTime": "2026-04-13T04:20Z",
        "size": 0.67,
        "color": "#efdf67"
      },
      {
        "lat": 65,
        "lng": 30,
        "id": "2026-04-13T09:50:00-FLR-002",
        "class": "M9.9",
        "peakTime": "2026-04-13T09:50Z",
        "size": 1.99,
        "color": "#f98029"
      },
      {
        "lat": -45,
        "lng": 85,
        "id": "2026-04-13T22:10:00-FLR-003",
        "class": "M4.0",
        "peakTime": "2026-04-13T22:10Z",
        "size": 1.4,
        "color": "#f98029"
      }
    ]

    const fetchFlares = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/solar-flares`);
        setFlares(res.data)
      } catch (err) { 
        console.error("Fetch error:", err) 
        setFlares(mockFlares) // fallback to mock data on error
      }
    }
    fetchFlares()
  }, [])

  useFrame(() => {
    if (curve && ref.current && !isPaused) {
      ref.current.position.copy(curve.getPoint(progress));
      ref.current.rotation.y += 0.002;
    }
  });

  const texture = useTexture(sunColor);

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[SUN_RADIUS, 64, 64]} />

      <meshStandardMaterial
        map={texture}
        emissive={new THREE.Color('#ffaa00')}
        emissiveIntensity={2}
        emissiveMap={texture}
      />

      {/* the light source for the solar system */}
      <pointLight
        intensity={15}
        distance={20000}
        decay={0}
        color="#fff5d1"
      />

      {flares.map(flare => (
        <FlareMarker key={flare.id} flare={flare} setSunPaused={setIsPaused} />
      ))}
    </mesh>
  );
});

export { Moon, Earth, Orion, Sun };