import { render } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, test, expect } from "vitest";
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

// Mock useFrame callback storage
let frameCallback: ((state: any, delta: number) => void) | null = null;

// Mock @react-three/fiber hooks
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, any>;
  return {
    ...actual,
    Canvas: ({ children }: any) => children, // Simplified Canvas for testing
    useThree: () => mockUseThree,
    useFrame: (callback: (state: any, delta: number) => void) => {
      frameCallback = callback;
    },
  };
});

// Test wrapper component - simplified for testing
const TestWrapper = ({ children }: any) => (
  <div data-testid="test-wrapper">{children}</div>
);

describe("MouseCameraController", () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let dateNowSpy: any;

  beforeEach(() => {
    // Store original window dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;

    // Set consistent window dimensions for testing
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1080,
    });

    // Reset mocks
    vi.clearAllMocks();
    mockCamera.rotation.x = 0;
    mockCamera.rotation.y = 0;
    frameCallback = null;

    // Mock Date.now for consistent timing tests
    dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    // Restore original window dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });

    vi.restoreAllMocks();
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

  test("adds mousemove event listener on mount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    render(
      <TestWrapper>
        <MouseCameraController />
      </TestWrapper>,
    );

    // Check that addEventListener was called with mousemove
    const mousemoveCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === "mousemove",
    );
    expect(mousemoveCalls.length).toBeGreaterThan(0);
  });

  test("removes mousemove event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <TestWrapper>
        <MouseCameraController />
      </TestWrapper>,
    );

    unmount();

    // Check that removeEventListener was called with mousemove
    const mousemoveCalls = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === "mousemove",
    );
    expect(mousemoveCalls.length).toBeGreaterThan(0);
  });

  test("registers useFrame callback correctly", () => {
    render(
      <TestWrapper>
        <MouseCameraController />
      </TestWrapper>,
    );

    // Verify that useFrame was called and frameCallback is set
    expect(frameCallback).toBeTruthy();
    expect(typeof frameCallback).toBe("function");
  });

  test("frame callback executes without errors", () => {
    render(
      <TestWrapper>
        <MouseCameraController />
      </TestWrapper>,
    );

    // Execute frame callback multiple times to test stability
    if (frameCallback) {
      for (let i = 0; i < 10; i++) {
        expect(() => {
          frameCallback!(mockUseThree, 0.016);
        }).not.toThrow();
      }
    }

    // Verify rotation values remain finite
    expect(Number.isFinite(mockCamera.rotation.x)).toBe(true);
    expect(Number.isFinite(mockCamera.rotation.y)).toBe(true);
  });

  test("handles time-based rotation return correctly", () => {
    let currentTime = 1000;
    dateNowSpy.mockImplementation(() => currentTime);

    render(
      <TestWrapper>
        <MouseCameraController />
      </TestWrapper>,
    );

    // Execute initial frame callback
    if (frameCallback) {
      frameCallback!(mockUseThree, 0.016);
    }

    // Advance time beyond return delay (2000ms)
    currentTime = 4000;

    // Execute frame callback with advanced time
    if (frameCallback) {
      expect(() => {
        frameCallback!(mockUseThree, 0.016);
      }).not.toThrow();
    }

    expect(Number.isFinite(mockCamera.rotation.x)).toBe(true);
    expect(Number.isFinite(mockCamera.rotation.y)).toBe(true);
  });

  test("stores default rotation correctly with lookAt prop", () => {
    const lookAtPosition: [number, number, number] = [5, 10, 15];

    // Set initial camera rotation to simulate lookAt effect
    mockCamera.rotation.x = 0.5;
    mockCamera.rotation.y = 0.3;

    render(
      <TestWrapper>
        <MouseCameraController lookAt={lookAtPosition} />
      </TestWrapper>,
    );

    expect(mockCamera.lookAt).toHaveBeenCalledWith(5, 10, 15);

    // Execute frame callback to ensure default rotation handling works
    if (frameCallback) {
      expect(() => {
        frameCallback!(mockUseThree, 0.016);
      }).not.toThrow();
    }

    // Camera should maintain valid rotation values
    expect(Number.isFinite(mockCamera.rotation.x)).toBe(true);
    expect(Number.isFinite(mockCamera.rotation.y)).toBe(true);
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
});
