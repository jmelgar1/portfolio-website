// =============================================================================
// ASTEROID CONSTANTS
// =============================================================================
// All configuration constants for asteroid generation, physics, and animation

// =============================================================================
// ASTEROID COUNT AND SIZING
// =============================================================================
export const ASTEROID_COUNT = 59;
export const ASTEROID_SIZE_MIN = 0.15;
export const ASTEROID_SIZE_MAX = 0.55; // 0.15 + 0.4
export const ASTEROID_BASE_RADIUS = 0.25;

// =============================================================================
// MOVEMENT AND PHYSICS CONSTANTS
// =============================================================================
export const ASTEROID_SPEED_MIN = 2.0;
export const ASTEROID_SPEED_VARIATION = 0.8; // Added to min for max speed of 2.8
export const ASTEROID_DENSITY = 2.5;
export const DAMPING_FACTOR = 0.998;

// =============================================================================
// SPAWN AND TARGET AREAS
// =============================================================================
export const SPAWN_AREA = {
  X: { MIN: -25, MAX: -20 },
  Y: { MIN: 6, MAX: 8 },
  Z: -25
} as const;

export const TARGET_AREA = {
  X: { MIN: 20, MAX: 25 },
  Y: { MIN: 6, MAX: 8 }
} as const;

// Initial distribution constants
export const HORIZONTAL_PATH = {
  START_X: -25,
  END_X: 25,
  CENTER_Y: 7,
  Y_VARIATION: 2
} as const;

// =============================================================================
// EXIT BOUNDARIES
// =============================================================================
export const EXIT_BOUNDARIES = {
  TOP: 10,
  RIGHT: 30,
  LEFT: -30,
  BOTTOM: -10
} as const;

// =============================================================================
// COLLISION DETECTION CONSTANTS
// =============================================================================
export const COLLISION_DETECTION_FACTOR = 0.35;
export const COLLISION_SEPARATION_FACTOR = 0.4;
export const COLLISION_COOLDOWN_MS = 100;
export const COLLISION_RESTITUTION = 0.5;
export const SEPARATION_FORCE_MULTIPLIER = 2.0;

// =============================================================================
// NOISE AND PROCEDURAL GENERATION
// =============================================================================
export const NOISE_CONFIG = {
  SEED_OFFSET_MULTIPLIER: 1000,
  SCALE: 3.0,
  DISPLACEMENT_SCALE: 0.15,
  OCTAVES: 3,
  PERSISTENCE: 0.6,
  LACUNARITY: 2.0
} as const;

// =============================================================================
// GEOMETRY CONSTANTS
// =============================================================================
export const SPHERE_GEOMETRY = {
  WIDTH_SEGMENTS: 16,
  HEIGHT_SEGMENTS: 12
} as const;

// =============================================================================
// ROTATION CONSTANTS
// =============================================================================
export const ROTATION_SPEED_MULTIPLIER = 2;

// =============================================================================
// FADE ANIMATION CONSTANTS
// =============================================================================
export const FADE_ANIMATION = {
  DELAY: 0.6,
  DURATION: 0.4
} as const;

// =============================================================================
// MATERIAL CONSTANTS
// =============================================================================
export const ASTEROID_MATERIAL = {
  COLOR: { R: 0.4, G: 0.35, B: 0.3 },
  ROUGHNESS: 0.9,
  METALNESS: 0.1
} as const;

// =============================================================================
// LIGHTING CONSTANTS
// =============================================================================
export const DIRECTIONAL_LIGHT = {
  POSITION: { X: 10, Y: 0, Z: 0 },
  INTENSITY: 0.6,
  COLOR: 0xffffff
} as const;

// =============================================================================
// DISTRIBUTION CONSTANTS
// =============================================================================
export const DISTRIBUTION = {
  CLUSTER_VARIATION: 0.03,
  POSITION_RANDOMNESS: 2,
  Z_VARIATION: 0.1
} as const;

// =============================================================================
// MASS CALCULATION CONSTANTS
// =============================================================================
export const MASS_CALCULATION = {
  VOLUME_FACTOR: 4 / 3,
  SIZE_SCALING_FACTOR: 0.25
} as const;