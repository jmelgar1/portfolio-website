import * as THREE from "three";
import {
  GalaxyType,
  SPIRAL,
  ELLIPTICAL,
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

  // Add 3D procedural variation to prevent oversizing and add dimensionality
  const galaxySeed = seed || Math.random() * 1000;
  const armVariation = Math.sin(galaxySeed) * 0.15 + 1; // 0.85 to 1.15
  const spiralTightness = Math.cos(galaxySeed * 1.7) * 0.2 + 1.2; // 1.0 to 1.4
  const coreSize = Math.sin(galaxySeed * 2.3) * 0.1 + 1; // 0.9 to 1.1
  const armOffset = Math.cos(galaxySeed * 3.1) * 0.5; // Rotation offset
  
  // NEW: 3D orientation and thickness variations - CONSTRAINED
  const thicknessVariation = Math.sin(galaxySeed * 4.3) * 0.8 + 1.2; // 1.2-2.0x thickness (much smaller)
  const tiltX = Math.cos(galaxySeed * 5.7) * 0.3; // -0.3 to 0.3 radians tilt
  const tiltZ = Math.sin(galaxySeed * 6.1) * 0.2; // -0.2 to 0.2 radians tilt
  const warpFactor = Math.cos(galaxySeed * 7.3) * 0.1; // Subtle warp

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Apply procedural variations to create unique spiral patterns
    const branchAngle = ((i % params.ARMS) / params.ARMS) * (Math.PI * 2) + armOffset;
    const radius =
      Math.pow(Math.random(), params.ARMS_CONSTANT * coreSize) * (params.ARM_X_MEAN / 25);
    const spin = radius * params.SPIRAL_FACTOR * spiralTightness;
    
    // Add arm-specific variation for more organic spiral shapes
    const armIndex = i % params.ARMS;
    const armVariationFactor = Math.sin(armIndex * 2.5 + galaxySeed) * armVariation;

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
      Math.pow(Math.random(), params.ARMS_CONSTANT) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      params.RANDOMNESS;
    const randomY =
      Math.pow(Math.random(), params.ARMS_CONSTANT) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      params.RANDOMNESS * thicknessVariation; // Apply thickness variation
    const randomZ =
      Math.pow(Math.random(), params.ARMS_CONSTANT) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      params.RANDOMNESS;

    // Base positions
    const x = Math.cos(branchAngle + spin) * radius * armVariationFactor + randomX;
    const y = randomY + radius * warpFactor * Math.sin(branchAngle); // Add galactic warp
    const z = Math.sin(branchAngle + spin) * radius * armVariationFactor + randomZ;
    
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

  // Add 3D procedural variation for elliptical shapes
  const galaxySeed = seed || Math.random() * 1000;
  const eccentricityVar = Math.sin(galaxySeed * 1.5) * 0.1 + 1; // 0.9 to 1.1
  const coreFlattening = Math.cos(galaxySeed * 2.1) * 0.15 + 1; // 0.85 to 1.15
  const tilt = Math.sin(galaxySeed * 3.7) * 0.2; // -0.2 to 0.2 radians
  
  // NEW: 3D orientation variations for ellipticals - CONSTRAINED
  const verticalStretch = Math.cos(galaxySeed * 4.9) * 0.4 + 1.2; // 1.2-1.6x vertical stretch
  const rollRotation = Math.sin(galaxySeed * 6.2) * 0.5; // -0.5 to 0.5 radians roll
  const pitchRotation = Math.cos(galaxySeed * 7.8) * 0.4; // -0.4 to 0.4 radians pitch
  
  // NEW: Asymmetric imperfections for realistic ellipticals
  const asymmetryX = Math.sin(galaxySeed * 9.1) * 0.15 + 1; // 0.85-1.15x X-axis variation
  const asymmetryZ = Math.cos(galaxySeed * 10.3) * 0.15 + 1; // 0.85-1.15x Z-axis variation
  const dustLaneStrength = Math.sin(galaxySeed * 11.7) * 0.3; // 0-0.3 dust lane intensity
  const densityLumpiness = Math.cos(galaxySeed * 12.9) * 0.2; // Density variations

  // Scale to match spiral galaxy size (8 units radius)
  const maxRadius = 8;
  const semiMajor = maxRadius;
  const semiMinor = maxRadius * 0.6; // Make it elliptical

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Generate ellipsoidal distribution
    const phi = Math.random() * Math.PI * 2;
    const cosTheta = (Math.random() - 0.5) * 2;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

    // Use power distribution for core density
    const r = Math.pow(Math.random(), 1 / params.CORE_DENSITY);

    // Scale by ellipse parameters with asymmetric variations
    const baseX = r * semiMajor * sinTheta * Math.cos(phi) * eccentricityVar;
    const baseY = r * semiMinor * cosTheta * coreFlattening * verticalStretch;
    const baseZ = r * semiMajor * sinTheta * Math.sin(phi) * eccentricityVar;
    
    // Apply asymmetric scaling for imperfect ellipse
    let x = baseX * asymmetryX;
    let y = baseY;
    let z = baseZ * asymmetryZ;
    
    // Add subtle dust lane effects (density reduction in equatorial plane)
    const dustLaneEffect = Math.abs(baseY) < (semiMinor * 0.1) ? (1 - dustLaneStrength) : 1;
    
    // Add density lumpiness for realistic irregularities
    const lumpinessEffect = 1 + Math.sin(phi * 3 + galaxySeed) * Math.cos(cosTheta * 5 + galaxySeed) * densityLumpiness;
    
    // Skip some particles in dust lanes (creates realistic gaps)
    if (Math.random() > dustLaneEffect * lumpinessEffect) {
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
    
    // Original tilt (around Y axis)
    const tiltedX = rolledX * Math.cos(tilt) - pitchedZ * Math.sin(tilt);
    const finalZ = rolledX * Math.sin(tilt) + pitchedZ * Math.cos(tilt);

    // Add randomness
    const randomness = params.RANDOMNESS;
    const randomX = (Math.random() - 0.5) * randomness * semiMajor;
    const randomY = (Math.random() - 0.5) * randomness * semiMinor;
    const randomZ = (Math.random() - 0.5) * randomness * semiMajor;

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

  // Add 3D procedural variation for irregular shapes  
  const galaxySeed = seed || Math.random() * 1000;
  const clusterScatter = Math.sin(galaxySeed * 1.3) * 0.2 + 1; // 0.8 to 1.2
  const asymmetryBoost = Math.cos(galaxySeed * 2.7) * 0.2 + 1.2; // 1.0 to 1.4
  
  // NEW: 3D chaos variations for irregular galaxies - CONSTRAINED
  const verticalChaos = Math.sin(galaxySeed * 3.9) * 0.8 + 1.4; // 1.4-2.2x vertical spread (much smaller)
  const globalTiltX = Math.cos(galaxySeed * 5.1) * 0.4; // -0.4 to 0.4 radians
  const globalTiltY = Math.sin(galaxySeed * 6.8) * 0.3; // -0.3 to 0.3 radians  
  const clusterVerticalOffset = Math.cos(galaxySeed * 8.2) * 1; // Small cluster height offset

  // Scale irregular galaxies to be more contained (3 units radius)
  const maxRadius = 3; // Reduced from 4 to 3 for better containment
  const clusterSpread = maxRadius * 0.8; // Reduced from 1.2 to 0.8
  const clusterRadius = maxRadius * 0.3; // Reduced from 0.4 to 0.3

  // Generate highly asymmetric 3D cluster centers 
  const clusterCenters: THREE.Vector3[] = [];
  for (let i = 0; i < params.CLUSTER_COUNT; i++) {
    // Make each cluster highly asymmetric and chaotic
    const clusterSeed = galaxySeed + i * 17.3;
    
    // More constrained asymmetric positioning for better containment
    const clusterX = Math.sin(clusterSeed) * clusterSpread * params.ASYMMETRY_FACTOR * asymmetryBoost * (0.4 + Math.random() * 0.4);
    const clusterY = Math.cos(clusterSeed * 1.7) * clusterSpread * verticalChaos * 0.6 + clusterVerticalOffset * (0.5 + Math.random() * 0.3);
    const clusterZ = Math.sin(clusterSeed * 2.1) * clusterSpread * clusterScatter * (0.3 + Math.random() * 0.6);
    
    // Further reduced individual cluster chaos for containment
    const chaosX = (Math.random() - 0.5) * clusterSpread * 0.2;
    const chaosY = (Math.random() - 0.5) * clusterSpread * 0.15;
    const chaosZ = (Math.random() - 0.5) * clusterSpread * 0.2;
    
    clusterCenters.push(new THREE.Vector3(
      clusterX + chaosX, 
      clusterY + chaosY, 
      clusterZ + chaosZ
    ));
  }

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Choose distribution: clusters (50%), connecting bridges (30%), or sparse (20%)
    const distributionRand = Math.random();
    
    if (distributionRand < 0.5) {
      // Cluster distribution
      const clusterIndex = Math.floor(Math.random() * params.CLUSTER_COUNT);
      const cluster = clusterCenters[clusterIndex];

      // Generate more tightly contained points around cluster center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.7) * clusterRadius * (0.5 + Math.random() * 0.4);
      const height = (Math.random() - 0.5) * clusterRadius * verticalChaos * (0.6 + Math.random() * 0.3);

      const asymmetricX = Math.cos(angle) * radius * (0.9 + Math.random() * 0.2);
      const asymmetricZ = Math.sin(angle) * radius * (0.9 + Math.random() * 0.2);
      
      const particleChaosX = (Math.random() - 0.5) * clusterRadius * 0.1;
      const particleChaosY = (Math.random() - 0.5) * clusterRadius * 0.08;
      const particleChaosZ = (Math.random() - 0.5) * clusterRadius * 0.1;

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
      
    } else if (distributionRand < 0.8) {
      // Connecting bridges/streams between clusters
      const clusterA = clusterCenters[Math.floor(Math.random() * params.CLUSTER_COUNT)];
      const clusterB = clusterCenters[Math.floor(Math.random() * params.CLUSTER_COUNT)];
      
      // Ensure different clusters
      if (clusterA === clusterB) {
        const nextIndex = (clusterCenters.indexOf(clusterA) + 1) % params.CLUSTER_COUNT;
        const clusterBNew = clusterCenters[nextIndex];
        
        // Create stellar bridge between clusters
        const bridgeProgress = Math.random(); // 0 to 1 along the bridge
        const bridgeVariation = (Math.random() - 0.5) * clusterRadius * 0.4; // Perpendicular variation
        
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
        const brightness = (0.3 + bridgeDistanceFromEnds * 0.4) * (0.8 + Math.random() * 0.3);
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
        const brightness = (0.3 + bridgeDistanceFromEnds * 0.4) * (0.8 + Math.random() * 0.3);
        currentColor.multiplyScalar(brightness);
        
        colors[i3] = currentColor.r;
        colors[i3 + 1] = currentColor.g;
        colors[i3 + 2] = currentColor.b;
      }
      
    } else {
      // Sparse distribution (20%)
      const range = clusterSpread * 0.7;
      let x = (Math.random() - 0.5) * range * params.ASYMMETRY_FACTOR * (0.4 + Math.random() * 0.4);
      let y = (Math.random() - 0.5) * range * verticalChaos * 0.5 * (0.5 + Math.random() * 0.4);
      let z = (Math.random() - 0.5) * range * (0.3 + Math.random() * 0.5);
      
      const extremeChaosX = (Math.random() - 0.5) * range * 0.15;
      const extremeChaosY = (Math.random() - 0.5) * range * 0.1; 
      const extremeChaosZ = (Math.random() - 0.5) * range * 0.15;
      
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
      currentColor.multiplyScalar(brightness * (0.6 + Math.random() * 0.3));
      
      colors[i3] = currentColor.r;
      colors[i3 + 1] = currentColor.g;
      colors[i3 + 2] = currentColor.b;
    }

    // Add much smaller overall randomness for tight containment
    const randomness = params.RANDOMNESS;
    positions[i3] += (Math.random() - 0.5) * randomness * 0.8;
    positions[i3 + 1] += (Math.random() - 0.5) * randomness * 0.8;
    positions[i3 + 2] += (Math.random() - 0.5) * randomness * 0.8;
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
