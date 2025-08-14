import React, { useMemo, useRef, useContext } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateStarInFrustum } from "./util";
import { MouseContext } from "../../../context/MouseContext";

interface StarfieldProps {
  staticMode?: boolean;
  starCount?: number;
  enableTwinkling?: boolean;
  enableMouseInteraction?: boolean;
  fov?: number;
  cameraPosition?: { x: number; y: number; z: number };
  cameraOrientation?: 'z-axis' | 'y-axis';
  viewport?: { width: number; height: number };
  customAspectRatio?: number;
}

const Starfield: React.FC<StarfieldProps> = ({
  staticMode = false,
  starCount,
  enableTwinkling = true,
  enableMouseInteraction = true,
  fov = 40,
  cameraPosition = { x: 0, y: 0, z: 0 },
  cameraOrientation = 'z-axis',
  viewport,
  customAspectRatio,
}) => {
  // Calculate star counts based on props
  const TOTAL_DEFAULT_STARS = 2875; // 1875 static + 1000 twinkling
  const DEFAULT_TWINKLING_RATIO = 1000 / 2875; // ~0.348
  
  const totalStars = starCount || TOTAL_DEFAULT_STARS;
  const shouldTwinkle = enableTwinkling && !staticMode;
  
  const TWINKLING_STAR_COUNT = shouldTwinkle ? Math.floor(totalStars * DEFAULT_TWINKLING_RATIO) : 0;
  const STATIC_STAR_COUNT = totalStars - TWINKLING_STAR_COUNT;
  const TWINKLE_GROUP_COUNT = shouldTwinkle ? Math.min(25, Math.max(1, Math.floor(TWINKLING_STAR_COUNT / 40))) : 0;
  const groupRef = useRef<THREE.Group>(null);
  const twinklingMaterialRefs = useRef<(THREE.PointsMaterial | null)[]>([]);
  
  // Safely get mouse position - use context directly and fallback to default if no MouseProvider
  const mouseContext = useContext(MouseContext);
  const mousePosition = mouseContext?.mousePosition || { x: 0, y: 0 };

  // Memoize star data to prevent regeneration on re-renders
  const starData = useMemo(() => {
    const FIXED_DEPTH = 200; // All stars at the same depth level
    const parallaxOffset = staticMode ? 0 : 30; // No parallax expansion for static mode
    
    // Calculate aspect ratio from viewport or custom value
    const aspectRatio = customAspectRatio || (viewport ? viewport.width / viewport.height : undefined);

    // Create static stars
    const staticPositions = new Float32Array(STATIC_STAR_COUNT * 3);
    for (let i = 0; i < STATIC_STAR_COUNT; i++) {
      const star = generateStarInFrustum(FIXED_DEPTH, parallaxOffset, fov, cameraPosition, cameraOrientation, aspectRatio);
      staticPositions[i * 3] = star.x;
      staticPositions[i * 3 + 1] = star.y;
      staticPositions[i * 3 + 2] = star.z;
    }

    // Create twinkling groups
    const groups = [];
    if (shouldTwinkle && TWINKLE_GROUP_COUNT > 0) {
      const starsPerGroup = Math.floor(
        TWINKLING_STAR_COUNT / TWINKLE_GROUP_COUNT,
      );

      for (let g = 0; g < TWINKLE_GROUP_COUNT; g++) {
        const groupPositions = new Float32Array(starsPerGroup * 3);
        for (let i = 0; i < starsPerGroup; i++) {
          const star = generateStarInFrustum(FIXED_DEPTH, parallaxOffset, fov, cameraPosition, cameraOrientation, aspectRatio);
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
    }

    return { staticPositions, groups };
  }, [STATIC_STAR_COUNT, TWINKLE_GROUP_COUNT, shouldTwinkle, staticMode, fov, cameraOrientation]);

  // Handle mouse-based movement with parallax effect and twinkling animation
  useFrame(({ clock }) => {
    if (enableMouseInteraction && !staticMode && groupRef.current) {
      const lerpFactor = 0.1;
      const sensitivity = 30.0; // Increased parallax sensitivity

      // Create parallax effect - move opposite to mouse for depth illusion
      const targetX = -mousePosition.x * sensitivity;
      let targetY = 0;
      let targetZ = 0;

      if (cameraOrientation === 'y-axis') {
        // Camera looks down Y-axis: X = left/right, Z = up/down
        targetZ = -mousePosition.y * sensitivity;
      } else {
        // Camera looks down Z-axis: X = left/right, Y = up/down
        targetY = -mousePosition.y * sensitivity;
      }

      // Apply smooth interpolation
      groupRef.current.position.x +=
        (targetX - groupRef.current.position.x) * lerpFactor;
      
      if (cameraOrientation === 'y-axis') {
        groupRef.current.position.z +=
          (targetZ - groupRef.current.position.z) * lerpFactor;
      } else {
        groupRef.current.position.y +=
          (targetY - groupRef.current.position.y) * lerpFactor;
      }
    }

    // Update twinkling star opacity for each group
    if (shouldTwinkle) {
      starData.groups.forEach((group, index) => {
        const material = twinklingMaterialRefs.current[index];
        if (material) {
          const opacity = 0.6 + Math.sin(clock.elapsedTime * group.speed + group.phase) * 0.4;
          material.opacity = Math.max(0.2, opacity);
        }
      });
    }
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
          size={0.8}
          color="#ffffff"
          transparent={true}
          opacity={1.0}
          sizeAttenuation={false}
        />
      </points>

      {/* Twinkling star groups */}
      {shouldTwinkle && starData.groups.map((group, index) => (
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
            size={1.0}
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