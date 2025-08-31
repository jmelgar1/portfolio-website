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
import { useMousePosition } from "../stars/star-field/context/MouseContext";
import { useOverlay } from "../../content-page/context/NavigationOverlayContext";
import type { CameraInfo } from "../ui/debug/GalaxyDebugOverlay";

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
  const { overlayState, setTransitionPhase, preserveGalaxyState } = useOverlay();
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

  // Intersection system state
  const [intersectionState, setIntersectionState] = useState({
    isIntersecting: false,
    intersectionCenter: new THREE.Vector3(),
    intersectionRadius: 5.0, // Increased radius for wider effect
    intersectionForce: 0
  });
  const [originalPositions, setOriginalPositions] = useState<Float32Array | null>(null);
  const [displacedPositions, setDisplacedPositions] = useState<Float32Array | null>(null);

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
  const [expansionProgress, setExpansionProgress] = useState(0);
  const [galaxyOpacity, setGalaxyOpacity] = useState(1);
  const [galaxyScale, setGalaxyScale] = useState(1);

  // Track if component is mounting from preserved state
  const [isRestoringFromPreserved, setIsRestoringFromPreserved] = useState(false);
  


  // Galaxy generation with optional snapshot restoration
  const getGalaxy = (type: GalaxyType, seed: number): GalaxyPositions => {
    return generateRandomGalaxy(type, seed);
  };

  // Create galaxy from snapshot data (exact restoration)
  const createGalaxyFromSnapshot = (snapshotData: { positions: number[]; colors: number[] }): GalaxyPositions => {
    return {
      positions: new Float32Array(snapshotData.positions),
      colors: new Float32Array(snapshotData.colors)
    };
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

  // Proper 3D ray-casting to get accurate intersection with galaxy
  const getIntersectionPoint = (mouseX: number, mouseY: number): THREE.Vector3 | null => {
    if (!galaxyRef.current) return null;

    // Create raycaster from camera through mouse position
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(mouseX, mouseY);
    raycaster.setFromCamera(mouse, camera);
    
    // Get galaxy's world position and rotation
    galaxyRef.current.updateMatrixWorld(true);
    const galaxyWorldPosition = new THREE.Vector3();
    galaxyRef.current.getWorldPosition(galaxyWorldPosition);
    
    // Create a plane at the galaxy's world position, oriented towards the camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const galaxyPlane = new THREE.Plane(cameraDirection, -cameraDirection.dot(galaxyWorldPosition));
    
    // Find intersection point with the galaxy plane
    const worldIntersection = new THREE.Vector3();
    const hasIntersection = raycaster.ray.intersectPlane(galaxyPlane, worldIntersection);
    
    if (!hasIntersection) return null;
    
    // Transform world intersection to galaxy's local space
    const galaxyWorldMatrixInverse = new THREE.Matrix4();
    galaxyWorldMatrixInverse.copy(galaxyRef.current.matrixWorld).invert();
    
    const localIntersection = worldIntersection.clone();
    localIntersection.applyMatrix4(galaxyWorldMatrixInverse);
    
    return localIntersection;
  };

  // Check if mouse is intersecting with galaxy bounds (expanded to full screen)
  const checkGalaxyIntersection = (mouseX: number, mouseY: number): boolean => {
    // Allow intersection anywhere on screen to cover the full galaxy extent
    // Galaxy particles can extend quite far, especially during rotations
    return Math.abs(mouseX) < 1.0 && Math.abs(mouseY) < 1.0; // Full screen coverage
  };

  // Apply intersection forces to particles (optimized)
  const applyIntersectionForces = (positions: Float32Array, intersectionCenter: THREE.Vector3, force: number, radius: number): Float32Array => {
    // Use current positions as the baseline - this allows the effect to work even during transformations
    const result = new Float32Array(positions.length);
    result.set(positions); // Start with current positions
    
    const radiusSquared = radius * radius; // Avoid sqrt in distance check
    const centerX = intersectionCenter.x;
    const centerY = intersectionCenter.y;
    const centerZ = intersectionCenter.z;
    
    let particlesAffected = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const particleX = positions[i];
      const particleY = positions[i + 1];
      const particleZ = positions[i + 2];
      
      // Fast distance squared check
      const deltaX = particleX - centerX;
      const deltaY = particleY - centerY;
      const deltaZ = particleZ - centerZ;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
      
      if (distanceSquared < radiusSquared && distanceSquared > 0.001) { // Avoid division by zero
        const distance = Math.sqrt(distanceSquared);
        
        // Calculate falloff with gentler curve for wider effective area
        const normalizedDistance = distance / radius;
        const falloff = Math.pow(1 - normalizedDistance, 1.5); // Gentler falloff for wider effect
        const pushForce = force * falloff;
        
        // Calculate normalized push direction (away from intersection center)
        const invDistance = 1 / distance;
        const pushDirX = deltaX * invDistance;
        const pushDirY = deltaY * invDistance;
        const pushDirZ = deltaZ * invDistance;
        
        // Apply displacement
        result[i] = particleX + pushDirX * pushForce;
        result[i + 1] = particleY + pushDirY * pushForce;
        result[i + 2] = particleZ + pushDirZ * pushForce;
        
        particlesAffected++;
      }
    }
    
    if (particlesAffected > 0) {
      console.log(`💥 Displaced ${particlesAffected} particles with force ${force.toFixed(2)} (radius: ${radius.toFixed(1)})`);
    }
    
    return result;
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

  // Mouse intersection detection
  useEffect(() => {
    const isIntersecting = checkGalaxyIntersection(mousePosition.x, mousePosition.y);
    const intersectionPoint = getIntersectionPoint(mousePosition.x, mousePosition.y);
    
    if (isIntersecting && intersectionPoint) {
      console.log('🎯 Ray-cast intersection:', {
        mousePos: { x: mousePosition.x.toFixed(3), y: mousePosition.y.toFixed(3) },
        galaxyWorldPos: galaxyRef.current ? {
          x: galaxyRef.current.position.x.toFixed(2),
          y: galaxyRef.current.position.y.toFixed(2),
          z: galaxyRef.current.position.z.toFixed(2)
        } : null,
        galaxyRotation: galaxyRef.current ? {
          x: (galaxyRef.current.rotation.x * 180 / Math.PI).toFixed(1),
          y: (galaxyRef.current.rotation.y * 180 / Math.PI).toFixed(1),
          z: (galaxyRef.current.rotation.z * 180 / Math.PI).toFixed(1)
        } : null,
        localIntersection: { 
          x: intersectionPoint.x.toFixed(2), 
          y: intersectionPoint.y.toFixed(2), 
          z: intersectionPoint.z.toFixed(2) 
        }
      });
      
      // Calculate velocity-based force reduction (slower cursor = stronger force)
      const velocityDamping = Math.max(0.1, 1 - (mouseVelocity * 0.15)); // Significantly higher multiplier
      const maxForce = 2.0 * velocityDamping; // Scale max force based on velocity
      
      console.log('🚀 Velocity-based damping:', {
        rawVelocity: mouseVelocity.toFixed(3),
        damping: velocityDamping.toFixed(3),
        maxForce: maxForce.toFixed(3),
        reductionPercent: ((1 - velocityDamping) * 100).toFixed(1) + '%'
      });
      
      setIntersectionState(prev => ({
        ...prev,
        isIntersecting: true,
        intersectionCenter: intersectionPoint,
        intersectionForce: Math.min(prev.intersectionForce + 0.1, maxForce)
      }));
    } else {
      setIntersectionState(prev => ({
        ...prev,
        isIntersecting: false,
        intersectionForce: Math.max(prev.intersectionForce - 0.05, 0) // Faster decay
      }));
    }
  }, [mousePosition]);

  // Store original positions when galaxy changes
  useEffect(() => {
    if (currentGalaxy && !originalPositions) {
      setOriginalPositions(new Float32Array(currentGalaxy.positions));
    } else if (currentGalaxy && originalPositions) {
      setOriginalPositions(new Float32Array(currentGalaxy.positions));
    }
  }, [currentGalaxy]);

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
            console.log('🎯 Capturing galaxy snapshot immediately (opacity reached 0):', {
              galaxyType: currentGalaxyState.type,
              seed: currentGalaxyState.seed,
              transformationProgress: currentTransformationProgress,
              mouseMoving: isMouseMoving,
              bufferSizes: {
                positions: positionAttributeRef.current?.array.length || 0,
                colors: colorAttributeRef.current?.array.length || 0
              }
            });

            // Capture complete galaxy snapshot before transitioning to 'showing'
            const captureGalaxySnapshot = () => {
              // Capture main galaxy data from current buffer attributes
              const mainPositions = positionAttributeRef.current ? 
                Array.from(positionAttributeRef.current.array as Float32Array) : [];
              const mainColors = colorAttributeRef.current ? 
                Array.from(colorAttributeRef.current.array as Float32Array) : [];

              return {
                mainGalaxy: {
                  positions: mainPositions,
                  colors: mainColors
                },
                // Capture current and target galaxy data for transformation state
                currentGalaxyData: currentGalaxy ? {
                  positions: Array.from(currentGalaxy.positions),
                  colors: Array.from(currentGalaxy.colors)
                } : null,
                targetGalaxyData: targetGalaxy ? {
                  positions: Array.from(targetGalaxy.positions),
                  colors: Array.from(targetGalaxy.colors)
                } : null
              };
            };

            const stateToPreserve = {
              scale: galaxyScale,
              opacity: 0, // Will be at 0 when fully faded
              position: position as [number, number, number],
              rotation: galaxyRef.current ? 
                [galaxyRef.current.rotation.x, galaxyRef.current.rotation.y, galaxyRef.current.rotation.z] as [number, number, number] :
                rotation as [number, number, number],
              mousePosition: { ...mousePosition },
              currentGalaxyState: { ...currentGalaxyState },
              transformationProgress: currentTransformationProgress,
              transformationTarget: { ...transformationTarget },
              expansionProgress: expansionProgress,
              galaxySnapshot: captureGalaxySnapshot()
            };
            
            preserveGalaxyState(stateToPreserve);
            setTransitionPhase('showing');
          }
          return newOpacity;
        });
      } else if (!overlayState.isOverlayOpen && (galaxyScale > 1 || galaxyOpacity < 1)) {
        // Reset when overlay is closed - faster animation
        setGalaxyScale(prev => {
          const newScale = Math.max(prev - 0.12, 1);
          // Clear restoration flag when scale reaches normal
          if (newScale === 1 && isRestoringFromPreserved) {
            setIsRestoringFromPreserved(false);
          }
          return newScale;
        });
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
      
      let interpolatedPositions = interpolatePositions(
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

      // Apply intersection forces if active (during transformation)
      if (intersectionState.intersectionForce > 0) {
        console.log('⚡ Applying intersection force during transformation:', {
          force: intersectionState.intersectionForce,
          center: intersectionState.intersectionCenter,
          radius: intersectionState.intersectionRadius
        });
        
        // Use larger radius during transformations to ensure full coverage
        const dynamicRadius = Math.max(intersectionState.intersectionRadius, 8.0);
        
        interpolatedPositions = applyIntersectionForces(
          interpolatedPositions,
          intersectionState.intersectionCenter,
          intersectionState.intersectionForce,
          dynamicRadius
        );
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
    } else if (positionAttributeRef.current && originalPositions) {
      // Handle intersection forces on stable galaxy (no transformation)
      let currentPositions = positionAttributeRef.current.array as Float32Array;
      
      if (intersectionState.intersectionForce > 0) {
        console.log('⚡ Applying intersection force:', {
          force: intersectionState.intersectionForce,
          center: intersectionState.intersectionCenter,
          radius: intersectionState.intersectionRadius
        });
        
        // Use larger radius for stable galaxy to ensure full coverage
        const dynamicRadius = Math.max(intersectionState.intersectionRadius, 8.0);
        
        // Apply intersection forces to current galaxy
        const newDisplacedPositions = applyIntersectionForces(
          currentPositions,
          intersectionState.intersectionCenter,
          intersectionState.intersectionForce,
          dynamicRadius
        );
        
        setDisplacedPositions(newDisplacedPositions);
        positionAttributeRef.current.array.set(newDisplacedPositions);
        positionAttributeRef.current.needsUpdate = true;
        currentPositions = newDisplacedPositions;
      } else if (intersectionState.intersectionForce === 0 && displacedPositions) {
        // Gradually return to original positions
        const returnSpeed = 0.05;
        const returnedPositions = new Float32Array(originalPositions.length);
        
        for (let i = 0; i < originalPositions.length; i++) {
          const current = currentPositions[i];
          const original = originalPositions[i];
          const diff = original - current;
          returnedPositions[i] = current + diff * returnSpeed;
        }
        
        positionAttributeRef.current.array.set(returnedPositions);
        positionAttributeRef.current.needsUpdate = true;
        currentPositions = returnedPositions;
        
        // Check if we're close enough to original positions to stop the return animation
        const maxDiff = Math.max(...Array.from(currentPositions).map((pos, i) => Math.abs(pos - originalPositions[i])));
        if (maxDiff < 0.001) {
          setDisplacedPositions(null);
        }
      }
      
      // Update debug info if callback provided
      if (onDebugUpdate) {
        const bounds = calculateGalaxyBounds(currentPositions);
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
    }
  });

  // Initialize galaxy with preserved snapshot or default
  const initialShape = useMemo(() => {
    // Check if we have preserved snapshot to restore from
    if (overlayState.preservedGalaxyState?.galaxySnapshot) {
      const preserved = overlayState.preservedGalaxyState;
      const snapshot = preserved.galaxySnapshot;
      
      console.log('🔄 Restoring galaxy from snapshot:', {
        galaxyType: preserved.currentGalaxyState.type,
        seed: preserved.currentGalaxyState.seed,
        snapshotSizes: {
          mainPositions: snapshot.mainGalaxy.positions.length,
          mainColors: snapshot.mainGalaxy.colors.length
        },
        transformationProgress: preserved.transformationProgress
      });
      
      // Restore galaxy state
      setCurrentGalaxyState(preserved.currentGalaxyState);
      setTransformationTarget(preserved.transformationTarget);
      setCurrentTransformationProgress(preserved.transformationProgress);
      setExpansionProgress(preserved.expansionProgress);
      setGalaxyScale(preserved.scale);
      setGalaxyOpacity(preserved.opacity);
      setIsRestoringFromPreserved(true);
      
      // Restore galaxy from exact snapshot data
      const restoredGalaxy = createGalaxyFromSnapshot(snapshot.mainGalaxy);
      setCurrentGalaxy(restoredGalaxy);
      
      // Restore transformation galaxies if they exist
      if (snapshot.currentGalaxyData) {
        setCurrentGalaxy(createGalaxyFromSnapshot(snapshot.currentGalaxyData));
      }
      if (snapshot.targetGalaxyData && preserved.transformationProgress > 0) {
        setTargetGalaxy(createGalaxyFromSnapshot(snapshot.targetGalaxyData));
      }
      
      return restoredGalaxy;
    } else {
      // Default initialization
      const initialGalaxy = getGalaxy('spiral', 12345);
      setCurrentGalaxy(initialGalaxy);
      return initialGalaxy;
    }
  }, [overlayState.preservedGalaxyState]);

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

    </group>
  );
};

export default Galaxy;
