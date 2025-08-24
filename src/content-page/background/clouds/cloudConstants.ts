// =============================================================================
// CLOUD CONSTANTS
// =============================================================================
// All configuration constants for cloud generation, animation, and appearance

// =============================================================================
// SEEDED RANDOM FUNCTION CONSTANTS
// =============================================================================
export const RANDOM_MULTIPLIER = 9301;
export const RANDOM_INCREMENT = 49297;
export const RANDOM_MODULUS = 233280;

// =============================================================================
// CLOUD GEOMETRY CONSTANTS
// =============================================================================
export const BASE_CLOUD_RADIUS = 2;

// Cloud Type Parameters
export const CLOUD_TYPE_PARAMS = {
  PUFFY: {
    SEGMENTS_MIN: 14,
    SEGMENTS_RANGE: 4,
    NOISE_SCALE_1_BASE: 0.4,
    NOISE_SCALE_1_RANGE: 0.5,
    NOISE_SCALE_2_BASE: 0.2,
    NOISE_SCALE_2_RANGE: 0.3,
    NOISE_SCALE_3_BASE: 0.05,
    NOISE_SCALE_3_RANGE: 0.1,
    FLATTEN_AMOUNT_BASE: 0.85,
    FLATTEN_AMOUNT_RANGE: 0.1,
    ASYMMETRY_X_BASE: 0.8,
    ASYMMETRY_X_RANGE: 0.4,
    ASYMMETRY_Y_BASE: 0.9,
    ASYMMETRY_Y_RANGE: 0.2,
    ASYMMETRY_Z_BASE: 0.8,
    ASYMMETRY_Z_RANGE: 0.4,
    BULGE_FREQ_MIN: 2,
    BULGE_FREQ_RANGE: 3,
  },
  WISPY: {
    SEGMENTS_MIN: 10,
    SEGMENTS_RANGE: 3,
    NOISE_SCALE_1_BASE: 0.6,
    NOISE_SCALE_1_RANGE: 0.8,
    NOISE_SCALE_2_BASE: 0.3,
    NOISE_SCALE_2_RANGE: 0.4,
    NOISE_SCALE_3_BASE: 0.1,
    NOISE_SCALE_3_RANGE: 0.2,
    FLATTEN_AMOUNT_BASE: 0.7,
    FLATTEN_AMOUNT_RANGE: 0.2,
    ASYMMETRY_X_BASE: 1.5,
    ASYMMETRY_X_RANGE: 0.8,
    ASYMMETRY_Y_BASE: 0.4,
    ASYMMETRY_Y_RANGE: 0.3,
    ASYMMETRY_Z_BASE: 0.7,
    ASYMMETRY_Z_RANGE: 0.4,
    BULGE_FREQ_MIN: 1,
    BULGE_FREQ_RANGE: 2,
  },
  DENSE: {
    SEGMENTS_MIN: 16,
    SEGMENTS_RANGE: 3,
    NOISE_SCALE_1_BASE: 0.2,
    NOISE_SCALE_1_RANGE: 0.3,
    NOISE_SCALE_2_BASE: 0.1,
    NOISE_SCALE_2_RANGE: 0.15,
    NOISE_SCALE_3_BASE: 0.02,
    NOISE_SCALE_3_RANGE: 0.05,
    FLATTEN_AMOUNT_BASE: 0.9,
    FLATTEN_AMOUNT_RANGE: 0.08,
    ASYMMETRY_X_BASE: 0.85,
    ASYMMETRY_X_RANGE: 0.3,
    ASYMMETRY_Y_BASE: 1.0,
    ASYMMETRY_Y_RANGE: 0.3,
    ASYMMETRY_Z_BASE: 0.85,
    ASYMMETRY_Z_RANGE: 0.3,
    BULGE_FREQ_MIN: 3,
    BULGE_FREQ_RANGE: 4,
  },
  ELONGATED: {
    SEGMENTS_MIN: 12,
    SEGMENTS_RANGE: 4,
    NOISE_SCALE_1_BASE: 0.3,
    NOISE_SCALE_1_RANGE: 0.4,
    NOISE_SCALE_2_BASE: 0.15,
    NOISE_SCALE_2_RANGE: 0.25,
    NOISE_SCALE_3_BASE: 0.05,
    NOISE_SCALE_3_RANGE: 0.1,
    FLATTEN_AMOUNT_BASE: 0.8,
    FLATTEN_AMOUNT_RANGE: 0.15,
    ASYMMETRY_X_BASE: 2.0,
    ASYMMETRY_X_RANGE: 1.0,
    ASYMMETRY_Y_BASE: 0.6,
    ASYMMETRY_Y_RANGE: 0.3,
    ASYMMETRY_Z_BASE: 0.8,
    ASYMMETRY_Z_RANGE: 0.3,
    BULGE_FREQ_MIN: 2,
    BULGE_FREQ_RANGE: 3,
  },
} as const;

// =============================================================================
// CLOUD DEFORMATION CONSTANTS
// =============================================================================
export const BULGE_PATTERN_STRENGTH = 0.3;
export const BULGE_RANDOM_STRENGTH = 0.2;
export const BULGE_NEGATIVE_THRESHOLD = 0.3;
export const BULGE_NEGATIVE_FACTOR = -0.5;
export const BULGE_PHI_MULTIPLIER = 0.7;
export const DISPLACEMENT_WEIGHT_2 = 0.7;
export const DISPLACEMENT_WEIGHT_3 = 0.3;
export const WARP_STRENGTH = 0.1;
export const WARP_PHI_MULTIPLIER = 2;
export const WARP_THETA_MULTIPLIER = 1.5;

// =============================================================================
// CLOUD COLOR CONSTANTS
// =============================================================================
export const COLOR_SEED_OFFSET = 1000;
export const BASE_HUE = 200;
export const HUE_VARIATION_RANGE = 20;
export const SATURATION_BASE = 5;
export const SATURATION_RANGE = 10;
export const LIGHTNESS_BASE = 97;
export const LIGHTNESS_RANGE = 3;

// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================
export const ANIMATION_SPEED_MULTIPLIER = 10;
export const RESET_POSITION_RIGHT = 150;
export const RESET_POSITION_LEFT = -150;
export const FLOATING_MOTION_FREQUENCY = 0.5;
export const FLOATING_MOTION_POSITION_FACTOR = 0.1;
export const FLOATING_MOTION_AMPLITUDE = 0.5;

// =============================================================================
// MATERIAL CONSTANTS
// =============================================================================
export const CLOUD_OPACITY = 0.9;
export const CLOUD_ROUGHNESS = 1.0;
export const CLOUD_METALNESS = 0.0;
export const CLOUD_ALPHA_TEST = 0.1;

// =============================================================================
// CLOUD GENERATION CONSTANTS
// =============================================================================
export const TOTAL_CLOUDS = 44;
export const MASTER_SEED = 12345;
export const CLOUD_X_RANGE = 480;
export const CLOUD_X_OFFSET = -240;
export const CLOUD_X_RANDOMNESS = 80;
export const CLOUD_Y_MIN = -25;
export const CLOUD_Y_RANGE = 65;
export const CLOUD_Z_MIN = -25;
export const CLOUD_Z_RANGE = 50;
export const CLOUD_SCALE_MIN = 4.16;
export const CLOUD_SCALE_RANGE = 4.84;
export const CLOUD_SPEED_MIN = 0.2;
export const CLOUD_SPEED_RANGE = 0.6;
export const CLOUD_SEED_BASE = 10000;
export const CLOUD_SEED_RANGE = 100000;

// =============================================================================
// GROUP POSITIONING CONSTANTS
// =============================================================================
export const GROUP_Y_OFFSET = -10;
export const GROUP_Z_OFFSET = -600;

// =============================================================================
// PRECISION CONSTANTS
// =============================================================================
export const SCALE_PRECISION_MULTIPLIER = 10;
export const SPEED_PRECISION_MULTIPLIER = 100;