import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";

const SUN_BUFFER = 1.02;
const EARTH_BUFFER = 1.5;
const MOON_BUFFER = 1.2;
const ORION_BUFFER = 2.5;

export function CameraTracker({ targetRef, targetName }) {
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
      const delta = deltaRef.current.subVectors(
        currentPosition,
        lastPosition.current,
      );
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
      const radius =
        targetRef.current.getObjectByProperty("type", "Mesh").geometry
          ?.parameters?.radius || 1;

      const currentDist = camera.position.distanceTo(targetPos);
      if (currentDist > radius * 100) {
        camera.position.copy(targetPos).add(new THREE.Vector3(0, 0, 10));
      }

      // calculate the direction from target to camera
      let direction = new THREE.Vector3()
        .subVectors(camera.position, targetPos)
        .normalize();
      if (direction.length() === 0 || isNaN(direction.x))
        direction.set(0, 0, 1);

      // to be diferent for a small screen
      let multiplier = isSmallScreen ? 4.0 : 2.5;
      if (targetName === "Sun") multiplier = isSmallScreen ? 4.5 : 2.2;
      if (targetName === "Orion") multiplier = isSmallScreen ? 15.0 : 10.0;

      const totalPush = radius * multiplier;
      // move the camera to the new position: Target + (Direction * Total Distance)
      const newPos = new THREE.Vector3()
        .copy(targetPos)
        .add(direction.multiplyScalar(totalPush));

      camera.position.copy(newPos);
      camera.lookAt(targetPos);
      if (targetName === "Sun")
        controlsRef.current.minDistance = radius * SUN_BUFFER;
      if (targetName === "Earth")
        controlsRef.current.minDistance = radius * EARTH_BUFFER;
      if (targetName === "Moon")
        controlsRef.current.minDistance = radius * MOON_BUFFER;
      if (targetName === "Orion")
        controlsRef.current.minDistance = radius * ORION_BUFFER;

      controlsRef.current.target.copy(targetPos);
      controlsRef.current.update();

      lastPosition.current.copy(targetPos);
    }
  }, [targetName, isSmallScreen, camera, targetRef]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        makeDefault
        enableDamping={true}
        screenSpacePanning={true}
        dampingFactor={0.05}
        maxDistance={1000000}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} intensity={0.2} mipmapBlur />
      </EffectComposer>
    </>
  );
}
