import { GalaxyType } from '../config/galaxyConfig';

// Velocity thresholds for galaxy type transitions
export const VELOCITY_THRESHOLDS = {
  SLOW: 1.0,      // Below this = spiral (default/calm state)
  MEDIUM: 4.0,    // Between SLOW and MEDIUM = elliptical (medium activity)
  FAST: 8.0,      // Above MEDIUM = irregular (high activity/chaos)
} as const;

/**
 * Maps mouse velocity to appropriate galaxy type
 * Slow movement = spiral (ordered, calm)
 * Medium movement = elliptical (structured but dynamic)
 * Fast movement = irregular (chaotic, energetic)
 */
export const velocityToGalaxyType = (velocity: number): GalaxyType => {
  if (velocity < VELOCITY_THRESHOLDS.SLOW) {
    return 'spiral';
  } else if (velocity < VELOCITY_THRESHOLDS.FAST) {
    return 'elliptical';
  } else {
    return 'irregular';
  }
};

/**
 * Gets transition delay based on velocity
 * Faster movement = faster transitions for responsiveness
 */
export const getTransitionDelay = (velocity: number): number => {
  if (velocity < VELOCITY_THRESHOLDS.SLOW) {
    return 1500; // Slower transitions for calm movement to avoid jitter
  } else if (velocity < VELOCITY_THRESHOLDS.FAST) {
    return 800; // Medium speed transitions
  } else {
    return 400; // Faster transitions for rapid movement
  }
};

/**
 * Debounce function to prevent too frequent transitions
 * Returns true if enough time has passed since last transition
 */
export const shouldTransition = (
  lastTransitionTime: number,
  currentTime: number,
  velocity: number
): boolean => {
  const minDelay = getTransitionDelay(velocity);
  return (currentTime - lastTransitionTime) >= minDelay;
};