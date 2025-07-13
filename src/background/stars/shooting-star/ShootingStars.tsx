import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {ShootingStar} from "./types";
import {getCanvasBounds, isOutOfBounds} from "./util";

const ShootingStars: React.FC = () => {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const lastSpawnTime = useRef<number>(0);
  
  const createShootingStar = (): ShootingStar => {
    const depth = -Math.random() * 30 - 15;
    const bounds = getCanvasBounds(depth);
    const spawnMargin = 2;
    
    const edge = Math.floor(Math.random() * 4);
    let startPos: THREE.Vector3;
    let endPos: THREE.Vector3;
    
    switch (edge) {
      case 0: // Left edge
        startPos = new THREE.Vector3(
          bounds.left - spawnMargin,
          Math.random() * bounds.height + bounds.bottom,
          depth
        );
        endPos = new THREE.Vector3(
          bounds.right + spawnMargin,
          Math.random() * bounds.height + bounds.bottom,
          depth
        );
        break;
      case 1: // Right edge
        startPos = new THREE.Vector3(
          bounds.right + spawnMargin,
          Math.random() * bounds.height + bounds.bottom,
          depth
        );
        endPos = new THREE.Vector3(
          bounds.left - spawnMargin,
          Math.random() * bounds.height + bounds.bottom,
          depth
        );
        break;
      case 2: // Top edge
        startPos = new THREE.Vector3(
          Math.random() * bounds.width + bounds.left,
          bounds.top + spawnMargin,
          depth
        );
        endPos = new THREE.Vector3(
          Math.random() * bounds.width + bounds.left,
          bounds.bottom - spawnMargin,
          depth
        );
        break;
      case 3: // Bottom edge
        startPos = new THREE.Vector3(
          Math.random() * bounds.width + bounds.left,
          bounds.bottom - spawnMargin,
          depth
        );
        endPos = new THREE.Vector3(
          Math.random() * bounds.width + bounds.left,
          bounds.top + spawnMargin,
          depth
        );
        break;
      default:
        startPos = new THREE.Vector3(bounds.left - spawnMargin, 0, depth);
        endPos = new THREE.Vector3(bounds.right + spawnMargin, 0, depth);
    }
    
    const direction = endPos.clone().sub(startPos).normalize();
    const speed = 8 + Math.random() * 12;
    
    return {
      id: Date.now() + Math.random(),
      position: startPos,
      velocity: direction.multiplyScalar(speed),
      trailPositions: [],
      maxTrailLength: 10
    };
  };
  
  useFrame(({ clock }) => {
    const currentTime = clock.elapsedTime;
    const deltaTime = 0.016;
    
    // Spawn new stars
    if (currentTime - lastSpawnTime.current > 1.5 + Math.random() * 2) {
      const newStar = createShootingStar();
      setStars(prev => [...prev, newStar]);
      lastSpawnTime.current = currentTime;
    }
    
    // Update existing stars
    setStars(prevStars => {
      return prevStars.map(star => {
        // Update position
        star.position.add(star.velocity.clone().multiplyScalar(deltaTime));
        
        // Add to trail
        star.trailPositions.push(star.position.clone());
        if (star.trailPositions.length > star.maxTrailLength) {
          star.trailPositions.shift();
        }
        
        return star;
      }).filter(star => {
        // Remove stars that are out of bounds
        const bounds = getCanvasBounds(star.position.z);
        return !isOutOfBounds(star.position, bounds);
      });
    });
  });
  
  return (
    <group>
      {stars.map(star => (
        <group key={star.id}>
          {/* Main star */}
          <mesh position={star.position}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Trail */}
          {star.trailPositions.map((pos, index) => {
            const opacity = (index + 1) / star.trailPositions.length * 0.8;
            const size = ((index + 1) / star.trailPositions.length) * 0.12;
            return (
              <mesh key={index} position={pos}>
                <sphereGeometry args={[size, 6, 6]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

export default ShootingStars;