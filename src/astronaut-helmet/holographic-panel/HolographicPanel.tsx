import React, { useRef, useState } from 'react'
import { Text, Plane } from '@react-three/drei'
import * as THREE from 'three'
import HolographicMaterial from './HolographicMaterial.jsx'

interface HolographicPanelProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  onClick?: () => void
  title?: string
  status?: string
  description?: string
  titleColor?: string
  statusColor?: string
  descriptionColor?: string
  attachedToHelmet?: boolean
}

export const HolographicPanel: React.FC<HolographicPanelProps> = ({
  position,
  rotation = [0, 0, 0],
  onClick,
  title = "HOLOGRAPHIC DISPLAY",
  status = "Status: ACTIVE",
  description = "Click to interact",
  titleColor = "#ffffff",
  statusColor = "#00ffff",
  descriptionColor = "#88ffff",
  attachedToHelmet = false
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    console.log('Holographic panel clicked!')
    onClick?.()
  }

  // When attached to helmet, we need to account for the helmet's scale and rotation
  // The helmet is scaled by 3 and rotated by [0, Math.PI, 0]
  const adjustedPosition = attachedToHelmet 
    ? [position[0] / 3, position[1] / 3, position[2] / 3] as [number, number, number]
    : position;

  const adjustedRotation = attachedToHelmet 
    ? [rotation[0], rotation[1] - Math.PI, rotation[2]] as [number, number, number]
    : rotation;

  return (
    <group position={adjustedPosition} rotation={adjustedRotation}>
      <group position={[0, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[0.8, 0.6]} />
          <HolographicMaterial
            hologramOpacity={0.8}
            fresnelAmount={0.4}
            scanlineSize={6.0}
            signalSpeed={0.6}
            hologramColor={hovered ? '#00bbff' : '#0088ff'}
            enableBlinking={true}
            enableAdditive={true}
          />
        </mesh>
      </group>

      <Text
        position={[0, 0.15, 0.01]}
        fontSize={0.06}
        color={titleColor}
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>

      <Text
        position={[0, 0, 0.01]}
        fontSize={0.04}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {status}
      </Text>

      <Text
        position={[0, -0.15, 0.01]}
        fontSize={0.03}
        color={descriptionColor}
        anchorX="center"
        anchorY="middle"
      >
        {description}
      </Text>
    </group>
  )
}