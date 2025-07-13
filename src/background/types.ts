export interface TwinklingStarGroupProps {
  positions: Float32Array;
  phase: number;
  speed: number;
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