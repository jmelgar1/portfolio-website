import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  RANDOM_MULTIPLIER,
  RANDOM_INCREMENT,
  RANDOM_MODULUS,
  BASE_CLOUD_RADIUS,
  CLOUD_TYPE_PARAMS,
  BULGE_PATTERN_STRENGTH,
  BULGE_RANDOM_STRENGTH,
  BULGE_NEGATIVE_THRESHOLD,
  BULGE_NEGATIVE_FACTOR,
  BULGE_PHI_MULTIPLIER,
  DISPLACEMENT_WEIGHT_2,
  DISPLACEMENT_WEIGHT_3,
  WARP_STRENGTH,
  WARP_PHI_MULTIPLIER,
  WARP_THETA_MULTIPLIER,
  COLOR_SEED_OFFSET,
  BASE_HUE,
  HUE_VARIATION_RANGE,
  SATURATION_BASE,
  SATURATION_RANGE,
  LIGHTNESS_BASE,
  LIGHTNESS_RANGE,
  ANIMATION_SPEED_MULTIPLIER,
  RESET_POSITION_RIGHT,
  RESET_POSITION_LEFT,
  FLOATING_MOTION_FREQUENCY,
  FLOATING_MOTION_POSITION_FACTOR,
  FLOATING_MOTION_AMPLITUDE,
  CLOUD_OPACITY,
  CLOUD_ROUGHNESS,
  CLOUD_METALNESS,
  CLOUD_ALPHA_TEST,
  TOTAL_CLOUDS,
  MASTER_SEED,
  CLOUD_X_RANGE,
  CLOUD_X_OFFSET,
  CLOUD_X_RANDOMNESS,
  CLOUD_Y_MIN,
  CLOUD_Y_RANGE,
  CLOUD_Z_MIN,
  CLOUD_Z_RANGE,
  CLOUD_SCALE_MIN,
  CLOUD_SCALE_RANGE,
  CLOUD_SPEED_MIN,
  CLOUD_SPEED_RANGE,
  CLOUD_SEED_BASE,
  CLOUD_SEED_RANGE,
  GROUP_Y_OFFSET,
  GROUP_Z_OFFSET,
  SCALE_PRECISION_MULTIPLIER,
  SPEED_PRECISION_MULTIPLIER,
} from './cloudConstants';

// Individual Cloud Component
interface CloudProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  seed?: number;
  cloudType?: 'puffy' | 'wispy' | 'dense' | 'elongated';
}

const Cloud: React.FC<CloudProps> = ({ position, scale = 1, speed = 0.5, seed = 0, cloudType = 'puffy' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Seeded random function
  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * RANDOM_MULTIPLIER + RANDOM_INCREMENT) % RANDOM_MODULUS;
      return value / RANDOM_MODULUS;
    };
  };
  
  // Create cloud geometry using deformed sphere approach with type-specific variations
  const cloudGeometry = useMemo(() => {
    const random = seededRandom(seed);
    
    // Get cloud type parameters for blob-like shapes
    const getCloudTypeParams = (type: string) => {
      switch (type) {
        case 'puffy':
          return {
            segments: Math.floor(random() * CLOUD_TYPE_PARAMS.PUFFY.SEGMENTS_RANGE) + CLOUD_TYPE_PARAMS.PUFFY.SEGMENTS_MIN,
            noiseScale1: CLOUD_TYPE_PARAMS.PUFFY.NOISE_SCALE_1_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.NOISE_SCALE_1_RANGE,
            noiseScale2: CLOUD_TYPE_PARAMS.PUFFY.NOISE_SCALE_2_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.NOISE_SCALE_2_RANGE,
            noiseScale3: CLOUD_TYPE_PARAMS.PUFFY.NOISE_SCALE_3_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.NOISE_SCALE_3_RANGE,
            flattenAmount: CLOUD_TYPE_PARAMS.PUFFY.FLATTEN_AMOUNT_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.FLATTEN_AMOUNT_RANGE, // Reduced flattening: 0.85-0.95
            asymmetryX: CLOUD_TYPE_PARAMS.PUFFY.ASYMMETRY_X_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.ASYMMETRY_X_RANGE, // 0.8-1.2 asymmetric blob
            asymmetryY: CLOUD_TYPE_PARAMS.PUFFY.ASYMMETRY_Y_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.ASYMMETRY_Y_RANGE, // 0.9-1.1 slight variation
            asymmetryZ: CLOUD_TYPE_PARAMS.PUFFY.ASYMMETRY_Z_BASE + random() * CLOUD_TYPE_PARAMS.PUFFY.ASYMMETRY_Z_RANGE, // 0.8-1.2 asymmetric blob
            bulgeFreq: Math.floor(random() * CLOUD_TYPE_PARAMS.PUFFY.BULGE_FREQ_RANGE) + CLOUD_TYPE_PARAMS.PUFFY.BULGE_FREQ_MIN, // 2-4 bulges around cloud
          };
        case 'wispy':
          return {
            segments: Math.floor(random() * CLOUD_TYPE_PARAMS.WISPY.SEGMENTS_RANGE) + CLOUD_TYPE_PARAMS.WISPY.SEGMENTS_MIN,
            noiseScale1: CLOUD_TYPE_PARAMS.WISPY.NOISE_SCALE_1_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.NOISE_SCALE_1_RANGE,
            noiseScale2: CLOUD_TYPE_PARAMS.WISPY.NOISE_SCALE_2_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.NOISE_SCALE_2_RANGE,
            noiseScale3: CLOUD_TYPE_PARAMS.WISPY.NOISE_SCALE_3_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.NOISE_SCALE_3_RANGE,
            flattenAmount: CLOUD_TYPE_PARAMS.WISPY.FLATTEN_AMOUNT_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.FLATTEN_AMOUNT_RANGE, // Less extreme: 0.7-0.9
            asymmetryX: CLOUD_TYPE_PARAMS.WISPY.ASYMMETRY_X_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.ASYMMETRY_X_RANGE, // 1.5-2.3 stretched blob
            asymmetryY: CLOUD_TYPE_PARAMS.WISPY.ASYMMETRY_Y_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.ASYMMETRY_Y_RANGE, // 0.4-0.7 thinner
            asymmetryZ: CLOUD_TYPE_PARAMS.WISPY.ASYMMETRY_Z_BASE + random() * CLOUD_TYPE_PARAMS.WISPY.ASYMMETRY_Z_RANGE, // 0.7-1.1 varied depth
            bulgeFreq: Math.floor(random() * CLOUD_TYPE_PARAMS.WISPY.BULGE_FREQ_RANGE) + CLOUD_TYPE_PARAMS.WISPY.BULGE_FREQ_MIN, // 1-2 main wisps
          };
        case 'dense':
          return {
            segments: Math.floor(random() * CLOUD_TYPE_PARAMS.DENSE.SEGMENTS_RANGE) + CLOUD_TYPE_PARAMS.DENSE.SEGMENTS_MIN,
            noiseScale1: CLOUD_TYPE_PARAMS.DENSE.NOISE_SCALE_1_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.NOISE_SCALE_1_RANGE,
            noiseScale2: CLOUD_TYPE_PARAMS.DENSE.NOISE_SCALE_2_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.NOISE_SCALE_2_RANGE,
            noiseScale3: CLOUD_TYPE_PARAMS.DENSE.NOISE_SCALE_3_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.NOISE_SCALE_3_RANGE,
            flattenAmount: CLOUD_TYPE_PARAMS.DENSE.FLATTEN_AMOUNT_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.FLATTEN_AMOUNT_RANGE, // Minimal: 0.9-0.98
            asymmetryX: CLOUD_TYPE_PARAMS.DENSE.ASYMMETRY_X_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.ASYMMETRY_X_RANGE, // 0.85-1.15 compact blob
            asymmetryY: CLOUD_TYPE_PARAMS.DENSE.ASYMMETRY_Y_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.ASYMMETRY_Y_RANGE, // 1.0-1.3 slightly taller
            asymmetryZ: CLOUD_TYPE_PARAMS.DENSE.ASYMMETRY_Z_BASE + random() * CLOUD_TYPE_PARAMS.DENSE.ASYMMETRY_Z_RANGE, // 0.85-1.15 compact blob
            bulgeFreq: Math.floor(random() * CLOUD_TYPE_PARAMS.DENSE.BULGE_FREQ_RANGE) + CLOUD_TYPE_PARAMS.DENSE.BULGE_FREQ_MIN, // 3-6 dense bumps
          };
        case 'elongated':
          return {
            segments: Math.floor(random() * CLOUD_TYPE_PARAMS.ELONGATED.SEGMENTS_RANGE) + CLOUD_TYPE_PARAMS.ELONGATED.SEGMENTS_MIN,
            noiseScale1: CLOUD_TYPE_PARAMS.ELONGATED.NOISE_SCALE_1_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.NOISE_SCALE_1_RANGE,
            noiseScale2: CLOUD_TYPE_PARAMS.ELONGATED.NOISE_SCALE_2_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.NOISE_SCALE_2_RANGE,
            noiseScale3: CLOUD_TYPE_PARAMS.ELONGATED.NOISE_SCALE_3_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.NOISE_SCALE_3_RANGE,
            flattenAmount: CLOUD_TYPE_PARAMS.ELONGATED.FLATTEN_AMOUNT_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.FLATTEN_AMOUNT_RANGE, // Moderate: 0.8-0.95
            asymmetryX: CLOUD_TYPE_PARAMS.ELONGATED.ASYMMETRY_X_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.ASYMMETRY_X_RANGE, // 2.0-3.0 very stretched
            asymmetryY: CLOUD_TYPE_PARAMS.ELONGATED.ASYMMETRY_Y_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.ASYMMETRY_Y_RANGE, // 0.6-0.9 lower profile
            asymmetryZ: CLOUD_TYPE_PARAMS.ELONGATED.ASYMMETRY_Z_BASE + random() * CLOUD_TYPE_PARAMS.ELONGATED.ASYMMETRY_Z_RANGE, // 0.8-1.1 varied depth
            bulgeFreq: Math.floor(random() * CLOUD_TYPE_PARAMS.ELONGATED.BULGE_FREQ_RANGE) + CLOUD_TYPE_PARAMS.ELONGATED.BULGE_FREQ_MIN, // 2-4 elongated segments
          };
        default:
          return getCloudTypeParams('puffy');
      }
    };
    
    const params = getCloudTypeParams(cloudType);
    const geometry = new THREE.SphereGeometry(BASE_CLOUD_RADIUS * scale, params.segments, params.segments);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Apply deformation to create varied blob-like cloud shapes
    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const distance = vertex.length();
      
      // Calculate spherical coordinates for organic bulge patterns
      const theta = Math.atan2(vertex.z, vertex.x); // Horizontal angle
      const phi = Math.acos(vertex.y / distance); // Vertical angle
      
      // Create bulge patterns based on cloud type
      const bulgePattern = Math.sin(theta * params.bulgeFreq) * Math.sin(phi * params.bulgeFreq * BULGE_PHI_MULTIPLIER);
      const bulgeFactor = 1.0 + (bulgePattern * BULGE_PATTERN_STRENGTH + random() * BULGE_RANDOM_STRENGTH) * (random() > BULGE_NEGATIVE_THRESHOLD ? 1 : BULGE_NEGATIVE_FACTOR);
      
      // Multiple layers of displacement for organic shape
      const displacement1 = (random() - 0.5) * params.noiseScale1 * scale * bulgeFactor;
      const displacement2 = (random() - 0.5) * params.noiseScale2 * scale;
      const displacement3 = (random() - 0.5) * params.noiseScale3 * scale;
      
      // Combine displacements with different weights
      const totalDisplacement = displacement1 + displacement2 * DISPLACEMENT_WEIGHT_2 + displacement3 * DISPLACEMENT_WEIGHT_3;
      
      // Apply displacement along the normal direction
      vertex.normalize().multiplyScalar(distance + totalDisplacement);
      
      // Apply gentle bottom flattening (much less aggressive)
      if (vertex.y < 0) {
        vertex.y *= params.flattenAmount;
      }
      
      // Apply asymmetric blob-like scaling for varied shapes
      vertex.x *= params.asymmetryX;
      vertex.z *= params.asymmetryZ;
      vertex.y *= params.asymmetryY;
      
      // Add subtle asymmetric warping for more organic blob shapes
      const warpX = Math.sin(phi * WARP_PHI_MULTIPLIER) * WARP_STRENGTH * scale * (random() - 0.5);
      const warpZ = Math.cos(theta * WARP_THETA_MULTIPLIER) * WARP_STRENGTH * scale * (random() - 0.5);
      vertex.x += warpX;
      vertex.z += warpZ;
      
      positions[i] = vertex.x;
      positions[i + 1] = vertex.y;
      positions[i + 2] = vertex.z;
    }
    
    // Recompute normals for proper lighting
    geometry.computeVertexNormals();
    
    return geometry;
  }, [scale, seed, cloudType]);
  
  // Generate random cloud color variation using seed
  const cloudColor = useMemo(() => {
    const random = seededRandom(seed + COLOR_SEED_OFFSET); // Different seed for color
    const baseHue = BASE_HUE; // Blue base
    const hueVariation = (random() - 0.5) * HUE_VARIATION_RANGE; // ±10 hue variation
    const saturation = SATURATION_BASE + random() * SATURATION_RANGE; // 5-15% saturation
    const lightness = LIGHTNESS_BASE + random() * LIGHTNESS_RANGE; // 97-100% lightness
    
    return `hsl(${baseHue + hueVariation}, ${saturation}%, ${lightness}%)`;
  }, [seed]);
  
  
  // Animation loop for left-to-right movement
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += speed * delta * ANIMATION_SPEED_MULTIPLIER;
      
      // Reset position when cloud moves too far right (accounting for cloud width)
      if (meshRef.current.position.x > RESET_POSITION_RIGHT) {
        meshRef.current.position.x = RESET_POSITION_LEFT;
      }
      
      // Add subtle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * FLOATING_MOTION_FREQUENCY + position[0] * FLOATING_MOTION_POSITION_FACTOR) * FLOATING_MOTION_AMPLITUDE;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} geometry={cloudGeometry}>
      <meshStandardMaterial
        color={cloudColor}
        transparent
        opacity={CLOUD_OPACITY}
        side={THREE.FrontSide}
        roughness={CLOUD_ROUGHNESS}
        metalness={CLOUD_METALNESS}
        depthWrite={false}
        depthTest={true}
        alphaTest={CLOUD_ALPHA_TEST}
      />
    </mesh>
  );
};

const Clouds: React.FC = () => {
  // Generate clouds using algorithm instead of hardcoded values
  const cloudInstances = useMemo(() => {
    const clouds = [];
    const numClouds = TOTAL_CLOUDS; // Same number as before
    const seededRandom = (seed: number) => {
      let value = seed;
      return () => {
        value = (value * RANDOM_MULTIPLIER + RANDOM_INCREMENT) % RANDOM_MODULUS;
        return value / RANDOM_MODULUS;
      };
    };
    
    const masterRandom = seededRandom(MASTER_SEED); // Master seed for consistent generation
    
    for (let i = 0; i < numClouds; i++) {
      // Generate deterministic but varied positions
      const xRange = CLOUD_X_RANGE; // Total range from -240 to 240
      const x = CLOUD_X_OFFSET + (i / (numClouds - 1)) * xRange + (masterRandom() - 0.5) * CLOUD_X_RANDOMNESS; // Distributed with some randomness
      const y = CLOUD_Y_MIN + masterRandom() * CLOUD_Y_RANGE; // Range from -25 to 40
      const z = CLOUD_Z_MIN + masterRandom() * CLOUD_Z_RANGE; // Range from -25 to 25
      
      // Generate varied scales (4.16 to 9.0 range - increased minimum by 30%)
      const scale = CLOUD_SCALE_MIN + masterRandom() * CLOUD_SCALE_RANGE;
      
      // Generate varied speeds (0.2 to 0.8 range from original)
      const speed = CLOUD_SPEED_MIN + masterRandom() * CLOUD_SPEED_RANGE;
      
      // Generate unique seed for each cloud
      const seed = Math.floor(masterRandom() * CLOUD_SEED_RANGE) + CLOUD_SEED_BASE;
      
      clouds.push({
        position: [x, y, z] as [number, number, number],
        scale: Math.round(scale * SCALE_PRECISION_MULTIPLIER) / SCALE_PRECISION_MULTIPLIER, // Round to 1 decimal
        speed: Math.round(speed * SPEED_PRECISION_MULTIPLIER) / SPEED_PRECISION_MULTIPLIER, // Round to 2 decimals
        seed,
        cloudType: 'elongated' as const
      });
    }
    
    return clouds;
  }, []);
  
  return (
    <group position={[0, GROUP_Y_OFFSET, GROUP_Z_OFFSET]}>
      {cloudInstances.map((cloud, index) => (
        <Cloud
          key={index}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
          seed={cloud.seed}
          cloudType={cloud.cloudType}
        />
      ))}
    </group>
  );
};

export default Clouds;