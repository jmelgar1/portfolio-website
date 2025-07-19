import React from 'react';
import { GalaxyType } from '../../background/galaxy/config/galaxyConfig';
import './GalaxyToggle.css';

interface GalaxyToggleProps {
  currentType: GalaxyType;
  onTypeChange: (type: GalaxyType) => void;
  disabled?: boolean;
}

const GalaxyToggle: React.FC<GalaxyToggleProps> = ({
  currentType,
  onTypeChange,
  disabled = false
}) => {
  const galaxyTypes: { type: GalaxyType; label: string; description: string }[] = [
    {
      type: 'spiral',
      label: 'Spiral',
      description: 'Classic spiral arms with central bulge'
    },
    {
      type: 'elliptical',
      label: 'Elliptical',
      description: 'Smooth, oval-shaped distribution'
    },
    {
      type: 'irregular',
      label: 'Irregular',
      description: 'Chaotic clusters and asymmetric structure'
    }
  ];

  return (
    <div className="galaxy-toggle">
      <div className="galaxy-toggle__label">
        Galaxy Type
      </div>
      <div className="galaxy-toggle__buttons">
        {galaxyTypes.map(({ type, label, description }) => (
          <button
            key={type}
            className={`galaxy-toggle__button ${
              currentType === type ? 'galaxy-toggle__button--active' : ''
            } ${disabled ? 'galaxy-toggle__button--disabled' : ''}`}
            onClick={() => !disabled && onTypeChange(type)}
            disabled={disabled}
            title={description}
          >
            <span className="galaxy-toggle__button-label">{label}</span>
            {currentType === type && (
              <div className="galaxy-toggle__indicator" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GalaxyToggle;