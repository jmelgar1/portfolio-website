import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TwinklingStarGroupProps } from "./types";

const TwinklingStarGroup: React.FC<TwinklingStarGroupProps> = ({
  positions,
  phase,
  speed,
}) => {
  const materialRef = useRef<THREE.PointsMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const opacity = 0.7 + Math.sin(clock.elapsedTime * speed + phase) * 0.3;
      materialRef.current.opacity = Math.max(0.2, opacity);
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        color="#ffffff"
        transparent={true}
        opacity={1.0}
        sizeAttenuation={false}
      />
    </points>
  );
};

export default TwinklingStarGroup;
