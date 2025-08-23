import * as THREE from "three";
import { CameraConfig, CanvasBounds } from "./types";

export const getCanvasBounds = (depth: number): CanvasBounds => {
  const camera: CameraConfig = {
    fov: 75,
    position: 0, // Camera position is at Y=0, looking down positive Y-axis
    aspect: window.innerWidth / window.innerHeight,
  };

  // For Y-axis camera: depth is the distance along Y-axis from camera
  const distance = Math.abs(depth - camera.position);
  const fovRad = (camera.fov * Math.PI) / 180;
  const halfHeight = Math.tan(fovRad / 2) * distance;
  const halfWidth = halfHeight * camera.aspect;

  return {
    left: -halfWidth,
    right: halfWidth,
    top: halfHeight,
    bottom: -halfHeight,
    width: halfWidth * 2,
    height: halfHeight * 2,
  };
};

export const generateEdgePositions = (
  edge: number,
  bounds: CanvasBounds,
  spawnMargin: number,
  depth: number,
): { startPos: THREE.Vector3; endPos: THREE.Vector3 } => {
  let startPos: THREE.Vector3;
  let endPos: THREE.Vector3;

  // For Y-axis camera: X is left-right, Z is up-down, Y is depth
  switch (edge) {
    case 0: // Left edge
      startPos = new THREE.Vector3(
        bounds.left - spawnMargin,
        depth,
        Math.random() * bounds.height + bounds.bottom,
      );
      endPos = new THREE.Vector3(
        bounds.right + spawnMargin,
        depth,
        Math.random() * bounds.height + bounds.bottom,
      );
      break;
    case 1: // Right edge
      startPos = new THREE.Vector3(
        bounds.right + spawnMargin,
        depth,
        Math.random() * bounds.height + bounds.bottom,
      );
      endPos = new THREE.Vector3(
        bounds.left - spawnMargin,
        depth,
        Math.random() * bounds.height + bounds.bottom,
      );
      break;
    case 2: // Top edge
      startPos = new THREE.Vector3(
        Math.random() * bounds.width + bounds.left,
        depth,
        bounds.top + spawnMargin,
      );
      endPos = new THREE.Vector3(
        Math.random() * bounds.width + bounds.left,
        depth,
        bounds.bottom - spawnMargin,
      );
      break;
    case 3: // Bottom edge
      startPos = new THREE.Vector3(
        Math.random() * bounds.width + bounds.left,
        depth,
        bounds.bottom - spawnMargin,
      );
      endPos = new THREE.Vector3(
        Math.random() * bounds.width + bounds.left,
        depth,
        bounds.top + spawnMargin,
      );
      break;
    default:
      startPos = new THREE.Vector3(bounds.left - spawnMargin, depth, 0);
      endPos = new THREE.Vector3(bounds.right + spawnMargin, depth, 0);
  }

  return { startPos, endPos };
};

export const isOutOfBounds = (
  position: THREE.Vector3,
  bounds: CanvasBounds,
): boolean => {
  const buffer = 2;
  // For Y-axis camera: check X (left-right) and Z (up-down) bounds
  return (
    position.x < bounds.left - buffer ||
    position.x > bounds.right + buffer ||
    position.z < bounds.bottom - buffer ||
    position.z > bounds.top + buffer
  );
};
