import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  GalaxyType,
  NUM_STARS
} from "./config/galaxyConfig";
import {
  interpolatePositions,
  interpolateColors
} from "./utils/galaxyShapes";
import { generateOptimizedGalaxyShape, GalaxyPositions } from "./utils/OptimizedGalaxyShapes";
import { useMousePosition } from "../../context/MouseContext";
import { useOverlay } from "../../content-ui/context/NavigationOverlayContext";
import type { CameraInfo } from "../../navigation-ui/GalaxyDebugOverlay";

interface GalaxyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onDebugUpdate?: (debugInfo: {
    type: string;
    seed: number;
    width: number;
    height: number;
    depth: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    totalParticles: number;
    transformationProgress: number;
    mouseVelocity: number;
    isTransforming: boolean;
    cameraInfo?: CameraInfo;
  }) => void;
}

const Galaxy: React.FC<GalaxyProps> = ({
  position = [0, 0, -10],
  rotation = [0, 0, 0],
  scale = 1,
  onDebugUpdate,
}) => {
  const { mouseVelocity, isMouseMoving, mousePosition } = useMousePosition();
  const { overlayState, setTransitionPhase } = useOverlay();
  const { camera } = useThree();
  const galaxyRef = useRef<THREE.Points>(null);
  const positionAttributeRef = useRef<THREE.BufferAttribute>(null);
  const colorAttributeRef = useRef<THREE.BufferAttribute>(null);

  // Simple transformation state
  const [currentTransformationProgress, setCurrentTransformationProgress] = useState(0);
  const [transformationTarget, setTransformationTarget] = useState<{
    type: GalaxyType;
    seed: number;
  }>({ type: 'spiral', seed: Math.random() * 100000 });
  const [currentGalaxyState, setCurrentGalaxyState] = useState<{
    type: GalaxyType;
    seed: number;
  }>({ type: 'spiral', seed: 12345 });

  // Simple random galaxy generation (like Minecraft worlds)
  const generateRandomGalaxy = useMemo(() => {
    return (type: GalaxyType, seed?: number) => {
      const galaxySeed = seed || Math.random() * 100000;
      return generateOptimizedGalaxyShape(type, galaxySeed);
    };
  }, []);

  // Simple galaxy cache - just current and target
  const [currentGalaxy, setCurrentGalaxy] = useState<GalaxyPositions | null>(null);
  const [targetGalaxy, setTargetGalaxy] = useState<GalaxyPositions | null>(null);

  // Overlay transition states
  const [, setExpansionProgress] = useState(0);
  const [galaxyOpacity, setGalaxyOpacity] = useState(1);
  const [galaxyScale, setGalaxyScale] = useState(1);


  // Simple galaxy generation without complex caching
  const getGalaxy = (type: GalaxyType, seed: number): GalaxyPositions => {
    return generateRandomGalaxy(type, seed);
  };

  // Helper function to get camera info
  const getCameraInfo = (): CameraInfo => {
    const direction = camera.getWorldDirection(new THREE.Vector3());
    return {
      position: [camera.position.x, camera.position.y, camera.position.z],
      direction: [direction.x, direction.y, direction.z],
      rotation: [
        camera.rotation.x * 180 / Math.PI,
        camera.rotation.y * 180 / Math.PI,
        camera.rotation.z * 180 / Math.PI
      ]
    };
  };

  // Calculate galaxy bounds and dimensions
  const calculateGalaxyBounds = (positions: Float32Array) => {
    if (positions.length === 0) return null;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    return {
      minX, maxX, minY, maxY, minZ, maxZ,
      width: maxX - minX,
      height: maxY - minY,
      depth: maxZ - minZ
    };
  };

  // Simple random target generation (like Minecraft)
  const generateRandomTarget = () => {    
    // Truly random galaxy type selection
    const galaxyTypes: GalaxyType[] = ['spiral', 'elliptical', 'irregular'];
    const randomIndex = Math.floor(Math.random() * galaxyTypes.length);
    const selectedType = galaxyTypes[randomIndex];
    
    // Just generate a random seed - no uniqueness tracking needed
    const randomSeed = Math.floor(Math.random() * 100000);
    
    return { type: selectedType, seed: randomSeed };
  };

  // Simple transformation system
  useEffect(() => {
    if (isMouseMoving) {
      // Generate new random target when starting transformation
      if (currentTransformationProgress === 0) {
        const newTarget = generateRandomTarget();
        setTransformationTarget(newTarget);
        
        // Pre-generate target galaxy
        const targetGalaxyData = getGalaxy(newTarget.type, newTarget.seed);
        setTargetGalaxy(targetGalaxyData);
      }
      
      // Progress towards target
      const progressSpeed = Math.min(mouseVelocity * 0.001, 0.008);
      setCurrentTransformationProgress(prev => {
        const newProgress = prev + progressSpeed;
        
        // When transformation completes
        if (newProgress >= 1.0) {
          setCurrentGalaxyState(transformationTarget);
          setCurrentGalaxy(targetGalaxy);
          
          const nextTarget = generateRandomTarget();
          setTransformationTarget(nextTarget);
          
          return 0; // Reset for next transformation
        }
        
        return newProgress;
      });
    } else {
      // Mouse stopped - return to spiral
      if (currentGalaxyState.type !== 'spiral') {
        setCurrentTransformationProgress(prev => {
          if (prev > 0) {
            return Math.max(0, prev - 0.003); // Slow return
          } else {
            // Generate random spiral when returning
            const spiralTarget = { type: 'spiral' as GalaxyType, seed: Math.floor(Math.random() * 100000) };
            setTransformationTarget(spiralTarget);
            setCurrentTransformationProgress(0.001);
          }
          return prev;
        });
      }
    }
  }, [isMouseMoving, mouseVelocity, currentGalaxyState, transformationTarget, mousePosition]);



  // Animation frame for real-time transformation
  useFrame(() => {
    if (galaxyRef.current) {
      // Handle overlay transition animations
      if (overlayState.transitionPhase === 'expanding') {
        setExpansionProgress(prev => {
          const newProgress = Math.min(prev + 0.03, 1);
          const easeOut = 1 - Math.pow(1 - newProgress, 3); // Cubic ease-out
          setGalaxyScale(1 + easeOut * 8); // Scale up to 9x size
          
          if (newProgress >= 1) {
            setTransitionPhase('fading');
          }
          return newProgress;
        });
      } else if (overlayState.transitionPhase === 'fading') {
        setGalaxyOpacity(prev => {
          const newOpacity = Math.max(prev - 0.04, 0);
          if (newOpacity <= 0) {
            setTransitionPhase('showing');
          }
          return newOpacity;
        });
      } else if (!overlayState.isOverlayOpen && (galaxyScale > 1 || galaxyOpacity < 1)) {
        // Reset when overlay is closed - faster animation
        setGalaxyScale(prev => Math.max(prev - 0.12, 1));
        setGalaxyOpacity(prev => Math.min(prev + 0.08, 1));
        setExpansionProgress(0);
      }

      // Apply scaling to the galaxy group
      const targetScale = scale * galaxyScale;
      galaxyRef.current.scale.setScalar(targetScale);

      // Only apply rotation when overlay is not open
      if (!overlayState.isOverlayOpen) {
        // Base rotation - keep the slow Y-axis spin
        galaxyRef.current.rotation.y += 0.0005;
        
        // Spherical rotation based on mouse position
        // Mouse X controls rotation around Y axis (left-right orbit)
        // Mouse Y controls rotation around X axis (up-down orbit)
        const mouseInfluence = 0.6; // Adjust sensitivity
        
        // Convert mouse position to rotation angles (INVERTED)
        // mousePosition.x ranges from -1 (left) to 1 (right) - now inverted
        // mousePosition.y ranges from -1 (bottom) to 1 (top) - now inverted
        const targetRotationY = -mousePosition.x * Math.PI * mouseInfluence;
        const targetRotationX = -mousePosition.y * Math.PI * mouseInfluence * 0.5; // Less dramatic vertical movement
        
        // Smooth interpolation to target rotation
        const lerpFactor = 0.02; // Smooth following
        galaxyRef.current.rotation.y += (targetRotationY - (galaxyRef.current.rotation.y - 0.0005)) * lerpFactor;
        galaxyRef.current.rotation.x += (targetRotationX - galaxyRef.current.rotation.x) * lerpFactor;
      }
    }


    // Handle simple transformation between galaxies
    if (currentTransformationProgress > 0 && 
        positionAttributeRef.current && colorAttributeRef.current &&
        currentGalaxy && targetGalaxy) {
      
      const fromShape = currentGalaxy;
      const toShape = targetGalaxy;
      
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

      // Update debug info if callback provided
      if (onDebugUpdate) {
        const bounds = calculateGalaxyBounds(interpolatedPositions);
        if (bounds) {
          onDebugUpdate({
            type: currentGalaxyState.type,
            seed: currentGalaxyState.seed,
            width: bounds.width,
            height: bounds.height,
            depth: bounds.depth,
            minX: bounds.minX,
            maxX: bounds.maxX,
            minY: bounds.minY,
            maxY: bounds.maxY,
            minZ: bounds.minZ,
            maxZ: bounds.maxZ,
            totalParticles: NUM_STARS,
            transformationProgress: currentTransformationProgress,
            mouseVelocity: mouseVelocity,
            isTransforming: isMouseMoving && currentTransformationProgress > 0,
            cameraInfo: getCameraInfo()
          });
        }
      }
    } else if (onDebugUpdate && positionAttributeRef.current) {
      // Update debug info for current stable galaxy
      const positions = positionAttributeRef.current.array as Float32Array;
      const bounds = calculateGalaxyBounds(positions);
      if (bounds) {
        onDebugUpdate({
          type: currentGalaxyState.type,
          seed: currentGalaxyState.seed,
          width: bounds.width,
          height: bounds.height,
          depth: bounds.depth,
          minX: bounds.minX,
          maxX: bounds.maxX,
          minY: bounds.minY,
          maxY: bounds.maxY,
          minZ: bounds.minZ,
          maxZ: bounds.maxZ,
          totalParticles: NUM_STARS,
          transformationProgress: currentTransformationProgress,
          mouseVelocity: mouseVelocity,
          isTransforming: false,
          cameraInfo: getCameraInfo()
        });
      }
    }
  });

  const initialShape = useMemo(() => {
    const initialGalaxy = getGalaxy('spiral', 12345);
    setCurrentGalaxy(initialGalaxy);
    return initialGalaxy;
  }, []);

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
          opacity={galaxyOpacity}
          alphaTest={0.001}
          depthWrite={false}
        />
      </points>

      {/* Create realistic central bulge/cluster with seed-based variation */}
      <points position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[(() => {
              // Generate unique central cluster based on galaxy seed
              const seedVariation = (currentGalaxyState.seed % 100) / 100;
              const coreStars = currentGalaxyState.type === 'elliptical' ? 
                               Math.floor(700 + seedVariation * 200) : 
                               currentGalaxyState.type === 'spiral' ? 
                               Math.floor(500 + seedVariation * 200) : 
                               Math.floor(300 + seedVariation * 200);
              
              const positions = new Float32Array(coreStars * 3);
              const coreRadius = currentGalaxyState.type === 'elliptical' ? 
                                2.0 + seedVariation * 1.0 : 
                                currentGalaxyState.type === 'spiral' ? 
                                3.5 + seedVariation * 1.0 : 
                                5.5 + seedVariation * 1.0;
              
              // Use galaxy seed for consistent but unique core generation
              const coreRandom = () => {
                const a = (currentGalaxyState.seed * 9301 + 49297) % 233280;
                return a / 233280;
              };
              
              for (let i = 0; i < coreStars; i++) {
                const i3 = i * 3;
                // Dense spherical distribution with seed-based randomness
                const phi = coreRandom() * Math.PI * 2;
                const cosTheta = (coreRandom() - 0.5) * 2;
                const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
                
                // Power distribution with seed variation
                const r = Math.pow(coreRandom(), 2 + seedVariation * 0.5) * coreRadius;
                
                positions[i3] = r * sinTheta * Math.cos(phi) + (coreRandom() - 0.5) * 0.1;
                positions[i3 + 1] = r * cosTheta * (0.3 + seedVariation * 0.2) + (coreRandom() - 0.5) * 0.1;
                positions[i3 + 2] = r * sinTheta * Math.sin(phi) + (coreRandom() - 0.5) * 0.1;
              }
              return positions;
            })(), 3]}
            count={(() => {
              const seedVariation = (currentGalaxyState.seed % 100) / 100;
              return currentGalaxyState.type === 'elliptical' ? 
                     Math.floor(700 + seedVariation * 200) : 
                     currentGalaxyState.type === 'spiral' ? 
                     Math.floor(500 + seedVariation * 200) : 
                     Math.floor(300 + seedVariation * 200);
            })()}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[(() => {
              const seedVariation = (currentGalaxyState.seed % 100) / 100;
              const coreStarCount = currentGalaxyState.type === 'elliptical' ? 
                                   Math.floor(700 + seedVariation * 200) : 
                                   currentGalaxyState.type === 'spiral' ? 
                                   Math.floor(500 + seedVariation * 200) : 
                                   Math.floor(300 + seedVariation * 200);
              
              const colors = new Float32Array(coreStarCount * 3);
              
              // Unique core colors based on galaxy type and seed
              let coreColor;
              if (currentGalaxyState.type === 'spiral') {
                coreColor = { 
                  r: 1.0 + seedVariation * 0.1, 
                  g: 0.84 + seedVariation * 0.1, 
                  b: seedVariation * 0.2 
                };
              } else if (currentGalaxyState.type === 'elliptical') {
                coreColor = { 
                  r: 1.0 + seedVariation * 0.05, 
                  g: 0.65 + seedVariation * 0.15, 
                  b: seedVariation * 0.1 
                };
              } else {
                coreColor = { 
                  r: seedVariation * 0.3, 
                  g: 1.0 + seedVariation * 0.1, 
                  b: 1.0 + seedVariation * 0.1 
                };
              }
              
              // Use seed-based randomness for consistent colors
              const coreRandom = () => {
                const a = (currentGalaxyState.seed * 9301 + 49297) % 233280;
                return a / 233280;
              };
              
              for (let i = 0; i < coreStarCount; i++) {
                const i3 = i * 3;
                const brightness = 0.8 + coreRandom() * 0.4;
                colors[i3] = Math.min(coreColor.r * brightness, 1.0);
                colors[i3 + 1] = Math.min(coreColor.g * brightness, 1.0);
                colors[i3 + 2] = Math.min(coreColor.b * brightness, 1.0);
              }
              return colors;
            })(), 3]}
            count={(() => {
              const seedVariation = (currentGalaxyState.seed % 100) / 100;
              return currentGalaxyState.type === 'elliptical' ? 
                     Math.floor(700 + seedVariation * 200) : 
                     currentGalaxyState.type === 'spiral' ? 
                     Math.floor(500 + seedVariation * 200) : 
                     Math.floor(300 + seedVariation * 200);
            })()}
          />
        </bufferGeometry>
        <pointsMaterial
          size={currentGalaxyState.type === 'elliptical' ? 0.012 : 
               currentGalaxyState.type === 'spiral' ? 0.010 : 0.008}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={(currentGalaxyState.type === 'elliptical' ? 1.1 : 
                  currentGalaxyState.type === 'spiral' ? 0.9 : 0.7) * galaxyOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default Galaxy;
