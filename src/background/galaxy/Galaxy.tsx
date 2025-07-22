import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  GalaxyType,
  NUM_STARS
} from "./config/galaxyConfig";
import {
  generateGalaxyShape,
  interpolatePositions,
  interpolateColors
} from "./utils/galaxyShapes";
import { useMousePosition } from "../../context/MouseContext";

interface GalaxyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const Galaxy: React.FC<GalaxyProps> = ({
  position = [0, 0, -10],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const { mouseVelocity, isMouseMoving, mousePosition } = useMousePosition();
  const galaxyRef = useRef<THREE.Points>(null);
  const positionAttributeRef = useRef<THREE.BufferAttribute>(null);
  const colorAttributeRef = useRef<THREE.BufferAttribute>(null);

  // Real-time transformation state with randomized targets
  const [currentTransformationProgress, setCurrentTransformationProgress] = useState(0);
  const [setIsTransforming] = useState(false);
  const [transformationTarget, setTransformationTarget] = useState<{
    type: GalaxyType;
    subtype: number;
  }>({ type: 'spiral', subtype: 0 });
  const [currentGalaxyState, setCurrentGalaxyState] = useState<{
    type: GalaxyType;
    subtype: number;
  }>({ type: 'spiral', subtype: 0 });

  // Generate multiple subtypes of each galaxy for variety
  const galaxySubtypes = useMemo(() => {
    console.log("Generating galaxy subtypes for variety");
    return {
      spiral: [
        generateGalaxyShape("spiral", undefined, 42),   // Tight spiral
        generateGalaxyShape("spiral", undefined, 157),  // Loose spiral
        generateGalaxyShape("spiral", undefined, 289),  // Dense core spiral
        generateGalaxyShape("spiral", undefined, 394),  // Wide arm spiral
        generateGalaxyShape("spiral", undefined, 512),  // Asymmetric spiral
      ],
      elliptical: [
        generateGalaxyShape("elliptical", undefined, 84),   // Classic elliptical
        generateGalaxyShape("elliptical", undefined, 217),  // Flattened elliptical
        generateGalaxyShape("elliptical", undefined, 358),  // Compact elliptical
        generateGalaxyShape("elliptical", undefined, 463),  // Extended elliptical
      ],
      irregular: [
        generateGalaxyShape("irregular", undefined, 126),  // Multi-cluster
        generateGalaxyShape("irregular", undefined, 271),  // Sparse irregular
        generateGalaxyShape("irregular", undefined, 398),  // Dense irregular
        generateGalaxyShape("irregular", undefined, 543),  // Chaotic irregular
        generateGalaxyShape("irregular", undefined, 667),  // Asymmetric irregular
      ],
    };
  }, []);

  // Helper to get specific subtype of a galaxy shape
  const getGalaxySubtype = (type: GalaxyType, subtypeIndex: number) => {
    const subtypes = galaxySubtypes[type];
    const cached = subtypes[subtypeIndex];
    return {
      positions: new Float32Array(cached.positions),
      colors: new Float32Array(cached.colors),
    };
  };

  // Generate random transformation target
  const generateRandomTarget = () => {
    const types: GalaxyType[] = ['spiral', 'elliptical', 'irregular'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const subtypeCount = galaxySubtypes[randomType].length;
    const randomSubtype = Math.floor(Math.random() * subtypeCount);
    
    return { type: randomType, subtype: randomSubtype };
  };

  // Dynamic transformation system with random targets
  useEffect(() => {
    if (isMouseMoving) {
      setIsTransforming(true);
      // Generate new random target when starting transformation
      if (currentTransformationProgress === 0) {
        setTransformationTarget(generateRandomTarget());
      }
      
      // Progress towards random target
      const progressSpeed = Math.min(mouseVelocity * 0.001, 0.008);
      setCurrentTransformationProgress(prev => {
        const newProgress = prev + progressSpeed;
        
        // When transformation completes, set new current state and generate new target
        if (newProgress >= 1.0) {
          setCurrentGalaxyState(transformationTarget);
          setTransformationTarget(generateRandomTarget());
          return 0; // Reset progress for next transformation
        }
        
        return newProgress;
      });
    } else {
      // Mouse stopped - bias toward returning to spiral variants
      setIsTransforming(false);
      if (currentGalaxyState.type !== 'spiral') {
        setCurrentTransformationProgress(prev => {
          if (prev > 0) {
            return Math.max(0, prev - 0.003); // Slow return
          } else {
            // Set target to random spiral subtype when returning to spiral
            const spiralSubtype = Math.floor(Math.random() * galaxySubtypes.spiral.length);
            setTransformationTarget({ type: 'spiral', subtype: spiralSubtype });
            setCurrentTransformationProgress(0.001); // Start very slow return
          }
          return prev;
        });
      }
    }
  }, [isMouseMoving, mouseVelocity, currentGalaxyState, transformationTarget, galaxySubtypes]);


  // Animation frame for real-time transformation
  useFrame(() => {
    if (galaxyRef.current) {
      // Base rotation
      galaxyRef.current.rotation.y += 0.0005;
      
      // Spherical rotation based on mouse position
      // Mouse X controls rotation around Y axis (left-right orbit)
      // Mouse Y controls rotation around X axis (up-down orbit)
      const mouseInfluence = 0.6; // Adjust sensitivity
      
      // Convert mouse position to rotation angles
      // mousePosition.x ranges from -1 (left) to 1 (right)
      // mousePosition.y ranges from -1 (bottom) to 1 (top)
      const targetRotationY = mousePosition.x * Math.PI * mouseInfluence;
      const targetRotationX = mousePosition.y * Math.PI * mouseInfluence * 0.5; // Less dramatic vertical movement
      
      // Smooth interpolation to target rotation
      const lerpFactor = 0.02; // Smooth following
      galaxyRef.current.rotation.y += (targetRotationY - (galaxyRef.current.rotation.y - 0.0005)) * lerpFactor;
      galaxyRef.current.rotation.x += (targetRotationX - galaxyRef.current.rotation.x) * lerpFactor;
    }


    // Handle random transformation between galaxy subtypes
    if (currentTransformationProgress > 0 && 
        positionAttributeRef.current && colorAttributeRef.current) {
      
      // Get current and target galaxy shapes
      const fromShape = getGalaxySubtype(currentGalaxyState.type, currentGalaxyState.subtype);
      const toShape = getGalaxySubtype(transformationTarget.type, transformationTarget.subtype);
      
      // Apply gentle easing for smooth transitions
      const progress = currentTransformationProgress;
      const gentleProgress = progress; // Linear for smoothness
      
      const interpolatedPositions = interpolatePositions(
        fromShape.positions,
        toShape.positions,
        gentleProgress,
      );
      const interpolatedColors = interpolateColors(
        fromShape.colors,
        toShape.colors,
        gentleProgress,
      );

      // Apply efficient mouse-based distortions to existing positions without regeneration
      const mouseInfluenceStrength = Math.min(mouseVelocity * 0.001, 0.1);
      
      for (let i = 0; i < interpolatedPositions.length; i += 3) {
        // Subtle position distortion based on mouse position
        const distortionX = Math.sin(interpolatedPositions[i] * 0.1 + mousePosition.x * 5) * mouseInfluenceStrength;
        const distortionY = Math.cos(interpolatedPositions[i + 1] * 0.1 + mousePosition.y * 5) * mouseInfluenceStrength;
        const distortionZ = Math.sin(interpolatedPositions[i + 2] * 0.1 + (mousePosition.x + mousePosition.y) * 3) * mouseInfluenceStrength * 0.5;
        
        interpolatedPositions[i] += distortionX;
        interpolatedPositions[i + 1] += distortionY; 
        interpolatedPositions[i + 2] += distortionZ;
      }

      // Update buffer attributes
      positionAttributeRef.current.array.set(interpolatedPositions);
      positionAttributeRef.current.needsUpdate = true;
      colorAttributeRef.current.array.set(interpolatedColors);
      colorAttributeRef.current.needsUpdate = true;
    }
  });

  const initialShape = useMemo(
    () => getGalaxySubtype('spiral', 0),
    [galaxySubtypes],
  );

  return (
    <group ref={galaxyRef} position={position} rotation={rotation} scale={scale}>
      {/* Main galaxy particles */}
      <points>
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

      {/* Create realistic central bulge/cluster */}
      <points position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[(() => {
              // Generate dense central cluster of stars
              const coreStars = currentGalaxyState.type === 'elliptical' ? 800 : 
                               currentGalaxyState.type === 'spiral' ? 600 : 400;
              const positions = new Float32Array(coreStars * 3);
              const coreRadius = currentGalaxyState.type === 'elliptical' ? 2.5 : 
                                currentGalaxyState.type === 'spiral' ? 4.0 : 6.0;
              
              for (let i = 0; i < coreStars; i++) {
                const i3 = i * 3;
                // Dense spherical distribution with concentration toward center
                const phi = Math.random() * Math.PI * 2;
                const cosTheta = (Math.random() - 0.5) * 2;
                const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
                
                // Power distribution for central concentration
                const r = Math.pow(Math.random(), 2) * coreRadius;
                
                positions[i3] = r * sinTheta * Math.cos(phi) + (Math.random() - 0.5) * 0.1;
                positions[i3 + 1] = r * cosTheta * 0.3 + (Math.random() - 0.5) * 0.1; // Flattened
                positions[i3 + 2] = r * sinTheta * Math.sin(phi) + (Math.random() - 0.5) * 0.1;
              }
              return positions;
            })(), 3]}
            count={currentGalaxyState.type === 'elliptical' ? 800 : 
                   currentGalaxyState.type === 'spiral' ? 600 : 400}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[(() => {
              const coreStarCount = currentGalaxyState.type === 'elliptical' ? 800 : 
                                   currentGalaxyState.type === 'spiral' ? 600 : 400;
              const colors = new Float32Array(coreStarCount * 3);
              const coreColor = currentGalaxyState.type === 'spiral' ? 
                               { r: 1.0, g: 0.84, b: 0.0 } : // Golden
                               currentGalaxyState.type === 'elliptical' ? 
                               { r: 1.0, g: 0.65, b: 0.0 } : // Orange
                               { r: 0.0, g: 1.0, b: 1.0 };   // Cyan
              
              for (let i = 0; i < coreStarCount; i++) {
                const i3 = i * 3;
                // Add brightness variation
                const brightness = 0.8 + Math.random() * 0.4;
                colors[i3] = coreColor.r * brightness;
                colors[i3 + 1] = coreColor.g * brightness;
                colors[i3 + 2] = coreColor.b * brightness;
              }
              return colors;
            })(), 3]}
            count={currentGalaxyState.type === 'elliptical' ? 800 : 
                   currentGalaxyState.type === 'spiral' ? 600 : 400}
          />
        </bufferGeometry>
        <pointsMaterial
          size={currentGalaxyState.type === 'elliptical' ? 0.012 : 
               currentGalaxyState.type === 'spiral' ? 0.010 : 0.008}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={currentGalaxyState.type === 'elliptical' ? 1.1 : 
                  currentGalaxyState.type === 'spiral' ? 0.9 : 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default Galaxy;
