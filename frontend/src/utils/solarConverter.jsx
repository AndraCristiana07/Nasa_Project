import * as THREE from 'three';

export const convertCoords = (lat, lng, radius) => {
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