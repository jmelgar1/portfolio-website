import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateStarInFrustum } from "./util";
import { useMousePosition } from "../../../context/MouseContext";

const Starfield: React.FC = () => {
  const TWINKLING_STAR_COUNT = 1000; // Increased by 25% (800 * 1.25)
  const STATIC_STAR_COUNT = 1875; // Increased by 25% (1500 * 1.25)
  const TWINKLE_GROUP_COUNT = 25; // Fewer groups for better performance
  const groupRef = useRef<THREE.Group>(null);
  const twinklingMaterialRefs = useRef<(THREE.PointsMaterial | null)[]>([]);
  const { mousePosition } = useMousePosition();

  // Memoize star data to prevent regeneration on re-renders
  const starData = useMemo(() => {
    const FIXED_DEPTH = 200; // All stars at the same depth level

    // Create static stars
    const staticPositions = new Float32Array(STATIC_STAR_COUNT * 3);
    for (let i = 0; i < STATIC_STAR_COUNT; i++) {
      const star = generateStarInFrustum(FIXED_DEPTH, 30); // Match sensitivity value
      staticPositions[i * 3] = star.x;
      staticPositions[i * 3 + 1] = star.y;
      staticPositions[i * 3 + 2] = star.z;
    }

    // Create twinkling groups
    const groups = [];
    const starsPerGroup = Math.floor(
      TWINKLING_STAR_COUNT / TWINKLE_GROUP_COUNT,
    );

    for (let g = 0; g < TWINKLE_GROUP_COUNT; g++) {
      const groupPositions = new Float32Array(starsPerGroup * 3);
      for (let i = 0; i < starsPerGroup; i++) {
        const star = generateStarInFrustum(FIXED_DEPTH, 30); // Match sensitivity value
        groupPositions[i * 3] = star.x;
        groupPositions[i * 3 + 1] = star.y;
        groupPositions[i * 3 + 2] = star.z;
      }

      groups.push({
        positions: groupPositions,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 2.5, // Faster, more noticeable twinkling
      });
    }

    return { staticPositions, groups };
  }, [STATIC_STAR_COUNT, TWINKLE_GROUP_COUNT]);

  // Handle mouse-based movement with parallax effect and twinkling animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const lerpFactor = 0.1;
      const sensitivity = 30.0; // Increased parallax sensitivity

      // Create parallax effect - move opposite to mouse for depth illusion
      const targetX = -mousePosition.x * sensitivity;
      const targetY = -mousePosition.y * sensitivity;

      // Apply smooth interpolation
      groupRef.current.position.x +=
        (targetX - groupRef.current.position.x) * lerpFactor;
      groupRef.current.position.y +=
        (targetY - groupRef.current.position.y) * lerpFactor;
    }

    // Update twinkling star opacity for each group
    starData.groups.forEach((group, index) => {
      const material = twinklingMaterialRefs.current[index];
      if (material) {
        const opacity = 0.6 + Math.sin(clock.elapsedTime * group.speed + group.phase) * 0.4;
        material.opacity = Math.max(0.2, opacity);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Static stars that don't twinkle */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={starData.staticPositions}
            count={STATIC_STAR_COUNT}
            itemSize={3}
            args={[starData.staticPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent={true}
          opacity={1.0}
          sizeAttenuation={false}
        />
      </points>

      {/* Twinkling star groups */}
      {starData.groups.map((group, index) => (
        <points key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={group.positions}
              count={group.positions.length / 3}
              itemSize={3}
              args={[group.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={(ref) => {
              twinklingMaterialRefs.current[index] = ref;
            }}
            size={0.15}
            color="#ffffff"
            transparent={true}
            opacity={1.0}
            sizeAttenuation={false}
          />
        </points>
      ))}
    </group>
  );
};

export default Starfield;
