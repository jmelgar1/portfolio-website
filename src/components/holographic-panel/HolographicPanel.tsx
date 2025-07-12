import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Plane } from '@react-three/drei'
import * as THREE from 'three'
import HolographicMaterial from './HolographicMaterial'

interface HolographicPanelProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  onClick?: () => void
}

export const HolographicPanel: React.FC<HolographicPanelProps> = ({
  position,
  rotation = [0, 0, 0],
  onClick
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
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        HOLOGRAPHIC DISPLAY
      </Text>

      <Text
        position={[0, 0, 0.01]}
        fontSize={0.04}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        Status: ACTIVE
      </Text>

      <Text
        position={[0, -0.15, 0.01]}
        fontSize={0.03}
        color="#88ffff"
        anchorX="center"
        anchorY="middle"
      >
        Click to interact
      </Text>
    </group>
  )
}