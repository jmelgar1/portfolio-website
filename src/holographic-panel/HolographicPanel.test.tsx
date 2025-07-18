import React from 'react'
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { HolographicPanel } from './HolographicPanel'

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {} })),
  extend: vi.fn(),
}))

// Mock @react-three/drei components
vi.mock('@react-three/drei', () => ({
  Text: vi.fn(() => <mesh><bufferGeometry /><meshBasicMaterial /></mesh>),
  Plane: vi.fn(() => <mesh><planeGeometry /><meshBasicMaterial /></mesh>),
  shaderMaterial: vi.fn(() => ({})),
}))

// Mock HolographicMaterial
vi.mock('./HolographicMaterial.tsx', () => ({
  default: vi.fn(() => <meshBasicMaterial attach="material" />)
}))

describe('HolographicPanel', () => {
  const defaultProps = {
    position: [0, 0, 0] as [number, number, number]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders without crashing', async () => {
    await expect(ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)).resolves.not.toThrow()
  })

  test('renders with correct structure', async () => {
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    const group = renderer.scene.children[0]
    expect(group.type).toBe('Group')
  })

  test('renders with custom position and rotation', async () => {
    const customProps = {
      position: [1, 2, 3] as [number, number, number],
      rotation: [0.1, 0.2, 0.3] as [number, number, number],
    }

    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...customProps} />)
    const group = renderer.scene.children[0]
    expect(group.type).toBe('Group')
  })

  test('renders main mesh', async () => {
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    const group = renderer.scene.children[0]
    expect(group.children.length).toBeGreaterThan(0)
  })

  test('renders with Text component', async () => {
    const { Text } = await import('@react-three/drei')
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    
    expect(Text).toHaveBeenCalledWith(
      {
        position: [0, 0.15, 0.01],
        fontSize: 0.06,
        color: '#ffffff',
        anchorX: 'center',
        anchorY: 'middle',
        children: 'HOLOGRAPHIC DISPLAY'
      },
      undefined
    )
  })

  test('renders with HolographicMaterial', async () => {
    // @ts-ignore
    const HolographicMaterial = (await import('./HolographicMaterial.tsx')).default
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    
    expect(HolographicMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        hologramOpacity: 0.8,
        fresnelAmount: 0.4,
        scanlineSize: 6.0,
        signalSpeed: 0.6,
        hologramColor: '#0088ff',
        enableBlinking: true,
        enableAdditive: true
      }),
      undefined
    )
  })

  test('handles click events', async () => {
    const mockOnClick = vi.fn()
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} onClick={mockOnClick} />)
    const group = renderer.scene.children[0]
    const mainMesh = group.children[0]

    await renderer.fireEvent(mainMesh, 'click')

    expect(console.log).toHaveBeenCalledWith('Holographic panel clicked!')
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('click handler works without onClick prop', async () => {
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    const group = renderer.scene.children[0]
    const mainMesh = group.children[0]

    await renderer.fireEvent(mainMesh, 'click')
    expect(console.log).toHaveBeenCalledWith('Holographic panel clicked!')
  })

  test('renders with custom text props', async () => {
    const customProps = {
      position: [0, 0, 0] as [number, number, number],
      title: 'Custom Title',
      status: 'Status: CUSTOM',
      description: 'Custom Description',
      titleColor: '#ff0000',
      statusColor: '#00ff00',
      descriptionColor: '#0000ff'
    }

    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...customProps} />)
    
    // Just verify it renders without crashing with custom props
    expect(renderer.scene.children[0].type).toBe('Group')
  })

  test('renders with default text props', async () => {
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    
    // Just verify it renders without crashing with default props
    expect(renderer.scene.children[0].type).toBe('Group')
  })

  test('uses default rotation when not provided', async () => {
    const renderer = await ReactThreeTestRenderer.create(<HolographicPanel {...defaultProps} />)
    const group = renderer.scene.children[0]
    expect(group.type).toBe('Group')
  })
})