import * as THREE from "three";
import {
  GalaxyType,
  SPIRAL,
  ELLIPTICAL,
  IRREGULAR,
  NUM_STARS,
} from "../config/galaxyConfig";

// Galaxy color constants
const GALAXY_CORE_COLOR = 0xff6030; // Warm orange for galaxy centers
const GALAXY_EDGE_COLOR = 0x391eb9; // Deep purple for galaxy edges

export interface GalaxyPositions {
  positions: Float32Array;
  colors: Float32Array;
}

export function generateSpiralGalaxy(): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);

  const colorInside = new THREE.Color(GALAXY_CORE_COLOR);
  const colorOutside = new THREE.Color(GALAXY_EDGE_COLOR);

  // Add some entropy to ensure different results
  const entropy = Math.random() * 1000;

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    const branchAngle = ((i % SPIRAL.ARMS) / SPIRAL.ARMS) * (Math.PI * 2);
    const radius =
      Math.pow(Math.random(), SPIRAL.ARMS_CONSTANT) * (SPIRAL.ARM_X_MEAN / 25);
    const spin = radius * SPIRAL.SPIRAL_FACTOR;

    const currentColor = colorInside.clone();
    currentColor.lerp(colorOutside, radius / (SPIRAL.ARM_X_MEAN / 25));

    const randomX =
      Math.pow(Math.random(), SPIRAL.ARMS_CONSTANT) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      SPIRAL.RANDOMNESS;
    const randomY =
      Math.pow(Math.random(), SPIRAL.ARMS_CONSTANT) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      SPIRAL.RANDOMNESS;
    const randomZ =
      Math.pow(Math.random(), SPIRAL.ARMS_CONSTANT) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      SPIRAL.RANDOMNESS;

    positions[i3] = Math.cos(branchAngle + spin) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomZ;

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

export function generateEllipticalGalaxy(): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);

  const colorCore = new THREE.Color(GALAXY_CORE_COLOR);
  const colorEdge = new THREE.Color(GALAXY_EDGE_COLOR);

  // Scale to match spiral galaxy size (8 units radius)
  const maxRadius = 8;
  const semiMajor = maxRadius;
  const semiMinor = maxRadius * 0.6; // Make it elliptical

  // Add some entropy to ensure different results
  const entropy = Math.random() * 2000;

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Generate ellipsoidal distribution
    const phi = Math.random() * Math.PI * 2;
    const cosTheta = (Math.random() - 0.5) * 2;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

    // Use power distribution for core density
    const r = Math.pow(Math.random(), 1 / ELLIPTICAL.CORE_DENSITY);

    // Scale by ellipse parameters
    const x = r * semiMajor * sinTheta * Math.cos(phi);
    const y = r * semiMinor * cosTheta;
    const z = r * semiMajor * sinTheta * Math.sin(phi);

    // Add randomness
    const randomness = ELLIPTICAL.RANDOMNESS;
    const randomX = (Math.random() - 0.5) * randomness * semiMajor;
    const randomY = (Math.random() - 0.5) * randomness * semiMinor;
    const randomZ = (Math.random() - 0.5) * randomness * semiMajor;

    positions[i3] = x + randomX;
    positions[i3 + 1] = y + randomY;
    positions[i3 + 2] = z + randomZ;

    // Color based on distance from center
    const distance = Math.sqrt(x * x + y * y + z * z);
    const maxDistance = semiMajor;
    const colorMix = Math.min(distance / maxDistance, 1);

    const currentColor = colorCore.clone();
    currentColor.lerp(colorEdge, colorMix);

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  return { positions, colors };
}

export function generateIrregularGalaxy(): GalaxyPositions {
  const positions = new Float32Array(NUM_STARS * 3);
  const colors = new Float32Array(NUM_STARS * 3);

  const colorCluster = new THREE.Color(GALAXY_CORE_COLOR);
  const colorSparse = new THREE.Color(GALAXY_EDGE_COLOR);

  // Scale to match spiral galaxy size (8 units radius)
  const maxRadius = 8;
  const clusterSpread = maxRadius * 1.2;
  const clusterRadius = maxRadius * 0.4;

  // Add some entropy to ensure different results
  const entropy = Math.random() * 3000;

  // Generate cluster centers
  const clusterCenters: THREE.Vector3[] = [];
  for (let i = 0; i < IRREGULAR.CLUSTER_COUNT; i++) {
    clusterCenters.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * clusterSpread * IRREGULAR.ASYMMETRY_FACTOR,
        (Math.random() - 0.5) * clusterSpread * 0.3,
        (Math.random() - 0.5) * clusterSpread,
      ),
    );
  }

  for (let i = 0; i < NUM_STARS; i++) {
    const i3 = i * 3;

    // Choose random cluster or sparse distribution
    if (Math.random() < 0.7) {
      // Cluster distribution
      const clusterIndex = Math.floor(Math.random() * IRREGULAR.CLUSTER_COUNT);
      const cluster = clusterCenters[clusterIndex];

      // Generate point around cluster center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * clusterRadius;
      const height = (Math.random() - 0.5) * clusterRadius * 0.3;

      positions[i3] = cluster.x + Math.cos(angle) * radius;
      positions[i3 + 1] = cluster.y + height;
      positions[i3 + 2] = cluster.z + Math.sin(angle) * radius;

      // Cluster color
      colors[i3] = colorCluster.r;
      colors[i3 + 1] = colorCluster.g;
      colors[i3 + 2] = colorCluster.b;
    } else {
      // Sparse distribution
      const range = clusterSpread * 1.2;
      positions[i3] =
        (Math.random() - 0.5) * range * IRREGULAR.ASYMMETRY_FACTOR;
      positions[i3 + 1] = (Math.random() - 0.5) * range * 0.3;
      positions[i3 + 2] = (Math.random() - 0.5) * range;

      // Sparse color
      colors[i3] = colorSparse.r;
      colors[i3 + 1] = colorSparse.g;
      colors[i3 + 2] = colorSparse.b;
    }

    // Add overall randomness - much smaller scale
    const randomness = IRREGULAR.RANDOMNESS;
    positions[i3] += (Math.random() - 0.5) * randomness * 2;
    positions[i3 + 1] += (Math.random() - 0.5) * randomness * 2;
    positions[i3 + 2] += (Math.random() - 0.5) * randomness * 2;
  }

  return { positions, colors };
}

export function generateGalaxyShape(type: GalaxyType): GalaxyPositions {
  console.log(`Generating ${type} galaxy`);
  let result: GalaxyPositions;

  switch (type) {
    case "spiral":
      result = generateSpiralGalaxy();
      break;
    case "elliptical":
      result = generateEllipticalGalaxy();
      break;
    case "irregular":
      result = generateIrregularGalaxy();
      break;
    default:
      result = generateSpiralGalaxy();
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
