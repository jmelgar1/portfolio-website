import React, { useRef, useState } from 'react'
import { Text, Plane } from '@react-three/drei'
import * as THREE from 'three'
import HolographicMaterial from './HolographicMaterial'

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
  descriptionColor = "#88ffff"
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    console.log('Holographic panel clicked!')
    onClick?.()
  }

  return (
    <group position={position} rotation={rotation}>
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

      <Plane args={[0.85, 0.65]} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </Plane>

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