import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';
import './WispBackground.css';

interface WispParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  trail: Array<{ position: THREE.Vector3; life: number; maxLife: number }>;
  size: number;
  opacity: number;
}

interface TrailSegment {
  position: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
}

const WispSystem: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<WispParticle[]>([]);
  const orphanedTrailsRef = useRef<TrailSegment[]>([]); // Independent trail segments
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  
  // Persistent trail rendering objects
  const trailGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const trailMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const trailMeshRef = useRef<THREE.Points | null>(null);
  
  const orphanedGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const orphanedMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const orphanedMeshRef = useRef<THREE.Points | null>(null);

  // Performance optimization: Shared geometry and material for particles
  const sharedGeometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const sharedMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(3, 3, 3), // Very bright for bloom
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), []);

  // Particle mesh pool for performance
  const particleMeshPoolRef = useRef<THREE.Mesh[]>([]);
  const activeMeshesRef = useRef<Set<THREE.Mesh>>(new Set());
  const cleanupQueueRef = useRef<THREE.Mesh[]>([]);

  // Helper functions for mesh pooling
  const getPooledMesh = (): THREE.Mesh => {
    let mesh: THREE.Mesh;
    if (particleMeshPoolRef.current.length > 0) {
      mesh = particleMeshPoolRef.current.pop()!;
    } else {
      mesh = new THREE.Mesh(sharedGeometry, sharedMaterial.clone());
    }
    activeMeshesRef.current.add(mesh);
    return mesh;
  };

  const returnMeshToPool = (mesh: THREE.Mesh) => {
    activeMeshesRef.current.delete(mesh);
    if (groupRef.current) {
      groupRef.current.remove(mesh);
    }
    // Reset mesh properties
    mesh.scale.setScalar(1);
    mesh.position.set(0, 0, 0);
    if (mesh.material instanceof THREE.MeshBasicMaterial) {
      mesh.material.opacity = 1;
    }
    particleMeshPoolRef.current.push(mesh);
  };

  // Create initial particles (reduced by 25%: 5 -> 4)
  useMemo(() => {
    particlesRef.current = [];
    // Start with fewer particles that will spawn naturally
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push(createParticleFromEdge());
    }
  }, []);

  function createParticleFromEdge(): WispParticle {
    // Screen bounds (adjust these based on your camera setup)
    const bounds = {
      left: -12,
      right: 12,
      top: 8,
      bottom: -8,
      near: -5,
      far: 5
    };

    // Choose random edge to spawn from
    const edge = Math.floor(Math.random() * 4); // 0=left, 1=right, 2=top, 3=bottom
    let position: THREE.Vector3;
    let velocity: THREE.Vector3;

    switch (edge) {
      case 0: // Left edge
        position = new THREE.Vector3(
          bounds.left - 2, // Start off-screen
          (Math.random() - 0.5) * (bounds.top - bounds.bottom),
          (Math.random() - 0.5) * (bounds.far - bounds.near)
        );
        velocity = new THREE.Vector3(
          0.08 + Math.random() * 0.12, // Flow right
          (Math.random() - 0.5) * 0.06, // Some vertical drift
          (Math.random() - 0.5) * 0.03
        );
        break;
      case 1: // Right edge
        position = new THREE.Vector3(
          bounds.right + 2, // Start off-screen
          (Math.random() - 0.5) * (bounds.top - bounds.bottom),
          (Math.random() - 0.5) * (bounds.far - bounds.near)
        );
        velocity = new THREE.Vector3(
          -0.08 - Math.random() * 0.12, // Flow left
          (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.03
        );
        break;
      case 2: // Top edge
        position = new THREE.Vector3(
          (Math.random() - 0.5) * (bounds.right - bounds.left),
          bounds.top + 2, // Start off-screen
          (Math.random() - 0.5) * (bounds.far - bounds.near)
        );
        velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.06,
          -0.08 - Math.random() * 0.12, // Flow down
          (Math.random() - 0.5) * 0.03
        );
        break;
      default: // Bottom edge
        position = new THREE.Vector3(
          (Math.random() - 0.5) * (bounds.right - bounds.left),
          bounds.bottom - 2, // Start off-screen
          (Math.random() - 0.5) * (bounds.far - bounds.near)
        );
        velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.06,
          0.08 + Math.random() * 0.12, // Flow up
          (Math.random() - 0.5) * 0.03
        );
        break;
    }

    // Add some curve to the motion
    const curveFactor = (Math.random() - 0.5) * 0.002;
    velocity.add(new THREE.Vector3(curveFactor, curveFactor, 0));

    return {
      position,
      velocity,
      life: 600 + Math.random() * 800, // Shorter life for more dynamic spawning
      maxLife: 600 + Math.random() * 800,
      trail: [],
      size: 0.02 + Math.random() * 0.03,
      opacity: 0.4 + Math.random() * 0.6
    };
  }

  function isOutOfBounds(position: THREE.Vector3): boolean {
    // Much more generous bounds - only remove when really far off screen
    const bounds = {
      left: -25,
      right: 25,
      top: 20,
      bottom: -20,
      near: -15,
      far: 15
    };

    return (
      position.x < bounds.left || position.x > bounds.right ||
      position.y < bounds.bottom || position.y > bounds.top ||
      position.z < bounds.near || position.z > bounds.far
    );
  }

  useFrame((state) => {
    if (!groupRef.current) return;

    // Process cleanup queue - return meshes to pool
    while (cleanupQueueRef.current.length > 0) {
      const mesh = cleanupQueueRef.current.shift()!;
      returnMeshToPool(mesh);
    }

    // Update mouse influence
    const mouse = state.mouse;
    mouseRef.current.set(mouse.x, mouse.y);

    // Reduced particle count by 25%: 15 -> 11, spawn rate reduced proportionally
    if (Math.random() < 0.03 && particlesRef.current.length < 11) {
      particlesRef.current.push(createParticleFromEdge());
    }

    // Subtle mouse interaction - spawn near edges when mouse moves (reduced rate)
    if (Math.random() < 0.015 && (Math.abs(mouse.x) > 0.3 || Math.abs(mouse.y) > 0.3)) {
      const edgeParticle = createParticleFromEdge();
      // Slight bias towards mouse position
      const mouseInfluence = 0.3;
      edgeParticle.velocity.x += mouse.x * mouseInfluence * 0.02;
      edgeParticle.velocity.y += mouse.y * mouseInfluence * 0.02;
      particlesRef.current.push(edgeParticle);
    }

    // Initialize persistent trail rendering objects if needed
    if (!trailGeometryRef.current) {
      trailGeometryRef.current = new THREE.BufferGeometry();
      trailMaterialRef.current = new THREE.PointsMaterial({
        color: new THREE.Color(2, 2, 2),
        size: 0.03,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      trailMeshRef.current = new THREE.Points(trailGeometryRef.current, trailMaterialRef.current);
      groupRef.current.add(trailMeshRef.current);
    }

    if (!orphanedGeometryRef.current) {
      orphanedGeometryRef.current = new THREE.BufferGeometry();
      orphanedMaterialRef.current = new THREE.PointsMaterial({
        color: new THREE.Color(2, 2, 2),
        size: 0.025,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      orphanedMeshRef.current = new THREE.Points(orphanedGeometryRef.current, orphanedMaterialRef.current);
      groupRef.current.add(orphanedMeshRef.current);
    }

    // Update and render particles first
    particlesRef.current = particlesRef.current.filter(particle => {
      // Add current position to trail with individual lifespans
      const trailSegmentLife = 120; // Each trail segment lives for 120 frames (2 seconds at 60fps)
      particle.trail.push({
        position: new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z),
        life: trailSegmentLife,
        maxLife: trailSegmentLife
      });
      
      // Update trail segments independently
      particle.trail = particle.trail.filter(segment => {
        segment.life--;
        return segment.life > 0;
      });

      // Update position with natural flowing motion
      particle.position.add(particle.velocity);

      // Add fluid turbulence for more organic movement
      const time = state.clock.getElapsedTime();
      const turbulence = new THREE.Vector3(
        Math.sin(time * 2 + particle.position.x * 0.5) * 0.001,
        Math.cos(time * 1.5 + particle.position.y * 0.3) * 0.001,
        Math.sin(time * 1.8 + particle.position.z * 0.4) * 0.0005
      );
      particle.velocity.add(turbulence);

      // Very subtle mouse influence - more like a gentle breeze
      const mouseInfluence = new THREE.Vector3(
        mouseRef.current.x * 0.0003,
        mouseRef.current.y * 0.0003,
        0
      );
      particle.velocity.add(mouseInfluence);

      // Minimal damping to keep movement fluid
      particle.velocity.multiplyScalar(0.9995);

      // Update life (only for visual effects, not removal)
      particle.life--;
      const lifeProgress = Math.max(0, particle.life / particle.maxLife);

      // When particle goes out of bounds, transfer trail to orphaned trails
      if (isOutOfBounds(particle.position)) {
        // Transfer remaining trail segments to orphaned trails
        particle.trail.forEach(segment => {
          orphanedTrailsRef.current.push({
            position: new THREE.Vector3(segment.position.x, segment.position.y, segment.position.z),
            life: segment.life,
            maxLife: segment.maxLife,
            size: particle.size,
            opacity: particle.opacity
          });
        });
        return false;
      }

      // Create main particle using pooled mesh
      const particleMesh = getPooledMesh();
      particleMesh.position.copy(particle.position);
      particleMesh.scale.setScalar(particle.size);
      
      // Update material opacity
      if (particleMesh.material instanceof THREE.MeshBasicMaterial) {
        particleMesh.material.opacity = particle.opacity * lifeProgress;
      }
      
      groupRef.current!.add(particleMesh);

      // Queue mesh for cleanup at end of frame
      cleanupQueueRef.current.push(particleMesh);

      return true;
    });

    // Now collect all trail segments for efficient batch rendering
    const allActiveTrailSegments: Array<{ position: THREE.Vector3; life: number; maxLife: number }> = [];
    
    // Collect trail segments from active particles
    particlesRef.current.forEach(particle => {
      particle.trail.forEach(segment => {
        allActiveTrailSegments.push(segment);
      });
    });

    // Update orphaned trails
    orphanedTrailsRef.current = orphanedTrailsRef.current.filter(segment => {
      segment.life--;
      return segment.life > 0;
    });

    // Update active trail geometry
    if (allActiveTrailSegments.length > 0 && trailGeometryRef.current) {
      const positions = new Float32Array(allActiveTrailSegments.length * 3);
      const opacities = new Float32Array(allActiveTrailSegments.length);

      allActiveTrailSegments.forEach((segment, index) => {
        const lifeProgress = segment.life / segment.maxLife;
        
        positions[index * 3] = segment.position.x;
        positions[index * 3 + 1] = segment.position.y;
        positions[index * 3 + 2] = segment.position.z;
        
        opacities[index] = lifeProgress * lifeProgress; // Quadratic fade
      });

      trailGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      trailGeometryRef.current.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
      trailGeometryRef.current.attributes.position.needsUpdate = true;
      if (trailGeometryRef.current.attributes.opacity) {
        trailGeometryRef.current.attributes.opacity.needsUpdate = true;
      }
    } else if (trailGeometryRef.current) {
      // Clear geometry when no active trails
      trailGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
      trailGeometryRef.current.attributes.position.needsUpdate = true;
    }

    // Update orphaned trail geometry
    if (orphanedTrailsRef.current.length > 0 && orphanedGeometryRef.current) {
      const positions = new Float32Array(orphanedTrailsRef.current.length * 3);
      const opacities = new Float32Array(orphanedTrailsRef.current.length);

      orphanedTrailsRef.current.forEach((segment, index) => {
        const lifeProgress = segment.life / segment.maxLife;
        
        positions[index * 3] = segment.position.x;
        positions[index * 3 + 1] = segment.position.y;
        positions[index * 3 + 2] = segment.position.z;
        
        opacities[index] = lifeProgress * lifeProgress; // Quadratic fade
      });

      orphanedGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      orphanedGeometryRef.current.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
      orphanedGeometryRef.current.attributes.position.needsUpdate = true;
      if (orphanedGeometryRef.current.attributes.opacity) {
        orphanedGeometryRef.current.attributes.opacity.needsUpdate = true;
      }
    } else if (orphanedGeometryRef.current) {
      // Clear geometry when no orphaned trails
      orphanedGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
      orphanedGeometryRef.current.attributes.position.needsUpdate = true;
    }

  });

  return <group ref={groupRef} />;
};

const WispBackground3D: React.FC = () => {
  return (
    <div className="wisp-background">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <WispSystem />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={512}
            opacity={1}
          />
          <ToneMapping adaptive={false} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default WispBackground3D;