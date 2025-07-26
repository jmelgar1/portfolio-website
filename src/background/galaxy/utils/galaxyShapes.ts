import * as THREE from "three";
import {
  GalaxyType,
  SPIRAL,
  IRREGULAR,
  NUM_STARS,
} from "../config/galaxyConfig";
import {
  DynamicSpiralParams,
  DynamicEllipticalParams,
  DynamicIrregularParams,
} from "../config/dynamicGalaxyConfig";

// Expanded galaxy color palette - realistic astronomical colors
const GALAXY_COLORS = {
  // Core/Hot colors - young, hot stars and active regions
  BLUE_GIANT: 0x4da6ff,     // Hot blue-white stars
  WHITE_HOT: 0xfff4e6,      // Very hot white stars
  BLUE_WHITE: 0xa0c4ff,     // Blue-white stars
  GOLDEN_CORE: 0xffd700,    // Golden core regions
  ORANGE_GIANT: 0xff7f00,   // Orange giant stars
  RED_GIANT: 0xff4500,      // Red giant stars
  
  // Mid-range colors - main sequence stars
  SOLAR_YELLOW: 0xffeb3b,   // Sun-like stars
  AMBER_STAR: 0xffc107,     // Amber starlight
  CORAL_GLOW: 0xff6b6b,     // Coral nebula glow
  ROSE_NEBULA: 0xff69b4,    // Rose-colored gas
  CYAN_BRIGHT: 0x00ffff,    // Cyan emission
  
  // Cool/Edge colors - older, cooler regions and dust
  DEEP_RED: 0x8b0000,       // Deep red dwarfs
  PURPLE_NEBULA: 0x9932cc,  // Purple emission nebula
  VIOLET_EDGE: 0x8a2be2,    // Violet edges
  INDIGO_DUST: 0x4b0082,    // Indigo dust lanes
  TEAL_GAS: 0x008080,       // Teal ionized gas
  CRIMSON_CLOUD: 0xdc143c,  // Crimson gas clouds
  MAGENTA_GLOW: 0xff00ff,   // Magenta emission
  ROYAL_BLUE: 0x4169e1,     // Royal blue regions
};

// Galaxy color themes - each galaxy type gets distinct color personalities
const SPIRAL_THEME = {
  dominant: GALAXY_COLORS.GOLDEN_CORE,     // 60% - warm golden core
  secondary: GALAXY_COLORS.BLUE_WHITE,     // 30% - blue-white arms
  accent: GALAXY_COLORS.ORANGE_GIANT,      // 10% - orange highlights
};

const ELLIPTICAL_THEME = {
  dominant: GALAXY_COLORS.AMBER_STAR,      // 60% - warm amber glow
  secondary: GALAXY_COLORS.RED_GIANT,      // 30% - red giant population
  accent: GALAXY_COLORS.WHITE_HOT,         // 10% - hot white core stars
};

const IRREGULAR_THEME = {
  dominant: GALAXY_COLORS.CYAN_BRIGHT,     // 60% - active cyan star formation
  secondary: GALAXY_COLORS.MAGENTA_GLOW,   // 30% - magenta emission nebula
  accent: GALAXY_COLORS.PURPLE_NEBULA,     // 10% - purple gas clouds
};

// Weighted color selection function
const getWeightedColor = (theme: {dominant: number, secondary: number, accent: number}): THREE.Color => {
  const rand = Math.random();
  
  if (rand < 0.6) {
    return new THREE.Color(theme.dominant);
  } else if (rand < 0.9) {
    return new THREE.Color(theme.secondary);
  } else {
    return new THREE.Color(theme.accent);
  }
};

export interface GalaxyPositions {
  positions: Float32Array;
  colors: Float32Array;
}

export function generateSpiralGalaxy(params: DynamicSpiralParams = SPIRAL, seed?: number): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);

  // Create truly unique seed-based random number generator
  const galaxySeed = seed || Math.random() * 100000;
  let seedState = galaxySeed;
  const seededRandom = () => {
    seedState = (seedState * 9301 + 49297) % 233280;
    return seedState / 233280;
  };

  // Generate dramatically varied parameters for infinite uniqueness
  const armCount = Math.floor(seededRandom() * 8) + 3; // 3-10 arms
  const armVariation = seededRandom() * 0.6 + 0.7; // 0.7 to 1.3
  const spiralTightness = seededRandom() * 1.2 + 0.8; // 0.8 to 2.0
  const coreSize = seededRandom() * 0.6 + 0.7; // 0.7 to 1.3
  const armOffset = seededRandom() * Math.PI * 2; // Full rotation offset
  const armThickness = seededRandom() * 0.5 + 0.5; // 0.5 to 1.0
  const coreConcentration = seededRandom() * 3 + 1; // 1.0 to 4.0
  const outerRandomness = seededRandom() * 0.4 + 0.1; // 0.1 to 0.5
  
  // 3D orientation variations using seeded random
  const thicknessVariation = seededRandom() * 0.8 + 1.2; // 1.2-2.0x thickness
  const tiltX = (seededRandom() - 0.5) * 0.6; // -0.3 to 0.3 radians tilt
  const tiltZ = (seededRandom() - 0.5) * 0.4; // -0.2 to 0.2 radians tilt
  const warpFactor = (seededRandom() - 0.5) * 0.2; // Subtle warp
  const bulgeFactor = seededRandom() * 0.3 + 0.8; // Core bulge variation

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Apply dramatic procedural variations for unique spiral patterns
    const branchAngle = ((i % armCount) / armCount) * (Math.PI * 2) + armOffset;
    const radius = Math.pow(seededRandom(), coreConcentration * coreSize) * (params.ARM_X_MEAN / 25);
    const spin = radius * params.SPIRAL_FACTOR * spiralTightness;
    
    // Add arm-specific variation for more organic spiral shapes
    const armIndex = i % armCount;
    const armVariationFactor = Math.sin(armIndex * 2.5 + galaxySeed) * armVariation;
    const armAsymmetry = Math.cos(armIndex * 1.7 + galaxySeed) * 0.1 + 1; // Per-arm asymmetry

    // Use spiral galaxy color theme - Golden/Blue-white/Orange
    const currentColor = getWeightedColor(SPIRAL_THEME);
    
    // Dramatic distance-based brightness variation - very bright core
    const normalizedRadius = radius / (params.ARM_X_MEAN / 25);
    let brightness;
    if (normalizedRadius < 0.3) {
      brightness = 3.0; // Very bright core
    } else if (normalizedRadius < 0.6) {
      brightness = 1.5; // Medium brightness
    } else {
      brightness = 0.3; // Dim edges
    }
    currentColor.multiplyScalar(brightness);

    const randomX =
      Math.pow(seededRandom(), coreConcentration) *
      (seededRandom() < 0.5 ? 1 : -1) *
      radius *
      outerRandomness;
    const randomY =
      Math.pow(seededRandom(), coreConcentration) *
      (seededRandom() < 0.5 ? 1 : -1) *
      radius *
      outerRandomness * thicknessVariation * armThickness; // Apply thickness and arm variation
    const randomZ =
      Math.pow(seededRandom(), coreConcentration) *
      (seededRandom() < 0.5 ? 1 : -1) *
      radius *
      outerRandomness;

    // Base positions with asymmetric arm variations
    const x = Math.cos(branchAngle + spin) * radius * armVariationFactor * armAsymmetry + randomX;
    const y = randomY + radius * warpFactor * Math.sin(branchAngle) * bulgeFactor; // Add galactic warp and bulge
    const z = Math.sin(branchAngle + spin) * radius * armVariationFactor * armAsymmetry + randomZ;
    
    // Apply 3D rotations for different orientations
    const rotatedX = x * Math.cos(tiltX) - y * Math.sin(tiltX);
    const rotatedY = x * Math.sin(tiltX) + y * Math.cos(tiltX);
    
    const finalX = rotatedX * Math.cos(tiltZ) - z * Math.sin(tiltZ);
    const finalZ = rotatedX * Math.sin(tiltZ) + z * Math.cos(tiltZ);
    
    positions[i3] = finalX;
    positions[i3 + 1] = rotatedY;
    positions[i3 + 2] = finalZ;

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

export function generateEllipticalGalaxy(params: DynamicEllipticalParams = ELLIPTICAL, seed?: number): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);

  // Create seeded random generator for consistent uniqueness
  const galaxySeed = seed || Math.random() * 100000;
  let seedState = galaxySeed;
  const seededRandom = () => {
    seedState = (seedState * 9301 + 49297) % 233280;
    return seedState / 233280;
  };

  // Use parameter values with some variation for uniqueness
  const eccentricity = params.ECCENTRICITY + (seededRandom() - 0.5) * 0.2; // Vary around param value
  const semiMajorAxis = params.SEMI_MAJOR_AXIS / 30; // Scale to appropriate size
  const semiMinorAxis = params.SEMI_MINOR_AXIS / 30; // Scale to appropriate size
  const coreFlattening = seededRandom() * 0.6 + 0.7; // 0.7 to 1.3
  const coreDensity = params.CORE_DENSITY + (seededRandom() - 0.5) * 1; // Vary around param value
  const outerSparseness = params.RANDOMNESS + (seededRandom() - 0.5) * 0.2; // Vary around param value
  
  // 3D orientation variations using seeded random
  const verticalStretch = seededRandom() * 0.8 + 1; // 1.0-1.8x vertical stretch
  const rollRotation = (seededRandom() - 0.5) * Math.PI; // -π/2 to π/2 radians roll
  const pitchRotation = (seededRandom() - 0.5) * 0.8; // -0.4 to 0.4 radians pitch
  const yawRotation = (seededRandom() - 0.5) * Math.PI * 2; // Full 360° rotation
  
  // Asymmetric imperfections for realistic ellipticals
  const asymmetryX = seededRandom() * 0.6 + 0.7; // 0.7-1.3x X-axis variation
  const asymmetryZ = seededRandom() * 0.6 + 0.7; // 0.7-1.3x Z-axis variation
  const dustLaneStrength = seededRandom() * 0.5; // 0-0.5 dust lane intensity
  const densityLumpiness = seededRandom() * 0.4; // 0-0.4 density variations
  const shellStructure = seededRandom() * 0.3; // 0-0.3 shell/ring structure

  // Use the parameter-based axes
  const semiMajor = semiMajorAxis;
  const semiMinor = semiMinorAxis * eccentricity; // True elliptical variation

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Generate ellipsoidal distribution with seeded random
    const phi = seededRandom() * Math.PI * 2;
    const cosTheta = (seededRandom() - 0.5) * 2;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

    // Use dynamic power distribution for varied core density
    const r = Math.pow(seededRandom(), 1 / coreDensity);
    
    // Add shell structure for more realistic ellipticals
    const shellFactor = 1 + Math.sin(r * 15 + galaxySeed) * shellStructure;

    // Scale by dynamic ellipse parameters with shell structure
    const baseX = r * semiMajor * sinTheta * Math.cos(phi) * shellFactor;
    const baseY = r * semiMinor * cosTheta * coreFlattening * verticalStretch;
    const baseZ = r * semiMajor * sinTheta * Math.sin(phi) * shellFactor;
    
    // Apply asymmetric scaling for imperfect ellipse
    let x = baseX * asymmetryX;
    let y = baseY;
    let z = baseZ * asymmetryZ;
    
    // Add subtle dust lane effects (density reduction in equatorial plane)
    const dustLaneEffect = Math.abs(baseY) < (semiMinor * 0.1) ? (1 - dustLaneStrength) : 1;
    
    // Add density lumpiness for realistic irregularities using seeded values
    const lumpinessEffect = 1 + Math.sin(phi * 3 + galaxySeed) * Math.cos(cosTheta * 5 + galaxySeed) * densityLumpiness;
    
    // Skip some particles in dust lanes (creates realistic gaps)
    if (seededRandom() > dustLaneEffect * lumpinessEffect) {
      // Make this particle much dimmer or skip it by reducing its contribution
      const skipFactor = 0.3; // Make it very dim instead of completely removing
      x *= skipFactor;
      y *= skipFactor; 
      z *= skipFactor;
    }
    
    // Apply multiple 3D rotations for varied orientations
    // Roll rotation (around Z axis)
    const rolledX = x * Math.cos(rollRotation) - y * Math.sin(rollRotation);
    const rolledY = x * Math.sin(rollRotation) + y * Math.cos(rollRotation);
    
    // Pitch rotation (around X axis)  
    const pitchedY = rolledY * Math.cos(pitchRotation) - z * Math.sin(pitchRotation);
    const pitchedZ = rolledY * Math.sin(pitchRotation) + z * Math.cos(pitchRotation);
    
    // Yaw rotation (around Y axis)
    const tiltedX = rolledX * Math.cos(yawRotation) - pitchedZ * Math.sin(yawRotation);
    const finalZ = rolledX * Math.sin(yawRotation) + pitchedZ * Math.cos(yawRotation);

    // Add randomness with seeded values
    const randomX = (seededRandom() - 0.5) * outerSparseness * semiMajor;
    const randomY = (seededRandom() - 0.5) * outerSparseness * semiMinor;
    const randomZ = (seededRandom() - 0.5) * outerSparseness * semiMajor;

    positions[i3] = tiltedX + randomX;
    positions[i3 + 1] = pitchedY + randomY;
    positions[i3 + 2] = finalZ + randomZ;

    // Use elliptical galaxy color theme - Amber/Red/White
    const currentColor = getWeightedColor(ELLIPTICAL_THEME);
    
    // Dramatic brightness for elliptical - extremely bright core
    const distance = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
    const maxDistance = semiMajor;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    let brightness;
    if (normalizedDistance < 0.2) {
      brightness = 4.0; // Extremely bright core
    } else if (normalizedDistance < 0.5) {
      brightness = 2.0; // Medium brightness
    } else {
      brightness = 0.2; // Very dim edges
    }
    currentColor.multiplyScalar(brightness);

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

export function generateIrregularGalaxy(params: DynamicIrregularParams = IRREGULAR, seed?: number): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);

  // Create seeded random for irregular galaxy uniqueness
  const galaxySeed = seed || Math.random() * 100000;
  let seedState = galaxySeed;
  const seededRandom = () => {
    seedState = (seedState * 9301 + 49297) % 233280;
    return seedState / 233280;
  };

  // Generate dramatically varied irregular parameters
  const clusterCount = Math.floor(seededRandom() * 12) + 4; // 4-15 clusters
  const clusterScatter = seededRandom() * 0.8 + 0.6; // 0.6 to 1.4
  const asymmetryBoost = seededRandom() * 1.0 + 0.5; // 0.5 to 1.5
  const bridgeDensity = seededRandom() * 0.5 + 0.2; // 0.2 to 0.7 bridge probability
  const chaosLevel = seededRandom() * 0.8 + 0.2; // 0.2 to 1.0 chaos
  
  // 3D chaos variations using seeded random
  const verticalChaos = seededRandom() * 1.2 + 1; // 1.0-2.2x vertical spread
  const globalTiltX = (seededRandom() - 0.5) * 0.8; // -0.4 to 0.4 radians
  const globalTiltY = (seededRandom() - 0.5) * 0.6; // -0.3 to 0.3 radians  
  const clusterVerticalOffset = (seededRandom() - 0.5) * 2; // Cluster height offset

  // Scale with dynamic sizing based on chaos level
  const maxRadius = 3 + seededRandom() * 2; // 3-5 units radius variation
  const clusterSpread = maxRadius * (0.6 + clusterScatter * 0.4);
  const clusterRadius = maxRadius * (0.2 + seededRandom() * 0.3);

  // Generate dynamically positioned cluster centers
  const clusterCenters: THREE.Vector3[] = [];
  for (let i = 0; i < clusterCount; i++) {
    // Use seeded random for consistent but unique cluster positioning
    const clusterSeed = galaxySeed + i * 17.3;
    
    // Constrained asymmetric positioning using seeded random
    const clusterX = Math.sin(clusterSeed) * clusterSpread * params.ASYMMETRY_FACTOR * asymmetryBoost * (0.4 + seededRandom() * 0.4);
    const clusterY = Math.cos(clusterSeed * 1.7) * clusterSpread * verticalChaos * 0.6 + clusterVerticalOffset * (0.5 + seededRandom() * 0.3);
    const clusterZ = Math.sin(clusterSeed * 2.1) * clusterSpread * clusterScatter * (0.3 + seededRandom() * 0.6);
    
    // Individual cluster chaos using seeded random
    const chaosX = (seededRandom() - 0.5) * clusterSpread * chaosLevel * 0.3;
    const chaosY = (seededRandom() - 0.5) * clusterSpread * chaosLevel * 0.2;
    const chaosZ = (seededRandom() - 0.5) * clusterSpread * chaosLevel * 0.3;
    
    clusterCenters.push(new THREE.Vector3(
      clusterX + chaosX, 
      clusterY + chaosY, 
      clusterZ + chaosZ
    ));
  }

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Choose distribution with dynamic probabilities based on bridge density
    const distributionRand = seededRandom();
    
    const clusterProbability = 0.6 - bridgeDensity * 0.2; // 40-60% clusters
    const bridgeProbability = bridgeDensity; // 20-70% bridges
    
    if (distributionRand < clusterProbability) {
      // Cluster distribution
      const clusterIndex = Math.floor(seededRandom() * clusterCount);
      const cluster = clusterCenters[clusterIndex];

      // Generate points around cluster center with seeded random
      const angle = seededRandom() * Math.PI * 2;
      const radius = Math.pow(seededRandom(), 0.7) * clusterRadius * (0.5 + seededRandom() * 0.4);
      const height = (seededRandom() - 0.5) * clusterRadius * verticalChaos * (0.6 + seededRandom() * 0.3);

      const asymmetricX = Math.cos(angle) * radius * (0.9 + seededRandom() * 0.2);
      const asymmetricZ = Math.sin(angle) * radius * (0.9 + seededRandom() * 0.2);
      
      const particleChaosX = (seededRandom() - 0.5) * clusterRadius * chaosLevel * 0.15;
      const particleChaosY = (seededRandom() - 0.5) * clusterRadius * chaosLevel * 0.1;
      const particleChaosZ = (seededRandom() - 0.5) * clusterRadius * chaosLevel * 0.15;

      const x = cluster.x + asymmetricX + particleChaosX;
      const y = cluster.y + height + particleChaosY;
      const z = cluster.z + asymmetricZ + particleChaosZ;
      
      // Apply global 3D rotations for chaotic orientations
      const rotatedX = x * Math.cos(globalTiltY) - z * Math.sin(globalTiltY);
      const rotatedZ = x * Math.sin(globalTiltY) + z * Math.cos(globalTiltY);
      
      const finalY = y * Math.cos(globalTiltX) - rotatedZ * Math.sin(globalTiltX);
      const finalZ = y * Math.sin(globalTiltX) + rotatedZ * Math.cos(globalTiltX);

      positions[i3] = rotatedX;
      positions[i3 + 1] = finalY;
      positions[i3 + 2] = finalZ;

      // Use irregular galaxy color theme - bright cluster colors
      const currentColor = getWeightedColor(IRREGULAR_THEME);
      // Dramatic brightness for cluster regions - very bright star formation
      const distanceFromCluster = Math.sqrt((x - cluster.x) * (x - cluster.x) + (y - cluster.y) * (y - cluster.y) + (z - cluster.z) * (z - cluster.z));
      const normalizedClusterDistance = Math.min(distanceFromCluster / clusterRadius, 1);
      let brightness;
      if (normalizedClusterDistance < 0.3) {
        brightness = 2.5; // Very bright cluster centers
      } else if (normalizedClusterDistance < 0.7) {
        brightness = 1.2; // Medium brightness
      } else {
        brightness = 0.4; // Dim cluster edges
      }
      currentColor.multiplyScalar(brightness);
      
      colors[i3] = currentColor.r;
      colors[i3 + 1] = currentColor.g;
      colors[i3 + 2] = currentColor.b;
      
    } else if (distributionRand < clusterProbability + bridgeProbability) {
      // Connecting bridges/streams between clusters
      const clusterA = clusterCenters[Math.floor(seededRandom() * clusterCount)];
      const clusterB = clusterCenters[Math.floor(seededRandom() * clusterCount)];
      
      // Ensure different clusters
      if (clusterA === clusterB) {
        const nextIndex = (clusterCenters.indexOf(clusterA) + 1) % clusterCount;
        const clusterBNew = clusterCenters[nextIndex];
        
        // Create stellar bridge between clusters
        const bridgeProgress = seededRandom(); // 0 to 1 along the bridge
        const bridgeVariation = (seededRandom() - 0.5) * clusterRadius * bridgeDensity; // Variable thickness
        
        // Linear interpolation between clusters with some curve
        const curvature = Math.sin(bridgeProgress * Math.PI) * clusterRadius * 0.3;
        
        let x = clusterA.x + (clusterBNew.x - clusterA.x) * bridgeProgress;
        let y = clusterA.y + (clusterBNew.y - clusterA.y) * bridgeProgress + curvature;
        let z = clusterA.z + (clusterBNew.z - clusterA.z) * bridgeProgress;
        
        // Add perpendicular variation to create width
        const perpX = -(clusterBNew.z - clusterA.z) / Math.max(clusterSpread, 0.1);
        const perpZ = (clusterBNew.x - clusterA.x) / Math.max(clusterSpread, 0.1);
        const perpY = (Math.random() - 0.5) * clusterRadius * 0.2;
        
        x += perpX * bridgeVariation;
        y += perpY;
        z += perpZ * bridgeVariation;
        
        // Apply global rotations
        const rotatedX = x * Math.cos(globalTiltY) - z * Math.sin(globalTiltY);
        const rotatedZ = x * Math.sin(globalTiltY) + z * Math.cos(globalTiltY);
        
        const finalY = y * Math.cos(globalTiltX) - rotatedZ * Math.sin(globalTiltX);
        const finalZ = y * Math.sin(globalTiltX) + rotatedZ * Math.cos(globalTiltX);

        positions[i3] = rotatedX;
        positions[i3 + 1] = finalY;
        positions[i3 + 2] = finalZ;

        // Bridge colors - brighter near clusters, dimmer in middle
        const currentColor = getWeightedColor(IRREGULAR_THEME);
        // Brightness varies along bridge - brighter at ends (near clusters)
        const bridgeDistanceFromEnds = Math.abs(bridgeProgress - 0.5) * 2; // 0 at middle, 1 at ends
        const brightness = (0.3 + bridgeDistanceFromEnds * 0.4) * (0.8 + seededRandom() * 0.3);
        currentColor.multiplyScalar(brightness);
        
        colors[i3] = currentColor.r;
        colors[i3 + 1] = currentColor.g;
        colors[i3 + 2] = currentColor.b;
      } else {
        // Create stellar bridge between different clusters
        const bridgeProgress = Math.random();
        const bridgeVariation = (Math.random() - 0.5) * clusterRadius * 0.4;
        
        const curvature = Math.sin(bridgeProgress * Math.PI) * clusterRadius * 0.3;
        
        let x = clusterA.x + (clusterB.x - clusterA.x) * bridgeProgress;
        let y = clusterA.y + (clusterB.y - clusterA.y) * bridgeProgress + curvature;
        let z = clusterA.z + (clusterB.z - clusterA.z) * bridgeProgress;
        
        const perpX = -(clusterB.z - clusterA.z) / Math.max(clusterSpread, 0.1);
        const perpZ = (clusterB.x - clusterA.x) / Math.max(clusterSpread, 0.1);
        const perpY = (Math.random() - 0.5) * clusterRadius * 0.2;
        
        x += perpX * bridgeVariation;
        y += perpY;
        z += perpZ * bridgeVariation;
        
        const rotatedX = x * Math.cos(globalTiltY) - z * Math.sin(globalTiltY);
        const rotatedZ = x * Math.sin(globalTiltY) + z * Math.cos(globalTiltY);
        
        const finalY = y * Math.cos(globalTiltX) - rotatedZ * Math.sin(globalTiltX);
        const finalZ = y * Math.sin(globalTiltX) + rotatedZ * Math.cos(globalTiltX);

        positions[i3] = rotatedX;
        positions[i3 + 1] = finalY;
        positions[i3 + 2] = finalZ;

        const currentColor = getWeightedColor(IRREGULAR_THEME);
        // Brightness varies along bridge - brighter at ends (near clusters)
        const bridgeDistanceFromEnds = Math.abs(bridgeProgress - 0.5) * 2; // 0 at middle, 1 at ends
        const brightness = (0.3 + bridgeDistanceFromEnds * 0.4) * (0.8 + seededRandom() * 0.3);
        currentColor.multiplyScalar(brightness);
        
        colors[i3] = currentColor.r;
        colors[i3 + 1] = currentColor.g;
        colors[i3 + 2] = currentColor.b;
      }
      
    } else {
      // Sparse distribution (remaining percentage)
      const range = clusterSpread * (0.5 + chaosLevel * 0.4);
      let x = (seededRandom() - 0.5) * range * params.ASYMMETRY_FACTOR * (0.4 + seededRandom() * 0.4);
      let y = (seededRandom() - 0.5) * range * verticalChaos * 0.5 * (0.5 + seededRandom() * 0.4);
      let z = (seededRandom() - 0.5) * range * (0.3 + seededRandom() * 0.5);
      
      const extremeChaosX = (seededRandom() - 0.5) * range * chaosLevel * 0.2;
      const extremeChaosY = (seededRandom() - 0.5) * range * chaosLevel * 0.15; 
      const extremeChaosZ = (seededRandom() - 0.5) * range * chaosLevel * 0.2;
      
      x += extremeChaosX;
      y += extremeChaosY;
      z += extremeChaosZ;
      
      const rotatedX = x * Math.cos(globalTiltY) - z * Math.sin(globalTiltY);
      const rotatedZ = x * Math.sin(globalTiltY) + z * Math.cos(globalTiltY);
      
      const finalY = y * Math.cos(globalTiltX) - rotatedZ * Math.sin(globalTiltX);
      const finalZ = y * Math.sin(globalTiltX) + rotatedZ * Math.cos(globalTiltX);
      
      positions[i3] = rotatedX;
      positions[i3 + 1] = finalY;
      positions[i3 + 2] = finalZ;

      // Sparse regions - dim with distance-based falloff
      const currentColor = getWeightedColor(IRREGULAR_THEME);
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = Math.min(distanceFromCenter / (clusterSpread * 0.7), 1);
      const brightness = Math.exp(-normalizedDistance * 0.4) * (0.4 - normalizedDistance * 0.2);
      currentColor.multiplyScalar(brightness * (0.6 + seededRandom() * 0.3));
      
      colors[i3] = currentColor.r;
      colors[i3 + 1] = currentColor.g;
      colors[i3 + 2] = currentColor.b;
    }

    // Add final randomness with seeded values and chaos level
    const finalRandomness = params.RANDOMNESS * chaosLevel;
    positions[i3] += (seededRandom() - 0.5) * finalRandomness * 0.8;
    positions[i3 + 1] += (seededRandom() - 0.5) * finalRandomness * 0.8;
    positions[i3 + 2] += (seededRandom() - 0.5) * finalRandomness * 0.8;
  }

  return { positions, colors };
}

export function generateGalaxyShape(
  type: GalaxyType,
  dynamicParams?: {
    spiral?: DynamicSpiralParams;
    elliptical?: DynamicEllipticalParams;
    irregular?: DynamicIrregularParams;
  },
  seed?: number
): GalaxyPositions {
  console.log(`Generating ${type} galaxy with seed:`, seed);
  let result: GalaxyPositions;

  switch (type) {
    case "spiral":
      result = generateSpiralGalaxy(dynamicParams?.spiral, seed);
      break;
    case "elliptical":
      result = generateEllipticalGalaxy(dynamicParams?.elliptical, seed);
      break;
    case "irregular":
      result = generateIrregularGalaxy(dynamicParams?.irregular, seed);
      break;
    default:
      result = generateSpiralGalaxy(dynamicParams?.spiral, seed);
  }

  // Log some sample positions to verify they're different
  console.log(
    `${type} sample positions:`,
    result.positions.slice(0, 9), // First 3 particles
    "colors:",
    result.colors.slice(0, 9),
  );

  return result;
}

export function interpolatePositions(
  fromPositions: Float32Array,
  toPositions: Float32Array,
  progress: number,
): Float32Array {
  const result = new Float32Array(fromPositions.length);

  for (let i = 0; i < fromPositions.length; i++) {
    result[i] =
      fromPositions[i] + (toPositions[i] - fromPositions[i]) * progress;
  }

  return result;
}

export function interpolateColors(
  fromColors: Float32Array,
  toColors: Float32Array,
  progress: number,
): Float32Array {
  const result = new Float32Array(fromColors.length);

  for (let i = 0; i < fromColors.length; i++) {
    result[i] = fromColors[i] + (toColors[i] - fromColors[i]) * progress;
  }

  return result;
}
