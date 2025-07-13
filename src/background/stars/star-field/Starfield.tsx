import React, { useMemo } from 'react';
import TwinklingStarGroup from './TwinklingStarGroup';
import {generateStarInFrustum} from "./util";

const Starfield: React.FC = () => {
  const TWINKLING_STAR_COUNT = 800; // Reasonable twinkling count
  const STATIC_STAR_COUNT = 1500; // Reasonable static count
  const TWINKLE_GROUP_COUNT = 25; // Fewer groups for better performance
  
  // Memoize star data to prevent regeneration on re-renders
  const starData = useMemo(() => {
    // Create static stars
    const staticPositions = new Float32Array(STATIC_STAR_COUNT * 3);
    for (let i = 0; i < STATIC_STAR_COUNT; i++) {
      const depth = Math.random() * 400; // Random depth from 0 to 400
      const star = generateStarInFrustum(depth);
      staticPositions[i * 3] = star.x;
      staticPositions[i * 3 + 1] = star.y;
      staticPositions[i * 3 + 2] = star.z;
    }
    
    // Create twinkling groups
    const groups = [];
    const starsPerGroup = Math.floor(TWINKLING_STAR_COUNT / TWINKLE_GROUP_COUNT);
    
    for (let g = 0; g < TWINKLE_GROUP_COUNT; g++) {
      const groupPositions = new Float32Array(starsPerGroup * 3);
      for (let i = 0; i < starsPerGroup; i++) {
        const depth = Math.random() * 400; // Random depth from 0 to 400
        const star = generateStarInFrustum(depth);
        groupPositions[i * 3] = star.x;
        groupPositions[i * 3 + 1] = star.y;
        groupPositions[i * 3 + 2] = star.z;
      }
      
      groups.push({
        positions: groupPositions,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1.5 // Slower, more subtle twinkling
      });
    }
    
    return { staticPositions, groups };
  }, [STATIC_STAR_COUNT, TWINKLE_GROUP_COUNT]);
  
  return (
    <group>
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
        <TwinklingStarGroup
          key={index}
          positions={group.positions}
          phase={group.phase}
          speed={group.speed}
        />
      ))}
    </group>
  );
};

export default Starfield;