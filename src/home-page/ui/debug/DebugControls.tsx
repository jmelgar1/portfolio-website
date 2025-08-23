import { useState, useEffect } from "react";
import GalaxyDebugOverlay from "./GalaxyDebugOverlay";

interface DebugInfo {
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
}

interface DebugControlsProps {
  debugInfo: DebugInfo | null;
}

const DebugControls = ({ debugInfo }: DebugControlsProps) => {
  const [showDebug, setShowDebug] = useState(false);

  // Add keyboard shortcut for debug toggle (Ctrl+D or Cmd+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Debug overlay */}
      <GalaxyDebugOverlay debugInfo={debugInfo} visible={showDebug} />

      {/* Debug indicator */}
      {showDebug && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#4da6ff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 999
        }}>
          Debug Mode Active - Press Ctrl+D to toggle
        </div>
      )}
    </>
  );
};

export default DebugControls;
export type { DebugInfo };