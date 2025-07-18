import React from 'react';
import './ModeToggle.css';

interface ModeToggleProps {
  isHyperdriveMode: boolean;
  onToggle: (isHyperdrive: boolean) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ isHyperdriveMode, onToggle }) => {
  return (
    <div className="mode-toggle">
      <span className={`mode-label ${!isHyperdriveMode ? 'active' : ''}`}>
        Starfield
      </span>
      <button
        className={`toggle-button ${isHyperdriveMode ? 'hyperdrive' : 'starfield'}`}
        onClick={() => onToggle(!isHyperdriveMode)}
        aria-label={`Switch to ${isHyperdriveMode ? 'starfield' : 'hyperdrive'} mode`}
      >
        <div className="toggle-slider" />
      </button>
      <span className={`mode-label ${isHyperdriveMode ? 'active' : ''}`}>
        Hyperdrive
      </span>
    </div>
  );
};

export default ModeToggle;