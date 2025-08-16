import React from 'react';
import './TerrainDebugOverlay.css';
import { useFPS } from '../hooks/useFPS';

interface CameraInfo {
  position: [number, number, number];
  direction: [number, number, number];
  rotation: [number, number, number];
}

interface TerrainDebugInfo {
  type: string;
  seed: number;
  width: number;
  length: number;
  maxHeight: number;
  segments: number;
  position: [number, number, number];
  rotation: [number, number, number];
  minHeight: number;
  maxHeightValue: number;
  vertexCount: number;
  triangleCount: number;
  memoryUsage: number;
  isVisible: boolean;
  distanceFromCamera: number;
  renderTime?: number;
  cameraInfo?: CameraInfo;
}

interface TerrainDebugOverlayProps {
  debugInfo: TerrainDebugInfo | null;
  visible: boolean;
}

const TerrainDebugOverlay: React.FC<TerrainDebugOverlayProps> = ({ debugInfo, visible }) => {
  const fpsData = useFPS(500); // Update every 500ms
  
  if (!visible || !debugInfo) return null;

  const heightRange = debugInfo.maxHeightValue - debugInfo.minHeight;
  const heightPercent = heightRange > 0 ? ((debugInfo.maxHeightValue / debugInfo.maxHeight) * 100) : 0;

  return (
    <div className="terrain-debug-overlay">
      <div className="debug-header">
        <h3>Terrain Debug Info</h3>
        <div className={`status-indicator ${debugInfo.isVisible ? 'visible' : 'culled'}`}>
          {debugInfo.isVisible ? 'VISIBLE' : 'CULLED'}
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
        {debugInfo.renderTime && (
          <div className="debug-row">
            <span className="label">Render Time:</span>
            <span className="value">{debugInfo.renderTime.toFixed(2)}ms</span>
          </div>
        )}
      </div>

      <div className="debug-section">
        <h4>Terrain Properties</h4>
        <div className="debug-row">
          <span className="label">Type:</span>
          <span className="value">{debugInfo.type}</span>
        </div>
        <div className="debug-row">
          <span className="label">Seed:</span>
          <span className="value">{debugInfo.seed.toFixed(6)}</span>
        </div>
        <div className="debug-row">
          <span className="label">Segments:</span>
          <span className="value">{debugInfo.segments}×{debugInfo.segments}</span>
        </div>
        <div className="debug-row">
          <span className="label">Vertices:</span>
          <span className="value">{debugInfo.vertexCount.toLocaleString()}</span>
        </div>
        <div className="debug-row">
          <span className="label">Triangles:</span>
          <span className="value">{debugInfo.triangleCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Dimensions</h4>
        <div className="debug-row size-critical">
          <span className="label">Width (X):</span>
          <span className="value">{debugInfo.width.toFixed(1)} units</span>
        </div>
        <div className="debug-row size-critical">
          <span className="label">Length (Y):</span>
          <span className="value">{debugInfo.length.toFixed(1)} units</span>
        </div>
        <div className="debug-row size-critical">
          <span className="label">Max Height:</span>
          <span className="value">{debugInfo.maxHeight.toFixed(1)} units</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Position & Rotation</h4>
        <div className="debug-row">
          <span className="label">Position:</span>
          <span className="value">[{debugInfo.position[0].toFixed(1)}, {debugInfo.position[1].toFixed(1)}, {debugInfo.position[2].toFixed(1)}]</span>
        </div>
        <div className="debug-row">
          <span className="label">Rotation:</span>
          <span className="value">[{(debugInfo.rotation[0] * 180/Math.PI).toFixed(1)}°, {(debugInfo.rotation[1] * 180/Math.PI).toFixed(1)}°, {(debugInfo.rotation[2] * 180/Math.PI).toFixed(1)}°]</span>
        </div>
        <div className="debug-row">
          <span className="label">Distance:</span>
          <span className="value">{debugInfo.distanceFromCamera.toFixed(1)} units</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Height Analysis</h4>
        <div className="bounds-grid">
          <div className="bounds-row">
            <span className="axis">Min:</span>
            <span className="range">{debugInfo.minHeight.toFixed(2)} units</span>
          </div>
          <div className="bounds-row">
            <span className="axis">Max:</span>
            <span className="range">{debugInfo.maxHeightValue.toFixed(2)} units</span>
          </div>
          <div className="bounds-row">
            <span className="axis">Range:</span>
            <span className="range">{heightRange.toFixed(2)} units</span>
          </div>
        </div>
        <div className="height-bar">
          <div 
            className="height-fill"
            style={{ width: `${Math.min(100, heightPercent)}%` }}
          />
        </div>
        <div className="debug-row">
          <span className="label">Height Usage:</span>
          <span className="value">{heightPercent.toFixed(1)}%</span>
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

      <div className="debug-section performance-warnings">
        <h4>Performance Analysis</h4>
        {debugInfo.memoryUsage > 50 && (
          <div className="warning">⚠️ High memory usage: {debugInfo.memoryUsage.toFixed(1)}MB</div>
        )}
        {debugInfo.vertexCount > 10000 && (
          <div className="warning">⚠️ High vertex count may impact performance</div>
        )}
        {debugInfo.triangleCount > 15000 && (
          <div className="warning">⚠️ High triangle count detected</div>
        )}
        {debugInfo.distanceFromCamera > 200 && (
          <div className="warning">⚠️ Terrain very far from camera</div>
        )}
        {debugInfo.renderTime && debugInfo.renderTime > 16 && (
          <div className="error">🔴 Render time exceeds 16ms (60fps target)</div>
        )}
        {debugInfo.memoryUsage <= 50 && debugInfo.vertexCount <= 10000 && debugInfo.triangleCount <= 15000 && (
          <div className="success">✅ Terrain performance within acceptable bounds</div>
        )}
      </div>
    </div>
  );
};

export default TerrainDebugOverlay;
export type { CameraInfo, TerrainDebugInfo };