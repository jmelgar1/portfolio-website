import { render } from "@testing-library/react";
import { vi, beforeEach, describe, test, expect } from "vitest";
import { ReactNode } from "react";
import MouseCameraController from "./MouseCameraController";

// Mock camera object
const mockCamera = {
  lookAt: vi.fn(),
  rotation: { x: 0, y: 0 },
};

// Mock useThree hook
const mockUseThree = {
  camera: mockCamera,
  gl: {},
  scene: {},
  size: { width: 1920, height: 1080 },
};

interface TestWrapperProps {
  children: ReactNode;
}

interface CanvasProps {
  children: ReactNode;
}

// Mock @react-three/fiber hooks
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Canvas: ({ children }: CanvasProps) => children, // Simplified Canvas for testing
    useThree: () => mockUseThree,
  };
});

// Test wrapper component - simplified for testing
const TestWrapper = ({ children }: TestWrapperProps) => (
  <div data-testid="test-wrapper">{children}</div>
);

describe("MouseCameraController", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  test("calls camera.lookAt when lookAt prop is provided", () => {
    const lookAtPosition: [number, number, number] = [1, 2, 3];

    render(
      <TestWrapper>
        <MouseCameraController lookAt={lookAtPosition} />
      </TestWrapper>,
    );

    expect(mockCamera.lookAt).toHaveBeenCalledWith(1, 2, 3);
  });

  test("does not call camera.lookAt when lookAt prop is not provided", () => {
    render(
      <TestWrapper>
        <MouseCameraController />
      </TestWrapper>,
    );

    expect(mockCamera.lookAt).not.toHaveBeenCalled();
  });

  test("component renders without errors", () => {
    expect(() => {
      render(
        <TestWrapper>
          <MouseCameraController />
        </TestWrapper>,
      );
    }).not.toThrow();
  });

  test("component renders with lookAt prop without errors", () => {
    expect(() => {
      render(
        <TestWrapper>
          <MouseCameraController lookAt={[0, 0, 5]} />
        </TestWrapper>,
      );
    }).not.toThrow();
  });

  test("calls camera.lookAt with different coordinates", () => {
    const lookAtPosition: [number, number, number] = [5, 10, 15];

    render(
      <TestWrapper>
        <MouseCameraController lookAt={lookAtPosition} />
      </TestWrapper>,
    );

    expect(mockCamera.lookAt).toHaveBeenCalledWith(5, 10, 15);
    expect(mockCamera.lookAt).toHaveBeenCalledTimes(1);
  });

  test("calls camera.lookAt when lookAt prop changes", () => {
    const initialPosition: [number, number, number] = [1, 2, 3];
    const newPosition: [number, number, number] = [4, 5, 6];

    const { rerender } = render(
      <TestWrapper>
        <MouseCameraController lookAt={initialPosition} />
      </TestWrapper>,
    );

    expect(mockCamera.lookAt).toHaveBeenCalledWith(1, 2, 3);

    rerender(
      <TestWrapper>
        <MouseCameraController lookAt={newPosition} />
      </TestWrapper>,
    );

    expect(mockCamera.lookAt).toHaveBeenCalledWith(4, 5, 6);
    expect(mockCamera.lookAt).toHaveBeenCalledTimes(2);
  });
});
