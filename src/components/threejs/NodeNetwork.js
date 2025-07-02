import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlowingOrb = ({ position, size }) => {
  return (
    <group position={position}>
      {/* Core orb */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial 
          color="#60a5fa"
          transparent={true}
          opacity={1.0}
        />
      </mesh>
      
      {/* Inner glow layer */}
      <mesh>
        <sphereGeometry args={[size * 1.3, 16, 16]} />
        <meshBasicMaterial 
          color="#3b82f6"
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      
      {/* Outer glow layer */}
      <mesh>
        <sphereGeometry args={[size * 1.8, 16, 16]} />
        <meshBasicMaterial 
          color="#1e40af"
          transparent={true}
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

const InstancedNodes = ({ positions, colors, sizes, connections }) => {
  return (
    <>
      {positions.map((position, i) => (
        <GlowingOrb 
          key={i}
          position={position}
          size={sizes[i]}
        />
      ))}
    </>
  );
};

const OptimizedEdges = ({ connections, positions }) => {
  const lineRef = useRef();
  
  const { geometry } = useMemo(() => {
    const points = [];
    const colors = [];
    
    connections.forEach(connection => {
      const startPos = positions[connection.start];
      const endPos = positions[connection.end];
      
      points.push(...startPos, ...endPos);
      
      const color = new THREE.Color(connection.color);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return { geometry };
  }, [connections, positions]);
  
  // Removed pulsing opacity animation - keeping constant brightness
  
  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial 
        color="#2563eb"
        transparent 
        opacity={0.6}
        emissive="#1e40af"
        emissiveIntensity={0.2}
      />
    </lineSegments>
  );
};

const NodeNetwork = ({ scrollPosition = 0, maxScroll = 350 }) => {
  const groupRef = useRef();
  
  // Generate 53 nodes in a distributed 3D pattern
  const nodePositions = useMemo(() => {
    const positions = [];
    const colors = ['#00ff88', '#ff6b6b', '#4ecdc4', '#ffd93d', '#6bcf7f', '#4c9aff', '#ff8a80'];
    
    // Create nodes in multiple layers and clusters
    for (let i = 0; i < 53; i++) {
      // Distribute nodes in a rough sphere pattern with some clustering
      const angle = (i / 53) * Math.PI * 4; // Multiple spirals
      const radius = 4 + Math.random() * 8; // Random radius between 4-12 (doubled from 2-6)
      const height = (Math.random() - 0.5) * 12; // Height variation -6 to 6 (doubled from -3 to 3)
      
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2; // Add some randomness (doubled)
      const y = Math.sin(angle) * radius * 0.5 + height + (Math.random() - 0.5) * 2;
      const z = Math.sin(angle * 0.5) * 4 + (Math.random() - 0.5) * 4; // Doubled depth
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, []);
  
  const nodeColors = useMemo(() => {
    return Array.from({ length: 53 }, () => '#4a90e2'); // Light blue for all nodes
  }, []);
  
  const nodeSizes = useMemo(() => {
    return Array.from({ length: 53 }, () => 0.08); // Same size for all nodes (orbs)
  }, []);
  
  // Generate connections - simple approach ensuring every node connects
  const connections = useMemo(() => {
    const edges = [];
    const numNodes = nodePositions.length;
    
    // Create a simple chain to ensure all nodes are connected
    for (let i = 0; i < numNodes - 1; i++) {
      edges.push({
        start: i,
        end: i + 1,
        color: '#2563eb' // Darker blue for edges
      });
    }
    
    // Connect last node back to first to create a cycle
    edges.push({
      start: numNodes - 1,
      end: 0,
      color: '#2563eb' // Darker blue for edges
    });
    
    // Add additional connections based on proximity
    for (let i = 0; i < numNodes; i++) {
      const distances = [];
      for (let j = 0; j < numNodes; j++) {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(nodePositions[i][0] - nodePositions[j][0], 2) +
            Math.pow(nodePositions[i][1] - nodePositions[j][1], 2) +
            Math.pow(nodePositions[i][2] - nodePositions[j][2], 2)
          );
          distances.push({ index: j, distance });
        }
      }
      
      // Sort by distance and connect to 1-2 closest nodes (in addition to chain connections)
      distances.sort((a, b) => a.distance - b.distance);
      
      const additionalConnections = 1 + Math.floor(Math.random() * 2); // 1-2 additional connections
      for (let k = 0; k < Math.min(additionalConnections, distances.length); k++) {
        const targetIndex = distances[k].index;
        
        // Check if connection already exists
        const connectionExists = edges.some(edge => 
          (edge.start === i && edge.end === targetIndex) ||
          (edge.start === targetIndex && edge.end === i)
        );
        
        if (!connectionExists) {
          edges.push({
            start: i,
            end: targetIndex,
            color: '#2563eb' // Darker blue for edges
          });
        }
      }
    }
    
    return edges;
  }, [nodePositions, nodeColors]);
  
  // Calculate focus level - becomes fully focused after projects section (200vw+)
  const focusLevel = Math.max(0, Math.min(1, (scrollPosition - 200) / 100));
  
  // Background opacity - always visible but dimmer in background
  const backgroundOpacity = 0.15 + focusLevel * 0.85;
  
  // Background scale - smaller in background, full size when focused
  const backgroundScale = 0.2 + focusLevel * 0.8;
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation of the entire network - reduced frequency
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Scale based on focus level
      groupRef.current.scale.setScalar(backgroundScale);
      
      // Position in background when not focused, center when focused
      groupRef.current.position.z = -8 + focusLevel * 8;
      groupRef.current.position.x = 0; // Always centered horizontally
      groupRef.current.position.y = 0; // Always centered vertically
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Additional lighting for enhanced glow */}
      <pointLight position={[0, 0, 2]} intensity={0.8} color="#4a90e2" decay={2} />
      <pointLight position={[4, 4, -2]} intensity={0.4} color="#60a5fa" decay={2} />
      <pointLight position={[-4, -4, -2]} intensity={0.4} color="#3b82f6" decay={2} />
      
      <InstancedNodes 
        positions={nodePositions}
        colors={nodeColors}
        sizes={nodeSizes}
        connections={connections}
      />
      <OptimizedEdges 
        connections={connections}
        positions={nodePositions}
      />
    </group>
  );
};

export default NodeNetwork;