import * as THREE from "three";
import { GalaxyType, NUM_STARS } from "../config/galaxyConfig";
import { FastSeededRandom } from "./FastSeededRandom";

// Pre-allocated reusable arrays and objects for performance
const colorCache = new Map<number, THREE.Color>();

// Extensive color palette for galaxy randomization
const STAR_COLORS = {
  // Hot young stars
  BLUE_SUPERGIANT: 0x3366ff,
  BLUE_GIANT: 0x4da6ff,
  BLUE_WHITE: 0x87ceeb,
  WHITE_HOT: 0xffffff,
  WHITE_DWARF: 0xf0f8ff,
  
  // Main sequence stars
  YELLOW_WHITE: 0xfffff0,
  SOLAR_YELLOW: 0xffff99,
  GOLDEN_YELLOW: 0xffd700,
  LIGHT_ORANGE: 0xffcc66,
  
  // Cooler stars
  ORANGE_GIANT: 0xff7f00,
  DEEP_ORANGE: 0xff4500,
  RED_GIANT: 0xff0000,
  DEEP_RED: 0x8b0000,
  BROWN_DWARF: 0xa0522d,
  
  // Nebula colors
  CYAN_EMISSION: 0x00ffff,
  TEAL_GAS: 0x008080,
  GREEN_NEBULA: 0x32cd32,
  MAGENTA_GLOW: 0xff00ff,
  PURPLE_NEBULA: 0x9932cc,
  VIOLET_EMISSION: 0x8a2be2,
  PINK_NEBULA: 0xffc0cb,
  CORAL_GLOW: 0xff7f50,
  
  // Exotic colors
  EMERALD_GREEN: 0x50c878,
  TURQUOISE: 0x40e0d0,
  INDIGO: 0x4b0082,
  CRIMSON: 0xdc143c,
  GOLD: 0xffd700,
  SILVER: 0xc0c0c0,
  COPPER: 0xb87333,
};

// Multiple color schemes that can apply to any galaxy type
const COLOR_SCHEMES = [
  // Young stellar population (hot blue stars)
  { core: STAR_COLORS.WHITE_HOT, mid: STAR_COLORS.BLUE_WHITE, edge: STAR_COLORS.BLUE_GIANT, name: "young_hot" },
  { core: STAR_COLORS.BLUE_WHITE, mid: STAR_COLORS.CYAN_EMISSION, edge: STAR_COLORS.TEAL_GAS, name: "young_cool" },
  
  // Old stellar population (red stars)
  { core: STAR_COLORS.GOLDEN_YELLOW, mid: STAR_COLORS.ORANGE_GIANT, edge: STAR_COLORS.RED_GIANT, name: "old_warm" },
  { core: STAR_COLORS.DEEP_ORANGE, mid: STAR_COLORS.DEEP_RED, edge: STAR_COLORS.BROWN_DWARF, name: "old_cool" },
  
  // Mixed populations
  { core: STAR_COLORS.WHITE_HOT, mid: STAR_COLORS.SOLAR_YELLOW, edge: STAR_COLORS.ORANGE_GIANT, name: "mixed_classic" },
  { core: STAR_COLORS.BLUE_GIANT, mid: STAR_COLORS.WHITE_DWARF, edge: STAR_COLORS.LIGHT_ORANGE, name: "mixed_modern" },
  
  // Nebula-rich regions
  { core: STAR_COLORS.MAGENTA_GLOW, mid: STAR_COLORS.PURPLE_NEBULA, edge: STAR_COLORS.VIOLET_EMISSION, name: "nebula_purple" },
  { core: STAR_COLORS.CYAN_EMISSION, mid: STAR_COLORS.TEAL_GAS, edge: STAR_COLORS.GREEN_NEBULA, name: "nebula_cyan" },
  { core: STAR_COLORS.PINK_NEBULA, mid: STAR_COLORS.CORAL_GLOW, edge: STAR_COLORS.DEEP_ORANGE, name: "nebula_warm" },
  
  // Exotic color schemes
  { core: STAR_COLORS.EMERALD_GREEN, mid: STAR_COLORS.TURQUOISE, edge: STAR_COLORS.CYAN_EMISSION, name: "exotic_green" },
  { core: STAR_COLORS.GOLD, mid: STAR_COLORS.COPPER, edge: STAR_COLORS.DEEP_ORANGE, name: "exotic_metal" },
  { core: STAR_COLORS.SILVER, mid: STAR_COLORS.WHITE_DWARF, edge: STAR_COLORS.BLUE_WHITE, name: "exotic_silver" },
  { core: STAR_COLORS.CRIMSON, mid: STAR_COLORS.MAGENTA_GLOW, edge: STAR_COLORS.PURPLE_NEBULA, name: "exotic_crimson" },
  
  // Monochromatic schemes
  { core: STAR_COLORS.BLUE_SUPERGIANT, mid: STAR_COLORS.BLUE_GIANT, edge: STAR_COLORS.BLUE_WHITE, name: "mono_blue" },
  { core: STAR_COLORS.RED_GIANT, mid: STAR_COLORS.DEEP_ORANGE, edge: STAR_COLORS.ORANGE_GIANT, name: "mono_red" },
  { core: STAR_COLORS.WHITE_HOT, mid: STAR_COLORS.WHITE_DWARF, edge: STAR_COLORS.SILVER, name: "mono_white" },
  
  // High contrast schemes
  { core: STAR_COLORS.WHITE_HOT, mid: STAR_COLORS.DEEP_RED, edge: STAR_COLORS.BLUE_GIANT, name: "contrast_fire_ice" },
  { core: STAR_COLORS.GOLD, mid: STAR_COLORS.PURPLE_NEBULA, edge: STAR_COLORS.EMERALD_GREEN, name: "contrast_rainbow" },
];

export interface GalaxyPositions {
  positions: Float32Array;
  colors: Float32Array;
}

// Get random color scheme
function getRandomColorScheme(rng: FastSeededRandom) {
  const schemeIndex = Math.floor(rng.next() * COLOR_SCHEMES.length);
  return COLOR_SCHEMES[schemeIndex];
}

// Get color based on distance from center and random scheme
function getDistanceBasedColor(
  colorScheme: { core: number; mid: number; edge: number },
  normalizedDistance: number,
  rng: FastSeededRandom
): THREE.Color {
  let baseColor: number;
  
  // Interpolate colors based on distance
  if (normalizedDistance < 0.3) {
    // Core region
    baseColor = colorScheme.core;
  } else if (normalizedDistance < 0.7) {
    // Mid region - sometimes blend core and mid colors
    const blendFactor = rng.next();
    if (blendFactor < 0.7) {
      baseColor = colorScheme.mid;
    } else {
      baseColor = colorScheme.core; // Some core colors in mid region
    }
  } else {
    // Edge region - sometimes blend mid and edge colors
    const blendFactor = rng.next();
    if (blendFactor < 0.8) {
      baseColor = colorScheme.edge;
    } else {
      baseColor = colorScheme.mid; // Some mid colors in edge region
    }
  }

  // Use cached color if available
  let color = colorCache.get(baseColor);
  if (!color) {
    color = new THREE.Color(baseColor);
    colorCache.set(baseColor, color);
  }
  
  return color.clone();
}

// Get completely random color from any in the palette
function getRandomStarColor(rng: FastSeededRandom): THREE.Color {
  const colorValues = Object.values(STAR_COLORS);
  const randomIndex = Math.floor(rng.next() * colorValues.length);
  const colorValue = colorValues[randomIndex];
  
  let color = colorCache.get(colorValue);
  if (!color) {
    color = new THREE.Color(colorValue);
    colorCache.set(colorValue, color);
  }
  
  return color.clone();
}

export function generateOptimizedSpiralGalaxy(seed: number): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);
  
  const rng = new FastSeededRandom(seed);
  
  // Basic structure parameters
  const armCount = Math.floor(rng.next() * 10) + 2; // 2-11 arms
  const armVariation = rng.next() * 0.8 + 0.5; // 0.5-1.3
  const spiralTightness = rng.next() * 2.5 + 0.3; // 0.3-2.8
  const coreSize = rng.next() * 0.8 + 0.5; // 0.5-1.3
  const armOffset = rng.next() * Math.PI * 2;
  
  // Arm characteristics
  const armThickness = rng.next() * 0.8 + 0.2; // 0.2-1.0
  const armThicknessVariation = rng.next() * 0.5 + 0.5; // Individual arm thickness variation
  const armBrightness = rng.next() * 0.6 + 0.7; // 0.7-1.3
  const armAsymmetryStrength = rng.next() * 0.4; // How asymmetric arms are
  
  // Core characteristics  
  const coreConcentration = rng.next() * 4 + 0.8; // 0.8-4.8
  const coreBrightness = rng.next() * 2 + 1; // 1-3
  const coreFlattening = rng.next() * 0.4 + 0.6; // 0.6-1.0
  
  // Randomness and chaos
  const outerRandomness = rng.next() * 0.6 + 0.05; // 0.05-0.65
  const innerRandomness = rng.next() * 0.3 + 0.05; // Less chaos in core
   
  // 3D orientation
  const thicknessVariation = rng.next() * 1.2 + 0.8; // 0.8-2.0
  const tiltX = (rng.next() - 0.5) * 0.8; // -0.4 to 0.4
  const tiltZ = (rng.next() - 0.5) * 0.6; // -0.3 to 0.3
  const rollRotation = (rng.next() - 0.5) * Math.PI; // Full roll rotation
  
  // Warping and distortions
  const warpFactor = (rng.next() - 0.5) * 0.4; // -0.2 to 0.2
  const spiralWave = rng.next() * 0.3; // Sinusoidal variations along arms
  const bulgeFactor = rng.next() * 0.6 + 0.7; // 0.7-1.3
  
  // Bar structure (some spirals have central bars)
  const hasBar = rng.next() < 0.4; // 40% chance of bar
  const barLength = hasBar ? rng.next() * 3 + 1 : 0; // 1-4 units
  const barThickness = hasBar ? rng.next() * 0.5 + 0.2 : 0;
  const barAngle = hasBar ? rng.next() * Math.PI : 0;
  
  // Ring structures (some spirals have rings)
  const hasRings = rng.next() < 0.3; // 30% chance of rings
  const ringCount = hasRings ? Math.floor(rng.next() * 3) + 1 : 0; // 1-3 rings
  const ringRadii = hasRings ? Array.from({length: ringCount}, () => rng.next() * 4 + 2) : [];
  
  
  // Color scheme selection
  const colorScheme = getRandomColorScheme(rng);
  const colorVariation = rng.next() * 0.3 + 0.1; // How much colors vary
  const useRandomColors = rng.next() < 0.2; // 20% chance for completely random colors

  // Pre-compute arm-specific variations
  const armVariationFactors = new Float32Array(armCount);
  const armAsymmetries = new Float32Array(armCount);
  const armThicknesses = new Float32Array(armCount);
  const armBrightnesses = new Float32Array(armCount);
  
  for (let arm = 0; arm < armCount; arm++) {
    armVariationFactors[arm] = Math.sin(arm * 2.5 + seed) * armVariation;
    armAsymmetries[arm] = Math.cos(arm * 1.7 + seed) * armAsymmetryStrength + 1;
    armThicknesses[arm] = armThickness * (1 + (rng.next() - 0.5) * armThicknessVariation);
    armBrightnesses[arm] = armBrightness * (1 + (rng.next() - 0.5) * 0.4);
  }

  // Generate all particles
  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;
    
    // Determine particle type and location
    const particleRand = rng.next();
    let isBarParticle = false;
    let isRingParticle = false;
    let ringIndex = -1;
    
    // Check if particle should be in bar (first 15% of particles if bar exists)
    if (hasBar && particleRand < 0.15) {
      isBarParticle = true;
    }
    // Check if particle should be in rings (next 10% if rings exist)
    else if (hasRings && particleRand < 0.25) {
      isRingParticle = true;
      ringIndex = Math.floor(rng.next() * ringCount);
    }
    
    let x: number, y: number, z: number, radius: number, normalizedRadius: number;
    
    if (isBarParticle) {
      // Generate bar particles
      const barRadius = rng.next() * barLength;
      const barAngleOffset = (rng.next() - 0.5) * barThickness;
      const barY = (rng.next() - 0.5) * barThickness * 0.3;
      
      x = Math.cos(barAngle + barAngleOffset) * barRadius;
      y = barY;
      z = Math.sin(barAngle + barAngleOffset) * barRadius;
      radius = barRadius;
      normalizedRadius = radius / 8;
      
    } else if (isRingParticle) {
      // Generate ring particles
      const ringRadius = ringRadii[ringIndex];
      const ringAngle = rng.next() * Math.PI * 2;
      const ringWidth = 0.3 + rng.next() * 0.2; // 0.3-0.5 width variation
      const ringVariation = (rng.next() - 0.5) * ringWidth;
      
      radius = ringRadius + ringVariation;
      x = Math.cos(ringAngle) * radius;
      y = (rng.next() - 0.5) * 0.4; // Thin vertical distribution
      z = Math.sin(ringAngle) * radius;
      normalizedRadius = radius / 8;
      
    } else {
      // Generate spiral arm particles
      const armIndex = i % armCount;
      const branchAngle = (armIndex / armCount) * Math.PI * 2 + armOffset;
      
      // Core vs arm distribution
      const coreRadius = 2 * coreSize;
      const isCore = rng.next() < 0.2; // 20% in core
      
      if (isCore) {
        // Core particles
        radius = Math.pow(rng.next(), coreConcentration) * coreRadius;
        const coreAngle = rng.next() * Math.PI * 2;
        x = Math.cos(coreAngle) * radius;
        y = (rng.next() - 0.5) * radius * coreFlattening;
        z = Math.sin(coreAngle) * radius;
      } else {
        // Arm particles
        radius = Math.pow(rng.next(), coreConcentration * coreSize) * 8;
        const spin = radius * 1.5 * spiralTightness;
        const armVariationFactor = armVariationFactors[armIndex];
        const armAsymmetry = armAsymmetries[armIndex];
        const armThick = armThicknesses[armIndex];
        
        // Add spiral wave variations
        const waveOffset = Math.sin(radius * 0.5) * spiralWave;
        
        // Calculate randomness based on distance from core
        const randomnessFactor = radius < coreRadius ? innerRandomness : outerRandomness;
        const randomX = Math.pow(rng.next(), coreConcentration) * (rng.next() < 0.5 ? 1 : -1) * radius * randomnessFactor;
        const randomY = Math.pow(rng.next(), coreConcentration) * (rng.next() < 0.5 ? 1 : -1) * radius * randomnessFactor * thicknessVariation * armThick;
        const randomZ = Math.pow(rng.next(), coreConcentration) * (rng.next() < 0.5 ? 1 : -1) * radius * randomnessFactor;
        
        // Base positions with wave variations
        x = Math.cos(branchAngle + spin + waveOffset) * radius * armVariationFactor * armAsymmetry + randomX;
        y = randomY + radius * warpFactor * Math.sin(branchAngle) * bulgeFactor;
        z = Math.sin(branchAngle + spin + waveOffset) * radius * armVariationFactor * armAsymmetry + randomZ;
      }
      
      normalizedRadius = radius / 8;
    }
    

    // Apply 3D rotations with roll
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);
    const cosZ = Math.cos(tiltZ);
    const sinZ = Math.sin(tiltZ);
    const cosRoll = Math.cos(rollRotation);
    const sinRoll = Math.sin(rollRotation);
    
    // Apply rotations in sequence: X, Z, then roll
    let rotX = x * cosX - y * sinX;
    const rotY = x * sinX + y * cosX;
    let rotZ = z;
    
    let finalX = rotX * cosZ - rotZ * sinZ;
    rotZ = rotX * sinZ + rotZ * cosZ;
    rotX = finalX;
    
    finalX = rotX * cosRoll - rotY * sinRoll;
    const finalY = rotX * sinRoll + rotY * cosRoll;
    const finalZ = rotZ;

    positions[i3] = finalX;
    positions[i3 + 1] = finalY;
    positions[i3 + 2] = finalZ;

    // Advanced color calculation
    let currentColor: THREE.Color;
    
    if (useRandomColors) {
      // Completely random colors
      currentColor = getRandomStarColor(rng);
    } else {
      // Use color scheme based on distance and particle type
      currentColor = getDistanceBasedColor(colorScheme, normalizedRadius, rng);
      
      // Add color variation
      const variation = (rng.next() - 0.5) * colorVariation;
      currentColor.r = Math.max(0, Math.min(1, currentColor.r + variation));
      currentColor.g = Math.max(0, Math.min(1, currentColor.g + variation));
      currentColor.b = Math.max(0, Math.min(1, currentColor.b + variation));
    }
    
    // Calculate brightness based on particle type and location
    let brightness = 1.0;
    
    if (isBarParticle) {
      brightness = coreBrightness * (1.5 - normalizedRadius * 0.8);
    } else if (isRingParticle) {
      brightness = 1.2 + Math.sin(normalizedRadius * 8) * 0.3; // Ring brightness variation
    } else {
      // Normal spiral arm brightness
      if (normalizedRadius < 0.2) {
        brightness = coreBrightness * (2.0 + rng.next() * 0.5);
      } else if (normalizedRadius < 0.6) {
        const armIndex = i % armCount;
        brightness = armBrightnesses[armIndex] * (1.2 - normalizedRadius * 0.3);
      } else {
        brightness = 0.4 + rng.next() * 0.3; // Dim outer regions
      }
    }
    
    
    // Apply brightness variation for realism
    brightness *= (0.8 + rng.next() * 0.4);
    
    currentColor.multiplyScalar(brightness);

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

export function generateOptimizedEllipticalGalaxy(seed: number): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);
  
  const rng = new FastSeededRandom(seed);
  
  // Basic shape parameters - constrained to prevent oversized dimensions
  const eccentricity = rng.next() * 0.9 + 0.1; // 0.1-1.0 (0.1 = nearly circular, 1.0 = very elongated)
  const majorAxisRatio = rng.next() * 2 + 0.8; // 0.8-2.8x (reduced from 3.8x)
  const minorAxisRatio = rng.next() * 1.5 + 0.3; // 0.3-1.8x (reduced from 2.3x)
  const verticalRatio = rng.next() * 1.2 + 0.2; // 0.2-1.4x (reduced from 1.7x)
  
  // Core characteristics
  const coreFlattening = rng.next() * 0.8 + 0.4; // 0.4-1.2
  const coreDensity = rng.next() * 5 + 0.5; // 0.5-5.5 concentration
  const coreBrightness = rng.next() * 3 + 1; // 1-4x brightness
  const coreSize = rng.next() * 0.6 + 0.3; // 0.3-0.9
  
  // Multiple core system (some ellipticals have multiple nuclei)
  const hasMultipleCores = rng.next() < 0.2; // 20% chance
  const coreCount = hasMultipleCores ? Math.floor(rng.next() * 3) + 2 : 1; // 2-4 cores
  const coreOffsets: Array<{x: number, y: number, z: number}> = [];
  
  if (hasMultipleCores) {
    for (let i = 0; i < coreCount; i++) {
      const offset = rng.next() * 2; // cores within 2 units of center
      const angle = rng.next() * Math.PI * 2;  
      coreOffsets.push({
        x: Math.cos(angle) * offset,
        y: (rng.next() - 0.5) * offset * 0.3,
        z: Math.sin(angle) * offset
      });
    }
  }
  
  // Stellar population variations
  const stellarAge = rng.next(); // 0 = young, 1 = old
  const metallicity = rng.next(); // affects color
  
  // Enhanced randomness and chaos for more asymmetry
  const outerSparseness = rng.next() * 0.8 + 0.05; // 0.05-0.85 (increased)
  const innerRandomness = rng.next() * 0.4 + 0.02; // 0.02-0.42 (increased from 0.2)
  const chaosLevel = rng.next() * 0.6 + 0.1; // 0.1-0.7 (increased from 0.4)
  
  // 3D orientation (full 3D rotation capability)
  const rollRotation = (rng.next() - 0.5) * Math.PI * 2; // Full roll
  const pitchRotation = (rng.next() - 0.5) * Math.PI; // Full pitch  
  const yawRotation = (rng.next() - 0.5) * Math.PI * 2; // Full yaw
  
  // Enhanced asymmetric imperfections (real ellipticals aren't perfect)
  const asymmetryX = rng.next() * 1.2 + 0.4; // 0.4-1.6x X-axis variation (increased range)
  const asymmetryY = rng.next() * 1.0 + 0.5; // 0.5-1.5x Y-axis variation (increased range)
  const asymmetryZ = rng.next() * 1.2 + 0.4; // 0.4-1.6x Z-axis variation (increased range)
  
  // Additional asymmetric distortions for more natural appearance
  const asymmetricTwist = (rng.next() - 0.5) * 0.6; // -0.3 to 0.3 twist factor
  const asymmetricBulge = rng.next() * 0.8 + 0.6; // 0.6-1.4x bulge asymmetry
  const offsetCenterX = (rng.next() - 0.5) * 2.0; // -1.0 to 1.0 center offset
  const offsetCenterY = (rng.next() - 0.5) * 1.5; // -0.75 to 0.75 center offset
  const offsetCenterZ = (rng.next() - 0.5) * 2.0; // -1.0 to 1.0 center offset
  
  
  // Density variations and substructure
  const densityLumpiness = rng.next() * 0.5; // 0-0.5 density variations
  const shellStructure = rng.next() * 0.4; // 0-0.4 shell/ring intensity
  const hasBoxy = rng.next() < 0.3; // 30% chance of boxy/peanut shape
  const boxyStrength = hasBoxy ? rng.next() * 0.3 + 0.1 : 0;
  
  // Halo structure (outer envelope)
  const hasHalo = rng.next() < 0.7; // 70% chance
  let haloExtent = hasHalo ? rng.next() * 6 + 4 : 0; // 4-10 units
  const haloFlattening = hasHalo ? rng.next() * 0.4 + 0.3 : 0; // 0.3-0.7
  
  // Size and scale - reduced to prevent initial oversizing before constraints
  const maxRadius = 5 + rng.next() * 3; // 5-8 units (reduced from 6-10)
  let semiMajor = maxRadius * majorAxisRatio;
  let semiMinor = maxRadius * minorAxisRatio * eccentricity;
  let semiVertical = maxRadius * verticalRatio;

  // Early validation: ensure no dimension exceeds reasonable pre-asymmetry limits
  // With max asymmetry of 1.4x, we need to keep initial values under 18 to ensure final < 25
  const maxInitialDimension = 18;
  if (semiMajor > maxInitialDimension) semiMajor = maxInitialDimension;
  if (semiMinor > maxInitialDimension) semiMinor = maxInitialDimension;
  if (semiVertical > maxInitialDimension) semiVertical = maxInitialDimension;

  // Apply improved balance constraints for elliptical galaxy dimensions:
  // 1. No axis can exceed 1.5x the second-largest axis (tighter than previous 2x)
  // 2. Smallest axis must be at least 0.4x the largest axis (prevents extreme flattening)
  // This ensures more balanced elliptical galaxies while still allowing natural variation
  const axes = [
    { value: semiMajor, name: 'semiMajor' },
    { value: semiMinor, name: 'semiMinor' }, 
    { value: semiVertical, name: 'semiVertical' }
  ].sort((a, b) => b.value - a.value);

  const largest = axes[0].value;
  const secondLargest = axes[1].value;

  // Constraint 1: Largest axis cannot exceed 1.5x the second-largest
  if (largest > secondLargest * 1.5) {
    const constrainedLargest = secondLargest * 1.5;
    
    // Apply constraint to the largest axis
    if (axes[0].name === 'semiMajor') {
      semiMajor = constrainedLargest;
    } else if (axes[0].name === 'semiMinor') {
      semiMinor = constrainedLargest;
    } else {
      semiVertical = constrainedLargest;
    }
  }

  // Constraint 2: Smallest axis must be at least 0.4x the largest axis
  const minAllowedSmallest = Math.max(semiMajor, semiMinor, semiVertical) * 0.4;
  if (axes[2].name === 'semiMajor' && semiMajor < minAllowedSmallest) {
    semiMajor = minAllowedSmallest;
  } else if (axes[2].name === 'semiMinor' && semiMinor < minAllowedSmallest) {
    semiMinor = minAllowedSmallest;
  } else if (axes[2].name === 'semiVertical' && semiVertical < minAllowedSmallest) {
    semiVertical = minAllowedSmallest;
  }

  // Constraint 3: All dimensions cannot exceed 25 units
  // Account for asymmetry scaling that will be applied later (max asymmetry is 1.6x for X/Z, 1.5x for Y)
  const maxAsymmetryX = 1.6;
  const maxAsymmetryY = 1.5 * 1.4; // Include asymmetricBulge factor (max 1.4)
  const maxAsymmetryZ = 1.6;
  
  const maxAllowedSemiMajor = 25 / maxAsymmetryX;  // ~15.63 to ensure final X ≤ 25
  const maxAllowedSemiMinor = 25 / maxAsymmetryZ;   // ~15.63 to ensure final Z ≤ 25
  const maxAllowedSemiVertical = 25 / maxAsymmetryY; // ~11.90 to ensure final Y ≤ 25
  
  if (semiMajor > maxAllowedSemiMajor) {
    semiMajor = maxAllowedSemiMajor;
  }
  if (semiMinor > maxAllowedSemiMinor) {
    semiMinor = maxAllowedSemiMinor;
  }
  if (semiVertical > maxAllowedSemiVertical) {
    semiVertical = maxAllowedSemiVertical;
  }

  // Additional constraint: prevent all three dimensions from exceeding 20 simultaneously
  // This ensures elliptical galaxies don't become overall too large
  // Account for asymmetry scaling when checking the 20-unit threshold
  const maxAllowed20SemiMajor = 20 / maxAsymmetryX;   // ~12.50
  const maxAllowed20SemiMinor = 20 / maxAsymmetryZ;    // ~12.50
  const maxAllowed20SemiVertical = 20 / maxAsymmetryY; // ~9.52
  
  if (semiMajor > maxAllowed20SemiMajor && semiMinor > maxAllowed20SemiMinor && semiVertical > maxAllowed20SemiVertical) {
    // Scale all dimensions proportionally to keep the largest within the asymmetry-adjusted 20-unit limit
    const maxDimension = Math.max(
      semiMajor / maxAllowed20SemiMajor, 
      semiMinor / maxAllowed20SemiMinor, 
      semiVertical / maxAllowed20SemiVertical
    );
    
    // FIX: Scale down by dividing by maxDimension, not multiplying by inverse
    semiMajor = semiMajor / maxDimension;
    semiMinor = semiMinor / maxDimension;
    semiVertical = semiVertical / maxDimension;
  }

  // Also constrain halo extent to respect the same balance
  if (hasHalo) {
    const maxAllowedHalo = Math.max(semiMajor, semiMinor, semiVertical) * 1.5; // Halo can be 1.5x the largest main axis
    haloExtent = Math.min(haloExtent, maxAllowedHalo);
  }
  
  // Color scheme selection
  const colorScheme = getRandomColorScheme(rng);
  const colorVariation = rng.next() * 0.4 + 0.1; // More color variation than spirals
  const useRandomColors = rng.next() < 0.15; // 15% chance for random colors
  const hasColorGradient = rng.next() < 0.8; // 80% have core-to-edge color gradient

  // Pre-compute trigonometry
  const cosRoll = Math.cos(rollRotation);
  const sinRoll = Math.sin(rollRotation);
  const cosPitch = Math.cos(pitchRotation);
  const sinPitch = Math.sin(pitchRotation);
  const cosYaw = Math.cos(yawRotation);
  const sinYaw = Math.sin(yawRotation);

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;
    
    // Determine particle type and distribution
    const particleRand = rng.next();
    let isHaloParticle = false;
    let coreIndex = 0;
    
    // Check if particle should be in halo (outer 20% if halo exists)
    if (hasHalo && particleRand < 0.2) {
      isHaloParticle = true;
    }
    // Check which core (if multiple cores exist)
    else if (hasMultipleCores) {
      coreIndex = Math.floor(rng.next() * coreCount);
    }

    let x: number, y: number, z: number, radius: number, normalizedRadius: number;
    
    if (isHaloParticle) {
      // Generate halo particles (extended, sparse distribution)
      const phi = rng.next() * Math.PI * 2;
      const cosTheta = (rng.next() - 0.5) * 2;
      const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
      
      const haloR = Math.pow(rng.next(), 0.5) * haloExtent; // Shallower profile for halo
      radius = haloR;
      
      x = haloR * sinTheta * Math.cos(phi);
      y = haloR * cosTheta * haloFlattening;  
      z = haloR * sinTheta * Math.sin(phi);
      
      normalizedRadius = radius / maxRadius;
      
    } else {
      // Generate core/main body particles
      const phi = rng.next() * Math.PI * 2;
      const cosTheta = (rng.next() - 0.5) * 2;
      const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

      // Use dynamic power distribution for varied core density
      const r = Math.pow(rng.next(), 1 / coreDensity) * coreSize;
      radius = r * maxRadius;
      
      // Add shell structure for more realistic ellipticals
      const shellFactor = 1 + Math.sin(r * 12 + seed) * shellStructure;
      
      // Base ellipsoidal coordinates
      let baseX = r * semiMajor * sinTheta * Math.cos(phi) * shellFactor;
      let baseY = r * semiVertical * cosTheta * coreFlattening;
      let baseZ = r * semiMinor * sinTheta * Math.sin(phi) * shellFactor;
      
      // Apply boxy/peanut distortion
      if (hasBoxy) {
        const boxyFactor = 1 + boxyStrength * (Math.abs(baseX) + Math.abs(baseZ)) / Math.max(Math.abs(baseX), Math.abs(baseZ), 0.1);
        baseY *= boxyFactor;
      }
      
      // Multiple core offset
      if (hasMultipleCores && coreIndex < coreOffsets.length) {
        const offset = coreOffsets[coreIndex];
        baseX += offset.x * (1 - r); // Stronger offset for particles closer to center
        baseY += offset.y * (1 - r);
        baseZ += offset.z * (1 - r);
      }
      
      // Apply enhanced asymmetric scaling and distortions for imperfect ellipse
      x = baseX * asymmetryX;
      y = baseY * asymmetryY * asymmetricBulge;
      z = baseZ * asymmetryZ;
      
      // Apply asymmetric twist (rotation around Y-axis based on distance from center)
      const twistAngle = asymmetricTwist * r * 2; // Stronger twist further from center
      const cosT = Math.cos(twistAngle);
      const sinT = Math.sin(twistAngle);
      const twistedX = x * cosT - z * sinT;
      const twistedZ = x * sinT + z * cosT;
      x = twistedX;
      z = twistedZ;
      
      // Apply center offset for asymmetric galaxy center
      x += offsetCenterX * (1 - r * 0.5); // Less offset for outer particles
      y += offsetCenterY * (1 - r * 0.5);
      z += offsetCenterZ * (1 - r * 0.5);
      
      normalizedRadius = Math.sqrt(x*x + y*y + z*z) / maxRadius;
    }
    
    
    // Add density lumpiness for realistic irregularities
    const lumpinessEffect = 1 + Math.sin(x * 2 + seed) * Math.cos(y * 3 + seed) * Math.sin(z * 2.5 + seed) * densityLumpiness;
    
    // Skip some particles in very low density regions
    if (rng.next() > lumpinessEffect) {
      const skipFactor = 0.2;
      x *= skipFactor;
      y *= skipFactor; 
      z *= skipFactor;
    }
    
    // Apply randomness based on location
    const randomnessFactor = normalizedRadius < 0.3 ? innerRandomness : outerSparseness;
    const randomX = (rng.next() - 0.5) * randomnessFactor * semiMajor * chaosLevel;
    const randomY = (rng.next() - 0.5) * randomnessFactor * semiVertical * chaosLevel;
    const randomZ = (rng.next() - 0.5) * randomnessFactor * semiMinor * chaosLevel;
    
    x += randomX;
    y += randomY;
    z += randomZ;
    
    // Apply 3D rotations in sequence: Roll, Pitch, Yaw
    // Roll rotation (around Z axis)
    let rotX = x * cosRoll - y * sinRoll;
    let rotY = x * sinRoll + y * cosRoll;
    let rotZ = z;
    
    // Pitch rotation (around X axis)  
    const pitchedY = rotY * cosPitch - rotZ * sinPitch;
    rotZ = rotY * sinPitch + rotZ * cosPitch;
    rotY = pitchedY;
    
    // Yaw rotation (around Y axis)
    const finalX = rotX * cosYaw - rotZ * sinYaw;
    const finalZ = rotX * sinYaw + rotZ * cosYaw;
    rotX = finalX;

    positions[i3] = rotX;
    positions[i3 + 1] = rotY;
    positions[i3 + 2] = finalZ;

    // Advanced color calculation
    let currentColor: THREE.Color;
    
    if (useRandomColors) {
      // Completely random colors
      currentColor = getRandomStarColor(rng);
    } else {
      // Use color scheme with stellar population effects
      currentColor = getDistanceBasedColor(colorScheme, normalizedRadius, rng);
      
      // Apply stellar age effects to color
      if (stellarAge > 0.7) {
        // Old population - redder
        currentColor.r = Math.min(1, currentColor.r * (1 + stellarAge * 0.3));
        currentColor.g = Math.max(0, currentColor.g * (1 - stellarAge * 0.2));
        currentColor.b = Math.max(0, currentColor.b * (1 - stellarAge * 0.4));
      } else if (stellarAge < 0.3) {
        // Young population - bluer
        currentColor.b = Math.min(1, currentColor.b * (1 + (1-stellarAge) * 0.4));
        currentColor.r = Math.max(0, currentColor.r * (1 - (1-stellarAge) * 0.2));
      }
      
      // Apply metallicity effects
      if (metallicity > 0.7) {
        // High metallicity - more yellow/orange
        currentColor.g = Math.min(1, currentColor.g * (1 + metallicity * 0.2));
        currentColor.r = Math.min(1, currentColor.r * (1 + metallicity * 0.15));
      }
      
      // Color gradient from core to edge
      if (hasColorGradient) {
        const gradientFactor = normalizedRadius * 0.3;
        currentColor.r = Math.max(0, currentColor.r - gradientFactor);
        currentColor.g = Math.max(0, currentColor.g - gradientFactor * 0.5);
        currentColor.b = Math.max(0, currentColor.b + gradientFactor * 0.2);
      }
      
      // Add color variation
      const variation = (rng.next() - 0.5) * colorVariation;
      currentColor.r = Math.max(0, Math.min(1, currentColor.r + variation));
      currentColor.g = Math.max(0, Math.min(1, currentColor.g + variation));
      currentColor.b = Math.max(0, Math.min(1, currentColor.b + variation));
    }
    
    // Calculate brightness based on particle type and location
    let brightness = 1.0;
    
    if (isHaloParticle) {
      brightness = 0.1 + (1 - normalizedRadius) * 0.2; // Very dim halo
    } else if (hasMultipleCores && coreIndex < coreOffsets.length) {
      // Multiple core brightness
      const distanceFromCore = Math.sqrt(
        (x - coreOffsets[coreIndex].x) ** 2 + 
        (y - coreOffsets[coreIndex].y) ** 2 + 
        (z - coreOffsets[coreIndex].z) ** 2
      );
      brightness = coreBrightness * Math.exp(-distanceFromCore * 2);
    } else {
      // Normal elliptical brightness distribution
      if (normalizedRadius < 0.1) {
        brightness = coreBrightness * (3.0 + rng.next() * 0.5);
      } else if (normalizedRadius < 0.4) {
        brightness = coreBrightness * (2.0 - normalizedRadius * 2);
      } else if (normalizedRadius < 0.8) {
        brightness = 0.8 - normalizedRadius * 0.6;
      } else {
        brightness = 0.1 + rng.next() * 0.1; // Very dim outer regions
      }
    }
    
    
    // Apply lumpiness effect to brightness
    brightness *= lumpinessEffect;
    
    // Apply brightness variation for realism
    brightness *= (0.7 + rng.next() * 0.6);
    
    currentColor.multiplyScalar(brightness);

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

export function generateOptimizedIrregularGalaxy(seed: number): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);
  
  const rng = new FastSeededRandom(seed);
  
  // Generate dramatically varied parameters  
  const clusterCount = Math.floor(rng.next() * 15) + 3; // 3-17 clusters
  const clusterScatter = rng.next() * 1.2 + 0.4; // 0.4 to 1.6
  const asymmetryBoost = rng.next() * 1.5 + 0.3; // 0.3 to 1.8
  const bridgeDensity = rng.next() * 0.7 + 0.1; // 0.1 to 0.8
  const chaosLevel = rng.next() * 1.0 + 0.1; // 0.1 to 1.1
  const verticalChaos = rng.next() * 1.8 + 0.8; // 0.8 to 2.6
  const globalTiltX = (rng.next() - 0.5) * Math.PI; // Full tilt range
  const globalTiltY = (rng.next() - 0.5) * Math.PI;
  
  // New parameters for more variety
  const starburstIntensity = rng.next(); // Starburst regions
  const gasCloudDensity = rng.next() * 0.6; // Gas cloud regions
  const formationActivity = rng.next(); // Star formation activity
  
  
  const maxRadius = 2.5 + rng.next() * 3; // 2.5-5.5 units
  const clusterSpread = maxRadius * (0.5 + clusterScatter * 0.6);
  const clusterRadius = maxRadius * (0.15 + rng.next() * 0.4);
  
  // Color scheme selection
  const colorScheme = getRandomColorScheme(rng);  
  const colorVariation = rng.next() * 0.6 + 0.2; // High color variation
  const useRandomColors = rng.next() < 0.3; // 30% chance for random colors
  const hasActiveFormation = rng.next() < 0.7; // 70% have active star formation

  // Pre-generate cluster centers with individual properties
  interface ClusterProperties {
    center: THREE.Vector3;
    radius: number;
    ellipticityX: number;  // X-axis scaling
    ellipticityY: number;  // Y-axis scaling  
    ellipticityZ: number;  // Z-axis scaling
    density: number;       // Core density factor
    brightness: number;    // Brightness multiplier
  }
  
  const clusters: ClusterProperties[] = [];
  for (let i = 0; i < clusterCount; i++) {
    const clusterSeed = seed + i * 17.3;
    
    const clusterX = Math.sin(clusterSeed) * clusterSpread * 1.5 * asymmetryBoost * (0.4 + rng.next() * 0.4);
    const clusterY = Math.cos(clusterSeed * 1.7) * clusterSpread * verticalChaos * 0.6;
    const clusterZ = Math.sin(clusterSeed * 2.1) * clusterSpread * clusterScatter * (0.3 + rng.next() * 0.6);
    
    const chaosX = (rng.next() - 0.5) * clusterSpread * chaosLevel * 0.3;
    const chaosY = (rng.next() - 0.5) * clusterSpread * chaosLevel * 0.2;
    const chaosZ = (rng.next() - 0.5) * clusterSpread * chaosLevel * 0.3;
    
    // Generate variable cluster properties
    const baseRadius = clusterRadius * (0.5 + rng.next() * 1.0); // 50%-150% size variation
    const ellipticityX = 0.7 + rng.next() * 0.6; // 0.7-1.3x X scaling
    const ellipticityY = 0.6 + rng.next() * 0.8; // 0.6-1.4x Y scaling (more vertical variation)
    const ellipticityZ = 0.7 + rng.next() * 0.6; // 0.7-1.3x Z scaling
    const density = 0.5 + rng.next() * 1.0; // 0.5-1.5x density variation
    const brightness = 0.7 + rng.next() * 0.6; // 0.7-1.3x brightness variation
    
    clusters.push({
      center: new THREE.Vector3(
        clusterX + chaosX,
        clusterY + chaosY,
        clusterZ + chaosZ
      ),
      radius: baseRadius,
      ellipticityX,
      ellipticityY, 
      ellipticityZ,
      density,
      brightness
    });
  }
  
  // Create legacy clusterCenters array for compatibility
  const clusterCenters = clusters.map(cluster => cluster.center);


  // Pre-compute rotation matrices
  const cosX = Math.cos(globalTiltX);
  const sinX = Math.sin(globalTiltX);
  const cosY = Math.cos(globalTiltY);
  const sinY = Math.sin(globalTiltY);

  const clusterProbability = 0.6 - bridgeDensity * 0.2;

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;
    const distributionRand = rng.next();

    let x: number, y: number, z: number;
    let currentClusterIndex = -1; // Track which cluster this particle belongs to

    if (distributionRand < clusterProbability) {
      // Cluster distribution with variable cluster properties
      currentClusterIndex = Math.floor(rng.next() * clusterCount);
      const cluster = clusters[currentClusterIndex];
      const clusterCenter = cluster.center;

      const angle = rng.next() * Math.PI * 2;
      // Use cluster-specific radius and density
      const baseRadius = Math.pow(rng.next(), 0.7 * cluster.density) * cluster.radius * (0.5 + rng.next() * 0.4);
      
      // Apply elliptical shape to cluster
      const radiusX = baseRadius * cluster.ellipticityX;
      const radiusY = baseRadius * cluster.ellipticityY;
      const radiusZ = baseRadius * cluster.ellipticityZ;
      
      // Generate elliptical distribution
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const height = (rng.next() - 0.5) * radiusY * verticalChaos * (0.6 + rng.next() * 0.3);

      x = clusterCenter.x + cosAngle * radiusX + (rng.next() - 0.5) * cluster.radius * chaosLevel * 0.15;
      y = clusterCenter.y + height + (rng.next() - 0.5) * cluster.radius * chaosLevel * 0.1;
      z = clusterCenter.z + sinAngle * radiusZ + (rng.next() - 0.5) * cluster.radius * chaosLevel * 0.15;
    } else {
      // Bridge or sparse distribution with improved thickness
      const clusterAIndex = Math.floor(rng.next() * clusterCount);
      const clusterBIndex = Math.floor(rng.next() * clusterCount);
      const clusterA = clusterCenters[clusterAIndex];
      const clusterB = clusterCenters[clusterBIndex];

      const bridgeProgress = rng.next();
      
      // Base bridge position
      const baseX = clusterA.x + (clusterB.x - clusterA.x) * bridgeProgress;
      const baseY = clusterA.y + (clusterB.y - clusterA.y) * bridgeProgress;
      const baseZ = clusterA.z + (clusterB.z - clusterA.z) * bridgeProgress;
      
      // Calculate bridge thickness based on distance and position along bridge
      const bridgeDistance = Math.sqrt(
        (clusterB.x - clusterA.x) ** 2 + 
        (clusterB.y - clusterA.y) ** 2 + 
        (clusterB.z - clusterA.z) ** 2
      );
      
      // Create much thicker, blob-like connections using cluster-specific radii
      // Use average radius of the two connected clusters
      const avgClusterRadius = (clusters[clusterAIndex].radius + clusters[clusterBIndex].radius) * 0.5;
      
      // Reduce tapering significantly and increase base thickness
      const distanceFromCenter = Math.abs(bridgeProgress - 0.5) * 2; // 0 at center, 1 at ends
      const baseThickness = avgClusterRadius * 0.8; // Use cluster-specific radius
      const bridgeThickness = baseThickness * (1 - distanceFromCenter * 0.15); // Reduced tapering from 0.4 to 0.15
      
      // Much more generous minimum thickness to prevent thin lines
      const minThickness = Math.max(
        avgClusterRadius * 0.6, // Always at least 60% of average cluster radius
        Math.min(bridgeDistance * 0.25, avgClusterRadius * 0.9) // Up to 90% of average cluster radius for reasonable distances
      );
      const finalThickness = Math.max(bridgeThickness, minThickness);
      
      // Add perpendicular spread to create thick, natural bridge
      const bridgeDirection = new THREE.Vector3(
        clusterB.x - clusterA.x,
        clusterB.y - clusterA.y,
        clusterB.z - clusterA.z
      ).normalize();
      
      // Create perpendicular vectors for bridge thickness
      const perpendicular1 = new THREE.Vector3();
      const perpendicular2 = new THREE.Vector3();
      
      // Find two perpendicular vectors to the bridge direction
      if (Math.abs(bridgeDirection.x) < 0.9) {
        perpendicular1.crossVectors(bridgeDirection, new THREE.Vector3(1, 0, 0)).normalize();
      } else {
        perpendicular1.crossVectors(bridgeDirection, new THREE.Vector3(0, 1, 0)).normalize();
      }
      perpendicular2.crossVectors(bridgeDirection, perpendicular1).normalize();
      
      // Apply thickness using both perpendicular directions
      const thicknessAngle = rng.next() * Math.PI * 2;
      // Change from Gaussian to more uniform distribution for thicker, blob-like appearance
      const thicknessRadius = Math.pow(rng.next(), 0.3) * finalThickness; // Less concentrated toward center
      
      const thicknessOffsetX = (Math.cos(thicknessAngle) * perpendicular1.x + Math.sin(thicknessAngle) * perpendicular2.x) * thicknessRadius;
      const thicknessOffsetY = (Math.cos(thicknessAngle) * perpendicular1.y + Math.sin(thicknessAngle) * perpendicular2.y) * thicknessRadius;
      const thicknessOffsetZ = (Math.cos(thicknessAngle) * perpendicular1.z + Math.sin(thicknessAngle) * perpendicular2.z) * thicknessRadius;
      
      // Add random bulges along the bridge for more organic, blob-like appearance
      const bulgeFactor = 1 + Math.sin(bridgeProgress * Math.PI * 4 + seed) * 0.3; // Sinusoidal bulges
      const randomBulge = 1 + (rng.next() - 0.5) * 0.4; // Random thickness variation
      const combinedBulge = bulgeFactor * randomBulge;
      
      x = baseX + thicknessOffsetX * combinedBulge;
      y = baseY + thicknessOffsetY * combinedBulge;
      z = baseZ + thicknessOffsetZ * combinedBulge;
    }

    // Apply global rotations (optimized)
    const rotatedX = x * cosY - z * sinY;
    const rotatedZ = x * sinY + z * cosY;
    const finalY = y * cosX - rotatedZ * sinX;
    const finalZ = y * sinX + rotatedZ * cosX;

    // Final randomness
    const finalRandomness = 0.8 * chaosLevel;
    positions[i3] = rotatedX + (rng.next() - 0.5) * finalRandomness * 0.8;
    positions[i3 + 1] = finalY + (rng.next() - 0.5) * finalRandomness * 0.8;
    positions[i3 + 2] = finalZ + (rng.next() - 0.5) * finalRandomness * 0.8;

    // Advanced color calculation
    let currentColor: THREE.Color;
    
    if (useRandomColors) {
      currentColor = getRandomStarColor(rng);
    } else {
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = Math.min(distanceFromCenter / (clusterSpread * 0.7), 1);
      currentColor = getDistanceBasedColor(colorScheme, normalizedDistance, rng);
      
      // Active star formation effects
      if (hasActiveFormation && distributionRand < clusterProbability && normalizedDistance < 0.4) {
        // Young hot stars in cluster cores
        currentColor.b = Math.min(1, currentColor.b * (1 + formationActivity * 0.6));
        currentColor.r = Math.max(0, currentColor.r * (1 - formationActivity * 0.2));
      }
      
      // Starburst region effects
      if (starburstIntensity > 0.6 && normalizedDistance < 0.3) {
        currentColor.r = Math.min(1, currentColor.r * (1 + starburstIntensity * 0.5));
        currentColor.g = Math.min(1, currentColor.g * (1 + starburstIntensity * 0.4));
      }
      
      // Gas cloud effects (more nebular colors)
      if (gasCloudDensity > 0.4 && rng.next() < gasCloudDensity) {
        currentColor.g = Math.min(1, currentColor.g * (1 + gasCloudDensity * 0.3));
        currentColor.b = Math.min(1, currentColor.b * (1 + gasCloudDensity * 0.4));
      }
      
      // Color variation
      const variation = (rng.next() - 0.5) * colorVariation;
      currentColor.r = Math.max(0, Math.min(1, currentColor.r + variation));
      currentColor.g = Math.max(0, Math.min(1, currentColor.g + variation));
      currentColor.b = Math.max(0, Math.min(1, currentColor.b + variation));
    }
    
    // Dynamic brightness calculation
    const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
    const normalizedDistance = Math.min(distanceFromCenter / (clusterSpread * 0.7), 1);
    let brightness;
    
    if (distributionRand < clusterProbability) {
      // Cluster particles - use cluster-specific brightness with starburst effects
      const cluster = clusters[currentClusterIndex];
      let baseBrightness;
      
      if (normalizedDistance < 0.2) {
        baseBrightness = 2.5 + starburstIntensity * 2.0; // Very bright starburst cores
      } else if (normalizedDistance < 0.5) {
        baseBrightness = 1.2 + formationActivity * 1.0; // Active formation regions
      } else if (normalizedDistance < 0.8) {
        baseBrightness = 0.4 + gasCloudDensity * 0.8; // Gas cloud regions
      } else {
        baseBrightness = 0.2 + rng.next() * 0.3;
      }
      
      // Apply cluster-specific brightness multiplier
      brightness = baseBrightness * cluster.brightness;
    } else {
      // Bridge particles
      const bridgeDistanceFromEnds = Math.abs(0.5 - (distributionRand - clusterProbability) / bridgeDensity) * 2;
      brightness = (0.3 + bridgeDistanceFromEnds * 0.4) * (0.8 + rng.next() * 0.3);
      brightness += gasCloudDensity * 0.5; // Gas bridges can be brighter
    }
    
    
    currentColor.multiplyScalar(brightness);

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

// Main optimized generation function
export function generateOptimizedGalaxyShape(type: GalaxyType, seed: number): GalaxyPositions {
  switch (type) {
    case "spiral":
      return generateOptimizedSpiralGalaxy(seed);
    case "elliptical":
      return generateOptimizedEllipticalGalaxy(seed);
    case "irregular":
      return generateOptimizedIrregularGalaxy(seed);
    default:
      return generateOptimizedSpiralGalaxy(seed);
  }
}