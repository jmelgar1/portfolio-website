/**
 * DEMO: How to use the Terrain Optimization Testing Suite
 * 
 * This file demonstrates how to integrate the visual debugging overlay
 * and run the optimization analysis in your development environment.
 */

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import MountainTerrain from './MountainTerrain';
import TerrainDebugOverlay from './TerrainDebugOverlay';
import { 
  generateOptimizationReport 
} from './__tests__/TerrainOptimizationTest';

const TerrainTestingDemo: React.FC = () => {
  const [showDebugOverlay, setShowDebugOverlay] = useState(true);
  const [optimizationReport, setOptimizationReport] = useState<ReturnType<typeof generateOptimizationReport> | null>(null);

  // Current optimized configuration
  const currentConfig = {
    width: 120,
    length: 300,
    segments: 92,
    position: [0, -60, -70] as [number, number, number]
  };

  // Original configuration for comparison
  const originalConfig = {
    width: 450,
    length: 300,
    segments: 92,
    position: [0, -60, -70] as [number, number, number]
  };

  useEffect(() => {
    // Generate optimization report on component mount
    const report = generateOptimizationReport(currentConfig, originalConfig);
    setOptimizationReport(report);
    
    // Log the report to console for inspection
    console.log('=== TERRAIN OPTIMIZATION REPORT ===');
    console.log(`Viewport dimensions: ${report.viewport.visibleWidth.toFixed(1)} x ${report.viewport.visibleHeight.toFixed(1)}`);
    console.log(`Current terrain coverage: ${(report.current.validation.coverage * 100).toFixed(1)}%`);
    console.log(`Current horizontal efficiency: ${(report.current.validation.horizontalEfficiency * 100).toFixed(1)}%`);
    console.log(`Original horizontal efficiency: ${(report.original.validation.horizontalEfficiency * 100).toFixed(1)}%`);
    console.log(`Horizontal efficiency improvement: ${report.improvements.horizontalEfficiencyImprovement.toFixed(1)}%`);
    console.log(`Current optimization status:`, report.current.validation.isOptimal ? '✅ OPTIMAL' : '❌ NEEDS IMPROVEMENT');
    console.log(`Original optimization status:`, report.original.validation.isOptimal ? '✅ OPTIMAL' : '❌ NEEDS IMPROVEMENT');
    console.log('====================================');
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px'
      }}>
        <h3>Terrain Optimization Testing</h3>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input 
            type="checkbox" 
            checked={showDebugOverlay} 
            onChange={(e) => setShowDebugOverlay(e.target.checked)}
          />
          {' '}Show Debug Overlay
        </label>

        {optimizationReport && (
          <div>
            <h4>Optimization Results:</h4>
            <div>Viewport: {optimizationReport.viewport.visibleWidth.toFixed(1)} x {optimizationReport.viewport.visibleHeight.toFixed(1)}</div>
            <div>Coverage: {(optimizationReport.current.validation.coverage * 100).toFixed(1)}%</div>
            <div>H-Efficiency: {(optimizationReport.current.validation.horizontalEfficiency * 100).toFixed(1)}%</div>
            <div>Status: {optimizationReport.current.validation.isOptimal ? '✅ Optimal' : '❌ Sub-optimal'}</div>
            <div>Improvement: +{optimizationReport.improvements.horizontalEfficiencyImprovement.toFixed(1)}%</div>
            
            {optimizationReport.current.validation.recommendations.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <h5>Recommendations:</h5>
                {optimizationReport.current.validation.recommendations.map((rec: string, i: number) => (
                  <div key={i} style={{ fontSize: '10px', color: '#ffaa00' }}>• {rec}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '15px', fontSize: '10px', color: '#aaa' }}>
          <div>🟢 Green: Viewport bounds</div>
          <div>🔴 Red: Terrain bounds</div>
          <div>🟡 Yellow: Intersection (used area)</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Actual terrain */}
        <MountainTerrain 
          position={currentConfig.position}
          width={currentConfig.width}
          length={currentConfig.length}
          segments={currentConfig.segments}
        />

        {/* Debug overlay */}
        {showDebugOverlay && (
          <TerrainDebugOverlay
            camera={{ position: [0, 0, 5], fov: 45 }}
            terrain={{ 
              position: currentConfig.position, 
              width: currentConfig.width, 
              length: currentConfig.length 
            }}
            showViewportBounds={true}
            showTerrainBounds={true}
            showIntersection={true}
            colors={{
              viewport: '#00ff00',
              terrain: '#ff0000',
              intersection: '#ffff00'
            }}
          />
        )}

        {/* Basic lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Canvas>
    </div>
  );
};

export default TerrainTestingDemo;

/**
 * TO USE THIS DEMO:
 * 
 * 1. Import this component in your app:
 *    import TerrainTestingDemo from './src/content-ui/TERRAIN_TESTING_DEMO';
 * 
 * 2. Render it in place of your normal app temporarily:
 *    <TerrainTestingDemo />
 * 
 * 3. Check browser console for detailed optimization report
 * 
 * 4. Toggle the debug overlay to see visual bounds
 * 
 * 5. Verify that:
 *    - Green wireframe shows viewport at terrain depth
 *    - Red wireframe shows current terrain bounds
 *    - Yellow fill shows efficiently used terrain area
 *    - Terrain width (120) should closely match viewport width (~110.5)
 *    - Minimal red wireframe should extend beyond green wireframe edges
 */