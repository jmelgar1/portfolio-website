import React, { useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import HolographicMaterial from './HolographicMaterial.js'

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
  width?: number
  height?: number
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
  attachedToHelmet = false,
  width = 0.8,
  height = 0.6
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

  // Calculate scaling factor based on panel size for text elements
  const sizeScale = Math.min(width, height) / 0.7;

  return (
    <group position={adjustedPosition} rotation={adjustedRotation}>
      <group position={[0, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[width, height]} />
          <HolographicMaterial
            hologramOpacity={0.4}
            fresnelAmount={0.3}
            scanlineSize={10.0}
            signalSpeed={0.6}
            hologramColor={hovered ? '#0048ff' : '#0015ff'}
            enableBlinking={false}
            enableAdditive={true}
          />
        </mesh>
      </group>

      <Text
        position={[0, height * 0.25, 0.01]}
        fontSize={0.06 * sizeScale}
        color={titleColor}
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>

      <Text
        position={[0, 0, 0.01]}
        fontSize={0.04 * sizeScale}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {status}
      </Text>

      <Text
        position={[0, -height * 0.25, 0.01]}
        fontSize={0.03 * sizeScale}
        color={descriptionColor}
        anchorX="center"
        anchorY="middle"
      >
        {description}
      </Text>
    </group>
  )
}