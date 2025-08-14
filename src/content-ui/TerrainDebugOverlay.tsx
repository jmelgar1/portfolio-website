import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TerrainDebugOverlayProps {
  /** Show viewport bounds wireframe */
  showViewportBounds?: boolean;
  /** Show terrain bounds wireframe */
  showTerrainBounds?: boolean;
  /** Show intersection area */
  showIntersection?: boolean;
  /** Camera configuration */
  camera?: {
    position: [number, number, number];
    fov: number;
    aspect?: number;
  };
  /** Terrain configuration */
  terrain?: {
    position: [number, number, number];
    width: number;
    length: number;
  };
  /** Color configuration */
  colors?: {
    viewport: string;
    terrain: string;
    intersection: string;
  };
}

const TerrainDebugOverlay: React.FC<TerrainDebugOverlayProps> = ({
  showViewportBounds = true,
  showTerrainBounds = true,
  showIntersection = true,
  camera = { position: [0, 0, 5], fov: 45, aspect: 16/9 },
  terrain = { position: [0, -60, -70], width: 120, length: 300 },
  colors = {
    viewport: '#00ff00',
    terrain: '#ff0000', 
    intersection: '#ffff00'
  }
}) => {
  const debugGeometries = useMemo(() => {
    const geometries: React.ReactElement[] = [];
    
    // Calculate viewport bounds at terrain depth
    const distance = Math.abs(terrain.position[2] - camera.position[2]);
    const fovRadians = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(fovRadians / 2) * distance;
    const visibleWidth = visibleHeight * (camera.aspect || 16/9);
    
    // Viewport bounds wireframe
    if (showViewportBounds) {
      const viewportGeometry = new THREE.PlaneGeometry(visibleWidth, visibleHeight);
      geometries.push(
        <mesh key="viewport-bounds" position={[camera.position[0], camera.position[1], terrain.position[2]]}>
          <primitive object={viewportGeometry} />
          <meshBasicMaterial 
            color={colors.viewport} 
            wireframe={true} 
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      );
    }
    
    // Terrain bounds wireframe
    if (showTerrainBounds) {
      const terrainGeometry = new THREE.PlaneGeometry(terrain.width, terrain.length);
      geometries.push(
        <mesh key="terrain-bounds" position={terrain.position} rotation={[-Math.PI / 2, 0, 0]}>
          <primitive object={terrainGeometry} />
          <meshBasicMaterial 
            color={colors.terrain} 
            wireframe={true} 
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      );
    }
    
    // Intersection area
    if (showIntersection) {
      const [terrainX, terrainY] = terrain.position;
      const halfWidth = terrain.width / 2;
      const halfLength = terrain.length / 2;
      
      // Calculate terrain bounds
      const terrainLeft = terrainX - halfWidth;
      const terrainRight = terrainX + halfWidth;
      const terrainTop = terrainY + halfLength;
      const terrainBottom = terrainY - halfLength;
      
      // Calculate viewport bounds
      const viewportLeft = camera.position[0] - visibleWidth / 2;
      const viewportRight = camera.position[0] + visibleWidth / 2;
      const viewportTop = camera.position[1] + visibleHeight / 2;
      const viewportBottom = camera.position[1] - visibleHeight / 2;
      
      // Calculate intersection
      const intersectionLeft = Math.max(terrainLeft, viewportLeft);
      const intersectionRight = Math.min(terrainRight, viewportRight);
      const intersectionTop = Math.min(terrainTop, viewportTop);
      const intersectionBottom = Math.max(terrainBottom, viewportBottom);
      
      const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
      const intersectionHeight = Math.max(0, intersectionTop - intersectionBottom);
      
      if (intersectionWidth > 0 && intersectionHeight > 0) {
        const intersectionCenterX = (intersectionLeft + intersectionRight) / 2;
        const intersectionCenterY = (intersectionTop + intersectionBottom) / 2;
        
        const intersectionGeometry = new THREE.PlaneGeometry(intersectionWidth, intersectionHeight);
        geometries.push(
          <mesh 
            key="intersection-area" 
            position={[intersectionCenterX, intersectionCenterY, terrain.position[2] + 0.1]}
          >
            <primitive object={intersectionGeometry} />
            <meshBasicMaterial 
              color={colors.intersection} 
              transparent={true}
              opacity={0.3}
            />
          </mesh>
        );
      }
    }
    
    return geometries;
  }, [
    showViewportBounds, 
    showTerrainBounds, 
    showIntersection, 
    camera, 
    terrain, 
    colors
  ]);

  return <>{debugGeometries}</>;
};

export default TerrainDebugOverlay;