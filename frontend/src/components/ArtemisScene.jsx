import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store";

import { Trajectory } from "./Trajectory";
import { CameraTracker } from "./CameraTracker";
import { Moon, Orion, Earth, Sun } from "./Planets";

export const ArtemisScene = ({ focusTarget, trajectories }) => {
  const earthRef = useRef();
  const moonRef = useRef();
  const sunRef = useRef();
  const orionRef = useRef();

  const shouldRun = useStore((s) => s.shouldRun);
  const advance = useStore((s) => s.advance);

  const curves = useMemo(() => {
    const format = (data) =>
      data.map(
        (p) => new THREE.Vector3(p.x / 10000, p.z / 10000, -p.y / 10000),
      );
    return {
      orion:
        trajectories.orion && trajectories.orion.length > 1
          ? new THREE.CatmullRomCurve3(format(trajectories.orion))
          : null,
      moon:
        trajectories.moon && trajectories.moon.length > 1
          ? new THREE.CatmullRomCurve3(format(trajectories.moon))
          : null,
      earth:
        trajectories.earth && trajectories.earth.length > 1
          ? new THREE.CatmullRomCurve3(format(trajectories.earth))
          : null,
      sun:
        trajectories.sun && trajectories.sun.length > 1
          ? new THREE.CatmullRomCurve3(format(trajectories.sun))
          : null,
    };
  }, [trajectories]);

  let activeRef = moonRef;
  if (focusTarget === "Earth") activeRef = earthRef;
  if (focusTarget === "Sun") activeRef = sunRef;
  if (focusTarget === "Orion") activeRef = orionRef;

  useFrame((state, delta) => {
    // delta -> time between frames provided by R3F
    if (shouldRun) {
      advance(delta);
    }
  });

  return (
    <group>
      <Trajectory curve={curves.earth} color="blue" />
      <Trajectory curve={curves.moon} color="yellow" />
      <Trajectory curve={curves.orion} color="red" />
      {/* trajectory for debugging to see if sun actually moves */}
      <Trajectory curve={curves.sun} color="purple" />
      <Sun ref={sunRef} curve={curves.sun} />
      <Earth ref={earthRef} curve={curves.earth} />
      <Moon ref={moonRef} curve={curves.moon} />
      <Orion ref={orionRef} curve={curves.orion} />
      {activeRef && (
        <CameraTracker targetRef={activeRef} targetName={focusTarget} />
      )}
    </group>
  );
};
