// Define ranges for parameter randomization
export const SPIRAL_RANGES = {
  ARMS: { min: 3, max: 10 },
  SPIRAL_FACTOR: { min: 1.0, max: 2.5 },
  ARMS_CONSTANT: { min: 1.5, max: 3.0 },
  ARM_X_MEAN: { min: 150, max: 300 },
  ARM_Y_MEAN: { min: 50, max: 150 },
  RANDOMNESS: { min: 0.1, max: 0.4 },
};

export const ELLIPTICAL_RANGES = {
  SEMI_MAJOR_AXIS: { min: 200, max: 400 },
  SEMI_MINOR_AXIS: { min: 100, max: 250 },
  ECCENTRICITY: { min: 0.3, max: 0.9 },
  CORE_DENSITY: { min: 2.0, max: 4.0 },
  RANDOMNESS: { min: 0.2, max: 0.5 },
};

export const IRREGULAR_RANGES = {
  CLUSTER_COUNT: { min: 4, max: 12 },
  CLUSTER_RADIUS: { min: 50, max: 120 },
  CLUSTER_SPREAD: { min: 150, max: 300 },
  ASYMMETRY_FACTOR: { min: 1.2, max: 2.0 },
  RANDOMNESS: { min: 0.5, max: 1.2 },
};

// Mouse-influenced parameter generation
export interface DynamicSpiralParams {
  ARMS: number;
  SPIRAL_FACTOR: number;
  ARMS_CONSTANT: number;
  ARM_X_MEAN: number;
  ARM_Y_MEAN: number;
  RANDOMNESS: number;
}

export interface DynamicEllipticalParams {
  SEMI_MAJOR_AXIS: number;
  SEMI_MINOR_AXIS: number;
  ECCENTRICITY: number;
  CORE_DENSITY: number;
  RANDOMNESS: number;
}

export interface DynamicIrregularParams {
  CLUSTER_COUNT: number;
  CLUSTER_RADIUS: number;
  CLUSTER_SPREAD: number;
  ASYMMETRY_FACTOR: number;
  RANDOMNESS: number;
}

// Utility to map mouse position/velocity to value within range
const mapMouseToRange = (mouseValue: number, min: number, max: number): number => {
  // mouseValue is between -1 and 1, normalize to 0-1
  const normalized = (mouseValue + 1) / 2;
  return min + normalized * (max - min);
};

// Generate dynamic parameters based on mouse position and velocity
export const generateDynamicSpiralParams = (
  mouseX: number,
  mouseY: number,
  velocity: number
): DynamicSpiralParams => {
  // Use velocity to influence randomness and spiral factor
  const velocityInfluence = Math.min(velocity * 0.1, 1);
  
  return {
    ARMS: Math.round(mapMouseToRange(mouseX, SPIRAL_RANGES.ARMS.min, SPIRAL_RANGES.ARMS.max)),
    SPIRAL_FACTOR: mapMouseToRange(mouseY, SPIRAL_RANGES.SPIRAL_FACTOR.min, SPIRAL_RANGES.SPIRAL_FACTOR.max),
    ARMS_CONSTANT: mapMouseToRange(mouseX * mouseY, SPIRAL_RANGES.ARMS_CONSTANT.min, SPIRAL_RANGES.ARMS_CONSTANT.max),
    ARM_X_MEAN: mapMouseToRange(Math.abs(mouseX), SPIRAL_RANGES.ARM_X_MEAN.min, SPIRAL_RANGES.ARM_X_MEAN.max),
    ARM_Y_MEAN: mapMouseToRange(Math.abs(mouseY), SPIRAL_RANGES.ARM_Y_MEAN.min, SPIRAL_RANGES.ARM_Y_MEAN.max),
    RANDOMNESS: SPIRAL_RANGES.RANDOMNESS.min + velocityInfluence * (SPIRAL_RANGES.RANDOMNESS.max - SPIRAL_RANGES.RANDOMNESS.min),
  };
};

export const generateDynamicEllipticalParams = (
  mouseX: number,
  mouseY: number,
  velocity: number
): DynamicEllipticalParams => {
  const velocityInfluence = Math.min(velocity * 0.1, 1);
  
  return {
    SEMI_MAJOR_AXIS: mapMouseToRange(Math.abs(mouseX), ELLIPTICAL_RANGES.SEMI_MAJOR_AXIS.min, ELLIPTICAL_RANGES.SEMI_MAJOR_AXIS.max),
    SEMI_MINOR_AXIS: mapMouseToRange(Math.abs(mouseY), ELLIPTICAL_RANGES.SEMI_MINOR_AXIS.min, ELLIPTICAL_RANGES.SEMI_MINOR_AXIS.max),
    ECCENTRICITY: mapMouseToRange(mouseX, ELLIPTICAL_RANGES.ECCENTRICITY.min, ELLIPTICAL_RANGES.ECCENTRICITY.max),
    CORE_DENSITY: mapMouseToRange(mouseY, ELLIPTICAL_RANGES.CORE_DENSITY.min, ELLIPTICAL_RANGES.CORE_DENSITY.max),
    RANDOMNESS: ELLIPTICAL_RANGES.RANDOMNESS.min + velocityInfluence * (ELLIPTICAL_RANGES.RANDOMNESS.max - ELLIPTICAL_RANGES.RANDOMNESS.min),
  };
};

export const generateDynamicIrregularParams = (
  mouseX: number,
  mouseY: number,
  velocity: number
): DynamicIrregularParams => {
  const velocityInfluence = Math.min(velocity * 0.1, 1);
  
  return {
    CLUSTER_COUNT: Math.round(mapMouseToRange(Math.abs(mouseX), IRREGULAR_RANGES.CLUSTER_COUNT.min, IRREGULAR_RANGES.CLUSTER_COUNT.max)),
    CLUSTER_RADIUS: mapMouseToRange(mouseY, IRREGULAR_RANGES.CLUSTER_RADIUS.min, IRREGULAR_RANGES.CLUSTER_RADIUS.max),
    CLUSTER_SPREAD: mapMouseToRange(Math.abs(mouseX * mouseY), IRREGULAR_RANGES.CLUSTER_SPREAD.min, IRREGULAR_RANGES.CLUSTER_SPREAD.max),
    ASYMMETRY_FACTOR: mapMouseToRange(mouseX, IRREGULAR_RANGES.ASYMMETRY_FACTOR.min, IRREGULAR_RANGES.ASYMMETRY_FACTOR.max),
    RANDOMNESS: IRREGULAR_RANGES.RANDOMNESS.min + velocityInfluence * (IRREGULAR_RANGES.RANDOMNESS.max - IRREGULAR_RANGES.RANDOMNESS.min),
  };
};

// Main function to generate all dynamic parameters
export const generateAllDynamicParams = (mouseX: number, mouseY: number, velocity: number) => ({
  spiral: generateDynamicSpiralParams(mouseX, mouseY, velocity),
  elliptical: generateDynamicEllipticalParams(mouseX, mouseY, velocity),
  irregular: generateDynamicIrregularParams(mouseX, mouseY, velocity),
});