import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  GalaxyType,
  NUM_STARS,
  TRANSITION_DURATION,
} from "./config/galaxyConfig";
import {
  generateGalaxyShape,
  interpolatePositions,
  interpolateColors
} from "./utils/galaxyShapes";

interface GalaxyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  galaxyType?: GalaxyType;
  onShapeChange?: (type: GalaxyType) => void;
}

const Galaxy: React.FC<GalaxyProps> = ({
  position = [0, 0, -10],
  rotation = [0, 0, 0],
  scale = 1,
  galaxyType = "spiral",
  onShapeChange,
}) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const positionAttributeRef = useRef<THREE.BufferAttribute>(null);
  const colorAttributeRef = useRef<THREE.BufferAttribute>(null);

  // Simplified state - just track what we're displaying and what we're transitioning to
  const [displayedType, setDisplayedType] = useState<GalaxyType>(galaxyType);
  const [transitionData, setTransitionData] = useState<{
    isActive: boolean;
    progress: number;
    fromPositions: Float32Array;
    fromColors: Float32Array;
    toPositions: Float32Array;
    toColors: Float32Array;
    targetType: GalaxyType;
  } | null>(null);

  // Cache galaxy shapes but always create fresh copies when using them
  const galaxyShapes = useMemo(() => {
    console.log("Generating cached galaxy shapes");
    return {
      spiral: generateGalaxyShape("spiral"),
      elliptical: generateGalaxyShape("elliptical"),
      irregular: generateGalaxyShape("irregular"),
    };
  }, []);

  // Helper to get a fresh copy of a galaxy shape
  const getFreshGalaxyShape = (type: GalaxyType) => {
    const cached = galaxyShapes[type];
    return {
      positions: new Float32Array(cached.positions),
      colors: new Float32Array(cached.colors),
    };
  };

  // Handle galaxy type changes
  useEffect(() => {
    if (galaxyType !== displayedType && !transitionData?.isActive) {
      console.log(`Starting transition from ${displayedType} to ${galaxyType}`);

      // Get current positions and colors
      let currentPositions: Float32Array;
      let currentColors: Float32Array;

      if (positionAttributeRef.current && colorAttributeRef.current) {
        console.log("Using current buffer state as starting point");
        currentPositions = new Float32Array(
          positionAttributeRef.current.array as Float32Array,
        );
        currentColors = new Float32Array(
          colorAttributeRef.current.array as Float32Array,
        );
      } else {
        console.log("Using fresh shape as fallback");
        const currentShape = getFreshGalaxyShape(displayedType);
        currentPositions = currentShape.positions;
        currentColors = currentShape.colors;
      }

      // Get fresh target shape
      const targetShape = getFreshGalaxyShape(galaxyType);

      // Start transition
      setTransitionData({
        isActive: true,
        progress: 0,
        fromPositions: currentPositions,
        fromColors: currentColors,
        toPositions: targetShape.positions,
        toColors: targetShape.colors,
        targetType: galaxyType,
      });
    }
  }, [galaxyType, displayedType, transitionData?.isActive, galaxyShapes]);

  // Animation frame for transitions
  useFrame((state, delta) => {
    if (galaxyRef.current) {
      // Rotate galaxy
      galaxyRef.current.rotation.y += 0.0005;
    }

    // Handle transitions
    if (
      transitionData?.isActive &&
      positionAttributeRef.current &&
      colorAttributeRef.current
    ) {
      const newProgress = Math.min(
        transitionData.progress + (delta * 1000) / TRANSITION_DURATION,
        1,
      );
      const easedProgress = easeInOutCubic(newProgress);

      // Interpolate positions and colors
      const interpolatedPositions = interpolatePositions(
        transitionData.fromPositions,
        transitionData.toPositions,
        easedProgress,
      );
      const interpolatedColors = interpolateColors(
        transitionData.fromColors,
        transitionData.toColors,
        easedProgress,
      );

      // Update buffer attributes
      positionAttributeRef.current.array.set(interpolatedPositions);
      positionAttributeRef.current.needsUpdate = true;

      colorAttributeRef.current.array.set(interpolatedColors);
      colorAttributeRef.current.needsUpdate = true;

      // Update progress
      setTransitionData((prev) =>
        prev ? { ...prev, progress: newProgress } : null,
      );

      // Complete transition
      if (newProgress >= 1) {
        console.log(`Completed transition to ${transitionData.targetType}`);
        setDisplayedType(transitionData.targetType);
        setTransitionData(null);
        onShapeChange?.(transitionData.targetType);
      }
    }
  });

  // Easing function for smooth transitions
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const initialShape = useMemo(
    () => getFreshGalaxyShape(displayedType),
    [displayedType, galaxyShapes],
  );

  return (
    <points
      ref={galaxyRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttributeRef}
          attach="attributes-position"
          args={[initialShape.positions, 3]}
          count={NUM_STARS}
        />
        <bufferAttribute
          ref={colorAttributeRef}
          attach="attributes-color"
          args={[initialShape.colors, 3]}
          count={NUM_STARS}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.005}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        alphaTest={0.001}
        depthWrite={false}
      />
    </points>
  );
};

export default Galaxy;
