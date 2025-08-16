import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AmbientLight } from 'three';

interface DynamicAmbientLightProps {
  minIntensity?: number;
  maxIntensity?: number;
}

const DynamicAmbientLight: React.FC<DynamicAmbientLightProps> = ({
  minIntensity = 0.1,
  maxIntensity = 0.7
}) => {
  const lightRef = useRef<AmbientLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;

    const scrollContainer = document.querySelector('.page-content');
    if (!scrollContainer) return;

    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    
    if (scrollHeight === 0) {
      lightRef.current.intensity = minIntensity;
      return;
    }

    const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
    
    const intensity = minIntensity + (maxIntensity - minIntensity) * scrollProgress;
    lightRef.current.intensity = intensity;
  });

  return <ambientLight ref={lightRef} intensity={minIntensity} />;
};

export default DynamicAmbientLight;