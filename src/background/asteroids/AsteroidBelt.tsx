import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidData {
  id: number;
  startX: number;
  startY: number;
  currentY: number;
  size: number;
  xOffset: number;
  rotationSpeed: { x: number; y: number; z: number };
  moveSpeed: number;
  geometry: THREE.BufferGeometry;
  seed: number;
  velocity: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  mass: number;
  lastCollisionTime: number;
  pathProgress: number; // Store individual path progress for diagonal positioning
}

// Simplex noise implementation for procedural generation
class SimplexNoise {
  private grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
                   [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
                   [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  private p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  private perm = new Array(512);
  private gradP = new Array(512);

  constructor() {
    for(let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.gradP[i] = this.grad3[this.perm[i] % 12];
    }
  }

  private dot(g: number[], x: number, y: number, z: number): number {
    return g[0]*x + g[1]*y + g[2]*z;
  }

  noise3D(xin: number, yin: number, zin: number): number {
    const F3 = 1.0/3.0;
    const G3 = 1.0/6.0;

    let n0, n1, n2, n3;

    const s = (xin+yin+zin)*F3;
    const i = Math.floor(xin+s);
    const j = Math.floor(yin+s);
    const k = Math.floor(zin+s);
    const t = (i+j+k)*G3;
    const x0 = xin-i+t;
    const y0 = yin-j+t;
    const z0 = zin-k+t;

    let i1, j1, k1;
    let i2, j2, k2;

    if(x0>=y0) {
      if(y0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0*G3;
    const y2 = y0 - j2 + 2.0*G3;
    const z2 = z0 - k2 + 2.0*G3;
    const x3 = x0 - 1.0 + 3.0*G3;
    const y3 = y0 - 1.0 + 3.0*G3;
    const z3 = z0 - 1.0 + 3.0*G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.gradP[ii+this.perm[jj+this.perm[kk]]] || this.grad3[0];
    const gi1 = this.gradP[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] || this.grad3[0];
    const gi2 = this.gradP[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] || this.grad3[0];
    const gi3 = this.gradP[ii+1+this.perm[jj+1+this.perm[kk+1]]] || this.grad3[0];

    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if(t0<0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(gi0, x0, y0, z0);
    }
    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if(t1<0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(gi1, x1, y1, z1);
    }
    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if(t2<0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(gi2, x2, y2, z2);
    }
    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if(t3<0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(gi3, x3, y3, z3);
    }
    return 32.0*(n0 + n1 + n2 + n3);
  }

  fractalNoise3D(x: number, y: number, z: number, octaves: number = 4, persistence: number = 0.5, lacunarity: number = 2.0): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}

// Create shared noise instance for performance
const sharedNoise = new SimplexNoise();

// Create procedural asteroid geometry
function createAsteroidGeometry(seed: number, baseRadius: number = 0.5): THREE.BufferGeometry {
  const noise = sharedNoise;
  
  // Create base sphere geometry with moderate detail for performance
  const geometry = new THREE.SphereGeometry(baseRadius, 16, 12);
  const positionAttribute = geometry.getAttribute('position');
  const positions = positionAttribute.array as Float32Array;
  
  // Apply noise-based displacement to vertices
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Create seeded variation by offsetting noise coordinates
    const seedOffset = seed * 1000;
    const noiseScale = 3.0;
    const displacementScale = 0.15;
    
    // Generate fractal noise for realistic asteroid surface
    const displacement = noise.fractalNoise3D(
      (x + seedOffset) * noiseScale,
      (y + seedOffset) * noiseScale,
      (z + seedOffset) * noiseScale,
      3, // octaves
      0.6, // persistence
      2.0  // lacunarity
    ) * displacementScale;
    
    // Calculate normalized direction and apply displacement
    const length = Math.sqrt(x * x + y * y + z * z);
    const normalX = x / length;
    const normalY = y / length;
    const normalZ = z / length;
    
    // Apply displacement along surface normal
    const newRadius = baseRadius + displacement;
    positions[i] = normalX * newRadius;
    positions[i + 1] = normalY * newRadius;
    positions[i + 2] = normalZ * newRadius;
  }
  
  // Recalculate normals for proper lighting
  geometry.computeVertexNormals();
  
  return geometry;
}

// Collision detection and response functions
function checkCollision(a1: AsteroidData, a2: AsteroidData): boolean {
  const dx = a1.position.x - a2.position.x;
  const dy = a1.position.y - a2.position.y;
  const dz = a1.position.z - a2.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const minDistance = (a1.size + a2.size) * 0.35; // Very tight collision detection - asteroids actually touch
  return distance < minDistance;
}

function handleCollision(a1: AsteroidData, a2: AsteroidData, currentTime: number): void {
  // Collision cooldown to prevent rapid re-collision (60fps = ~16.67ms per frame)
  const collisionCooldown = 100; // 100ms cooldown
  if (currentTime - a1.lastCollisionTime < collisionCooldown || 
      currentTime - a2.lastCollisionTime < collisionCooldown) {
    return;
  }
  
  // Calculate collision normal
  const dx = a2.position.x - a1.position.x;
  const dy = a2.position.y - a1.position.y;
  const dz = a2.position.z - a1.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  if (distance === 0) {
    // Handle edge case where asteroids are at exactly the same position
    a1.velocity.x += (Math.random() - 0.5) * 2;
    a2.velocity.x -= (Math.random() - 0.5) * 2;
    return;
  }
  
  // Normalize collision vector
  const nx = dx / distance;
  const ny = dy / distance;
  const nz = dz / distance;
  
  // Calculate relative velocity
  const dvx = a2.velocity.x - a1.velocity.x;
  const dvy = a2.velocity.y - a1.velocity.y;
  const dvz = a2.velocity.z - a1.velocity.z;
  
  // Calculate relative velocity in collision normal direction
  const dvn = dvx * nx + dvy * ny + dvz * nz;
  
  // Do not resolve if velocities are separating (prevents double collision)
  if (dvn > 0) return;
  
  // Collision restitution (how bouncy the collision is)
  const restitution = 0.5; // Slightly more bouncy for better visual feedback
  
  // Simplified mass calculation for better performance
  const totalMass = a1.mass + a2.mass;
  
  // Calculate collision impulse scalar
  const impulse = -(1 + restitution) * dvn / (1 / a1.mass + 1 / a2.mass);
  
  // Apply impulse to velocities smoothly
  const impulseX = impulse * nx;
  const impulseY = impulse * ny;
  const impulseZ = impulse * nz;
  
  a1.velocity.x -= impulseX / a1.mass;
  a1.velocity.y -= impulseY / a1.mass;
  a1.velocity.z -= impulseZ / a1.mass;
  
  a2.velocity.x += impulseX / a2.mass;
  a2.velocity.y += impulseY / a2.mass;
  a2.velocity.z += impulseZ / a2.mass;
  
  // Gentle separation using velocity adjustment instead of position manipulation
  const minDistance = (a1.size + a2.size) * 0.4;
  const overlap = minDistance - distance;
  if (overlap > 0) {
    // Apply gentle separation force through velocity, not position
    const separationForce = overlap * 2.0; // Gentle separation multiplier
    const a1Ratio = a2.mass / totalMass;
    const a2Ratio = a1.mass / totalMass;
    
    a1.velocity.x -= nx * separationForce * a1Ratio;
    a1.velocity.y -= ny * separationForce * a1Ratio;
    a1.velocity.z -= nz * separationForce * a1Ratio;
    
    a2.velocity.x += nx * separationForce * a2Ratio;
    a2.velocity.y += ny * separationForce * a2Ratio;
    a2.velocity.z += nz * separationForce * a2Ratio;
  }
  
  // Update collision timestamps
  a1.lastCollisionTime = currentTime;
  a2.lastCollisionTime = currentTime;
}

const AsteroidBelt: React.FC = () => {
  const asteroidRefs = useRef<(THREE.Mesh | null)[]>([]);
  const asteroidData = useRef<AsteroidData[]>([]);
  
  // Initialize asteroid data with procedural geometries
  useMemo(() => {
    asteroidData.current = [];
    
    // Generate 59 irregular positions along the path
    const positions: number[] = [];
    for (let i = 0; i < 59; i++) {
      // Create clusters and gaps for more realistic distribution
      const baseProgress = i / 58;
      const clusterVariation = (Math.random() - 0.5) * 0.03; // Small random variation
      positions.push(Math.max(0, Math.min(1, baseProgress + clusterVariation)));
    }
    positions.sort((a, b) => a - b); // Ensure they're ordered
    
    for (let i = 0; i < 59; i++) {
      const progress = positions[i]; // Use irregular spacing for initial distribution
      const size = 0.2 + Math.random() * 0.6;
      const seed = Math.random();
      
      // For initial spawn: distribute along the diagonal path for immediate visibility
      const diagonalPathStartX = -12;
      const diagonalPathEndX = 8;
      const diagonalPathStartY = -22;  // Match new spawn area
      const diagonalPathEndY = 18;
      
      // Position along diagonal path based on progress
      const initialX = diagonalPathStartX + (progress * (diagonalPathEndX - diagonalPathStartX)) + (Math.random() - 0.5) * 2;
      const initialY = diagonalPathStartY + (progress * (diagonalPathEndY - diagonalPathStartY)) + (Math.random() - 0.5) * 2;
      const initialZ = -5;
      
      // Calculate velocity for diagonal movement (bottom-left to top-right)
      const targetAreaX = { min: 4, max: 8 };
      const targetAreaY = { min: 12, max: 18 };
      
      const targetX = targetAreaX.min + Math.random() * (targetAreaX.max - targetAreaX.min);
      const targetY = targetAreaY.min + Math.random() * (targetAreaY.max - targetAreaY.min);
      
      const directionX = targetX - initialX;
      const directionY = targetY - initialY;
      const distance = Math.sqrt(directionX * directionX + directionY * directionY);
      
      const speed = 2.0 + Math.random() * 0.8;
      
      // Calculate mass based on size
      const volume = (4/3) * Math.PI * Math.pow(size * 0.25, 3);
      const density = 2.5;
      const mass = volume * density;
      
      asteroidData.current.push({
        id: i,
        startX: initialX,
        startY: initialY,
        currentY: initialY,
        size,
        xOffset: 0,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        },
        moveSpeed: speed,
        geometry: createAsteroidGeometry(seed, 0.25),
        seed,
        velocity: {
          x: (directionX / distance) * speed,
          y: (directionY / distance) * speed,
          z: (Math.random() - 0.5) * 0.1,
        },
        position: {
          x: initialX,
          y: initialY,
          z: initialZ,
        },
        mass: mass,
        lastCollisionTime: 0,
        pathProgress: progress,
      });
    }
  }, []);

  useFrame((state, delta) => {
    // Define exit boundaries that match our new spawn/target areas
    const exitTop = 20;      // 5 units above visible area (~15)
    const exitRight = 10;    // Right of target area  
    const exitLeft = -15;    // Left of spawn area
    const exitBottom = -25;  // Below spawn area
    
    // Update each asteroid with straight-line movement
    asteroidData.current.forEach((data) => {
      // Apply physics-based movement (straight line unless collision occurs)
      data.position.x += data.velocity.x * delta;
      data.position.y += data.velocity.y * delta;
      data.position.z += data.velocity.z * delta;
      
      // Only apply very light damping to Z to prevent depth drift
      data.velocity.z *= 0.998;
      
      // Reset when asteroid exits the screen boundaries
      if (data.position.y > exitTop || data.position.x > exitRight || 
          data.position.x < exitLeft || data.position.y < exitBottom) {
        
        // Define larger spawn area in bottom-left to maintain belt coverage
        const spawnAreaX = { min: -12, max: -2 }; // Wider 10-unit spawn zone
        const spawnAreaY = { min: -22, max: -18 }; // 3-7 units below visible area
        const spawnAreaZ = -5;
        
        // Target area for diagonal movement (top-right)
        const targetAreaX = { min: 4, max: 8 }; // Top-right X range
        const targetAreaY = { min: 12, max: 18 }; // Top-right Y range
        
        // Generate completely new asteroid properties (treat as new asteroid)
        const newSize = 0.2 + Math.random() * 0.6; // New random size
        const newSeed = Math.random(); // New unique seed
        
        // Calculate new mass based on new size
        const volume = (4/3) * Math.PI * Math.pow(newSize * 0.25, 3);
        const density = 2.5;
        const newMass = volume * density;
        
        // Spawn in fixed area with separation
        const spawnX = spawnAreaX.min + Math.random() * (spawnAreaX.max - spawnAreaX.min);
        const spawnY = spawnAreaY.min + Math.random() * (spawnAreaY.max - spawnAreaY.min);
        
        data.position.x = spawnX;
        data.position.y = spawnY;
        data.position.z = spawnAreaZ;
        
        // Calculate velocity vector from spawn position to random target in top-right
        const targetX = targetAreaX.min + Math.random() * (targetAreaX.max - targetAreaX.min);
        const targetY = targetAreaY.min + Math.random() * (targetAreaY.max - targetAreaY.min);
        
        // Calculate direction vector
        const directionX = targetX - spawnX;
        const directionY = targetY - spawnY;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Normalize and apply consistent speed
        const speed = 2.0 + Math.random() * 0.8; // Speed between 2.0 and 2.8
        data.velocity.x = (directionX / distance) * speed;
        data.velocity.y = (directionY / distance) * speed;
        data.velocity.z = (Math.random() - 0.5) * 0.1; // Small z variation
        
        // Update all properties to make this a "new" asteroid
        data.size = newSize;
        data.seed = newSeed;
        data.mass = newMass;
        data.geometry = createAsteroidGeometry(newSeed, 0.25); // Generate new geometry
        data.rotationSpeed = {
          x: (Math.random() - 0.5) * 2, // New rotation speeds
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        };
        data.lastCollisionTime = 0; // Reset collision timer
      }
      
      // Update currentY for backward compatibility
      data.currentY = data.position.y;
    });
    
    // Collision detection - check all pairs
    const currentTime = state.clock.elapsedTime * 1000; // Convert to milliseconds
    for (let i = 0; i < asteroidData.current.length; i++) {
      for (let j = i + 1; j < asteroidData.current.length; j++) {
        const a1 = asteroidData.current[i];
        const a2 = asteroidData.current[j];
        
        if (checkCollision(a1, a2)) {
          handleCollision(a1, a2, currentTime);
        }
      }
    }
    
    // Update visual representation for each asteroid
    asteroidRefs.current.forEach((asteroid, index) => {
      if (asteroid && asteroidData.current[index]) {
        const data = asteroidData.current[index];
        
        // Apply individual rotation speeds
        const rotSpeed = data.rotationSpeed;
        asteroid.rotation.x += delta * rotSpeed.x;
        asteroid.rotation.y += delta * rotSpeed.y;
        asteroid.rotation.z += delta * rotSpeed.z;
        
        // Synchronize mesh position with physics position
        asteroid.position.set(data.position.x, data.position.y, data.position.z);
        
        // Apply scale based on size
        const size = data.size;
        asteroid.scale.set(size, size, size);
      }
    });
  });

  // Create realistic asteroid materials
  const asteroidMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.4, 0.35, 0.3), // Rocky brownish-gray color
      roughness: 0.9, // Very rough surface for realistic asteroid appearance
      metalness: 0.1, // Slight metallic properties for mineral content
      transparent: false,
    });
  }, []);

  const asteroids = [];
  for (let i = 0; i < 59; i++) {
    if (asteroidData.current[i]) {
      asteroids.push(
        <mesh 
          key={i}
          ref={(el) => (asteroidRefs.current[i] = el)}
          position={[0, 0, -5]} // Initial position, will be updated in useFrame
          geometry={asteroidData.current[i].geometry}
          material={asteroidMaterial}
        />
      );
    }
  }

  return (
    <>
      {asteroids}
      <directionalLight
        position={[10, 0, 0]}
        intensity={0.6}
        color={0xffffff}
        castShadow={false}
      />
    </>
  );
};

export default AsteroidBelt;