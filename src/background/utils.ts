import * as THREE from 'three';
import { CanvasBounds, CameraConfig } from './types';

export const getCanvasBounds = (depth: number): CanvasBounds => {
  const camera: CameraConfig = {
    fov: 75,
    position: 5,
    aspect: window.innerWidth / window.innerHeight
  };
  
  const distance = camera.position + Math.abs(depth);
  const fovRad = (camera.fov * Math.PI) / 180;
  const halfHeight = Math.tan(fovRad / 2) * distance;
  const halfWidth = halfHeight * camera.aspect;
  
  return {
    left: -halfWidth,
    right: halfWidth,
    top: halfHeight,
    bottom: -halfHeight,
    width: halfWidth * 2,
    height: halfHeight * 2
  };
};

export const isOutOfBounds = (position: THREE.Vector3, bounds: CanvasBounds): boolean => {
  const buffer = 2;
  return position.x < bounds.left - buffer || 
         position.x > bounds.right + buffer || 
         position.y < bounds.bottom - buffer || 
         position.y > bounds.top + buffer;
};

export const generateStarInFrustum = (depth: number) => {
  const cameraFov = 75;
  const cameraAspect = window.innerWidth / window.innerHeight;
  const fovRad = (cameraFov * Math.PI) / 180;
  const halfHeight = Math.tan(fovRad / 2) * depth;
  const halfWidth = halfHeight * cameraAspect;
  
  return {
    x: (Math.random() - 0.5) * 2 * halfWidth,
    y: (Math.random() - 0.5) * 2 * halfHeight,
    z: -depth
  };
};