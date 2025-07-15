import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {HyperDriveStar} from "./types";

const HyperDriveStars: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [stars, setStars] = useState<HyperDriveStar[]>([]);
  const { mouse } = useThree();
  const numStars = 500;

  // Initialize stars
  useEffect(() => {
    const initialStars: HyperDriveStar[] = [];
    
    for (let i = 0; i < numStars; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      
      const angle = Math.atan2(y, x);
      
      initialStars.push({
        position: new THREE.Vector3(x, y, z),
        prevPosition: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        angle,
        speed: 0,
        alpha: 1
      });
    }
    
    setStars(initialStars);
  }, []);

  useFrame(() => {
    if (!groupRef.current || stars.length === 0) return;

    // Map mouse position to acceleration (similar to mouseX in p5.js)
    const acceleration = 0.005 + (mouse.x + 1) * 0.5 * 0.195; // 0.005 to 0.2 range

    const updatedStars = stars.map(star => {
      // Update velocity based on angle and acceleration
      star.velocity.x += Math.cos(star.angle) * acceleration;
      star.velocity.y += Math.sin(star.angle) * acceleration;
      star.velocity.z += Math.cos(star.angle * 0.5) * acceleration * 0.3;

      // Store previous position
      star.prevPosition.copy(star.position);

      // Update position
      star.position.add(star.velocity);

      // Calculate alpha based on velocity magnitude
      const velocityMag = star.velocity.length();
      star.alpha = Math.min(velocityMag / 3, 1);
      star.speed = velocityMag;

      return star;
    });

    // Filter out stars that are too far away and replace with new ones
    const activeStars = updatedStars.filter(star => {
      const distance = star.position.length();
      return distance < 150; // Keep stars within reasonable bounds
    });

    // Add new stars to maintain count
    while (activeStars.length < numStars) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const angle = Math.atan2(y, x);
      
      activeStars.push({
        position: new THREE.Vector3(x, y, z),
        prevPosition: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        angle,
        speed: 0,
        alpha: 1
      });
    }

    setStars(activeStars);

    // Update line geometries for trail effect
    if (groupRef.current) {
      groupRef.current.clear();
      
      activeStars.forEach((star) => {
        if (star.speed > 0.1) { // Only draw trails for moving stars
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array([
            star.prevPosition.x, star.prevPosition.y, star.prevPosition.z,
            star.position.x, star.position.y, star.position.z
          ]);
          
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: star.alpha
          });
          
          const line = new THREE.Line(geometry, material);
          groupRef.current!.add(line);
        }
      });
    }
  });

  return <group ref={groupRef} />;
};

export default HyperDriveStars;