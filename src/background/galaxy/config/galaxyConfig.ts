// Galaxy Parameters
export const NUM_STARS = 50000;

// Galaxy Types
export type GalaxyType = "spiral" | "elliptical" | "irregular";

// Common Parameters
export const GALAXY_THICKNESS = 5;
export const TRANSITION_DURATION_MS = 1000;

// Spiral Galaxy Parameters
export const SPIRAL = {
  ARMS: 6,
  SPIRAL_FACTOR: 1.5,
  ARMS_CONSTANT: 2.0,
  ARM_X_MEAN: 200,
  ARM_Y_MEAN: 100,
  RANDOMNESS: 0.2,
};

// Elliptical Galaxy Parameters
export const ELLIPTICAL = {
  SEMI_MAJOR_AXIS: 300,
  SEMI_MINOR_AXIS: 150,
  ECCENTRICITY: 0.7,
  CORE_DENSITY: 3.0,
  RANDOMNESS: 0.3,
};

// Irregular Galaxy Parameters
export const IRREGULAR = {
  CLUSTER_COUNT: 8,
  CLUSTER_RADIUS: 80,
  CLUSTER_SPREAD: 200,
  ASYMMETRY_FACTOR: 1.5,
  RANDOMNESS: 0.8,
};

// Legacy exports for backward compatibility
export const ARMS = SPIRAL.ARMS;
export const CORE_X_DIST = 33;
export const CORE_Y_DIST = 33;
export const OUTER_CORE_X_DIST = 100;
export const OUTER_CORE_Y_DIST = 100;
export const ARM_X_DIST = 100;
export const ARM_Y_DIST = 50;
export const ARM_X_MEAN = SPIRAL.ARM_X_MEAN;
export const ARM_Y_MEAN = SPIRAL.ARM_Y_MEAN;
export const ARMS_CONSTANT = SPIRAL.ARMS_CONSTANT;
export const HAZE_RATIO = SPIRAL.RANDOMNESS;
