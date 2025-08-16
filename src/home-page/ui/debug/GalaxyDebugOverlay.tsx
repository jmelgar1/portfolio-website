import React from 'react';
import './GalaxyDebugOverlay.css';
import { useFPS } from '../../../hooks/useFPS';

interface CameraInfo {
  position: [number, number, number];
  direction: [number, number, number];
  rotation: [number, number, number];
}

interface GalaxyDebugInfo {
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
}

interface GalaxyDebugOverlayProps {
  debugInfo: GalaxyDebugInfo | null;
  visible: boolean;
}

const GalaxyDebugOverlay: React.FC<GalaxyDebugOverlayProps> = ({ debugInfo, visible }) => {
  const fpsData = useFPS(500); // Update every 500ms
  
  if (!visible || !debugInfo) return null;

  return (
    <div className="galaxy-debug-overlay">
      <div className="debug-header">
        <h3>Galaxy Debug Info</h3>
        <div className={`status-indicator ${debugInfo.isTransforming ? 'transforming' : 'stable'}`}>
          {debugInfo.isTransforming ? 'TRANSFORMING' : 'STABLE'}
        </div>
      </div>
      
      <div className="debug-section">
        <h4>Performance</h4>
        <div className="debug-row">
          <span className="label">FPS:</span>
          <span className="value">{fpsData.fps}</span>
        </div>
        <div className="debug-row">
          <span className="label">Avg FPS:</span>
          <span className="value">{fpsData.averageFps}</span>
        </div>
        <div className="debug-row">
          <span className="label">Min/Max:</span>
          <span className="value">{fpsData.minFps}/{fpsData.maxFps}</span>
        </div>
        <div className="debug-row">
          <span className="label">Frames:</span>
          <span className="value">{fpsData.frameCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Galaxy Properties</h4>
        <div className="debug-row">
          <span className="label">Type:</span>
          <span className="value">{debugInfo.type}</span>
        </div>
        <div className="debug-row">
          <span className="label">Seed:</span>
          <span className="value">{debugInfo.seed}</span>
        </div>
        <div className="debug-row">
          <span className="label">Particles:</span>
          <span className="value">{debugInfo.totalParticles.toLocaleString()}</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Dimensions</h4>
        <div className="debug-row size-critical">
          <span className="label">Width (X):</span>
          <span className="value">{debugInfo.width.toFixed(2)} units</span>
        </div>
        <div className="debug-row size-critical">
          <span className="label">Height (Y):</span>
          <span className="value">{debugInfo.height.toFixed(2)} units</span>
        </div>
        <div className="debug-row size-critical">
          <span className="label">Depth (Z):</span>
          <span className="value">{debugInfo.depth.toFixed(2)} units</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Bounds</h4>
        <div className="bounds-grid">
          <div className="bounds-row">
            <span className="axis">X:</span>
            <span className="range">{debugInfo.minX.toFixed(2)} to {debugInfo.maxX.toFixed(2)}</span>
          </div>
          <div className="bounds-row">
            <span className="axis">Y:</span>
            <span className="range">{debugInfo.minY.toFixed(2)} to {debugInfo.maxY.toFixed(2)}</span>
          </div>
          <div className="bounds-row">
            <span className="axis">Z:</span>
            <span className="range">{debugInfo.minZ.toFixed(2)} to {debugInfo.maxZ.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {debugInfo.cameraInfo && (
        <div className="debug-section">
          <h4>Camera</h4>
          <div className="debug-row">
            <span className="label">Position:</span>
            <span className="value">[{debugInfo.cameraInfo.position[0].toFixed(2)}, {debugInfo.cameraInfo.position[1].toFixed(2)}, {debugInfo.cameraInfo.position[2].toFixed(2)}]</span>
          </div>
          <div className="debug-row">
            <span className="label">Direction:</span>
            <span className="value">[{debugInfo.cameraInfo.direction[0].toFixed(2)}, {debugInfo.cameraInfo.direction[1].toFixed(2)}, {debugInfo.cameraInfo.direction[2].toFixed(2)}]</span>
          </div>
          <div className="debug-row">
            <span className="label">Rotation:</span>
            <span className="value">[{debugInfo.cameraInfo.rotation[0].toFixed(1)}°, {debugInfo.cameraInfo.rotation[1].toFixed(1)}°, {debugInfo.cameraInfo.rotation[2].toFixed(1)}°]</span>
          </div>
        </div>
      )}

      <div className="debug-section">
        <h4>Transformation</h4>
        <div className="debug-row">
          <span className="label">Progress:</span>
          <span className="value">{(debugInfo.transformationProgress * 100).toFixed(1)}%</span>
        </div>
        <div className="debug-row">
          <span className="label">Mouse Velocity:</span>
          <span className="value">{debugInfo.mouseVelocity.toFixed(3)}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${debugInfo.transformationProgress * 100}%` }}
          />
        </div>
      </div>

      <div className="debug-section size-warnings">
        <h4>Size Analysis</h4>
        {debugInfo.width > 20 && (
          <div className="warning">⚠️ Width exceeds 20 units</div>
        )}
        {debugInfo.height > 15 && (
          <div className="warning">⚠️ Height exceeds 15 units</div>
        )}
        {debugInfo.depth > 20 && (
          <div className="warning">⚠️ Depth exceeds 20 units</div>
        )}
        {debugInfo.width <= 20 && debugInfo.height <= 15 && debugInfo.depth <= 20 && (
          <div className="success">✅ Galaxy size within reasonable bounds</div>
        )}
      </div>
    </div>
  );
};

export default GalaxyDebugOverlay;
export type { CameraInfo, GalaxyDebugInfo };