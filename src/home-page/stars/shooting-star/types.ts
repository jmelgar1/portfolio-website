import * as THREE from "three";

export interface ShootingStar {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trailPositions: THREE.Vector3[];
  maxTrailLength: number;
}

export interface CanvasBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface CameraConfig {
  fov: number;
  position: number;
  aspect: number;
}
