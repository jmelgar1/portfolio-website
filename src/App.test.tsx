import { render, screen } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, test, expect } from "vitest";
import App from "./App";

// Mock the SpaceBackground component to avoid Three.js complexity
vi.mock("./background/SpaceBackground", () => ({
  default: ({ lookAt }: { lookAt?: [number, number, number] }) => (
    <div
      data-testid="space-background"
      data-look-at={lookAt ? lookAt.join(",") : undefined}
    >
      Mocked SpaceBackground
    </div>
  ),
}));

// Mock CSS import
vi.mock("./App.css", () => ({}));

describe("App", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  test("renders without crashing", () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test("renders the main App container with correct class", () => {
    render(<App />);

    const appContainer = document.querySelector(".App");
    expect(appContainer).toBeInTheDocument();
    expect(appContainer).toHaveClass("App");
  });

  test("renders SpaceBackground component", () => {
    render(<App />);

    const spaceBackground = screen.getByTestId("space-background");
    expect(spaceBackground).toBeInTheDocument();
    expect(spaceBackground).toHaveTextContent("Mocked SpaceBackground");
  });

  test("passes correct lookAt prop to SpaceBackground", () => {
    render(<App />);

    const spaceBackground = screen.getByTestId("space-background");
    expect(spaceBackground).toHaveAttribute("data-look-at", "0,1.4,0");
  });

  test("has correct component structure", () => {
    const { container } = render(<App />);

    // Verify the structure: div.App > SpaceBackground
    const appDiv = container.querySelector(".App");
    expect(appDiv).toBeInTheDocument();

    const spaceBackground = appDiv?.querySelector(
      '[data-testid="space-background"]',
    );
    expect(spaceBackground).toBeInTheDocument();
  });

  test("renders consistently on multiple renders", () => {
    const { rerender } = render(<App />);

    // First render
    let spaceBackground = screen.getByTestId("space-background");
    expect(spaceBackground).toBeInTheDocument();
    expect(spaceBackground).toHaveAttribute("data-look-at", "0,1.4,0");

    // Re-render
    rerender(<App />);

    // Should still be there with same props
    spaceBackground = screen.getByTestId("space-background");
    expect(spaceBackground).toBeInTheDocument();
    expect(spaceBackground).toHaveAttribute("data-look-at", "0,1.4,0");
  });

  test("App component is exported as default", () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe("function");
  });

  test("App component returns valid React element", () => {
    const result = App();
    expect(result).toBeDefined();
    expect(result.type).toBe("div");
    expect(result.props.className).toBe("App");
  });

  test("renders with correct accessibility structure", () => {
    render(<App />);

    const appContainer = document.querySelector(".App");
    expect(appContainer).toBeInTheDocument();

    // Check that it's a valid container element
    expect(appContainer?.tagName.toLowerCase()).toBe("div");
  });

  test("CSS class is applied correctly", () => {
    const { container } = render(<App />);

    const appElement = container.firstChild as HTMLElement;
    expect(appElement).toHaveClass("App");
    expect(appElement.className).toBe("App");
  });

  test("component mounts and unmounts cleanly", () => {
    const { unmount } = render(<App />);

    // Verify it's rendered
    expect(screen.getByTestId("space-background")).toBeInTheDocument();

    // Should unmount without errors
    expect(() => {
      unmount();
    }).not.toThrow();

    // Should be removed from DOM
    expect(screen.queryByTestId("space-background")).not.toBeInTheDocument();
  });

  test("lookAt prop value is exactly [0, 1.4, 0]", () => {
    render(<App />);

    const spaceBackground = screen.getByTestId("space-background");
    const lookAtValue = spaceBackground.getAttribute("data-look-at");
    const lookAtArray = lookAtValue?.split(",").map(Number);

    expect(lookAtArray).toEqual([0, 1.4, 0]);
    expect(lookAtArray?.[0]).toBe(0);
    expect(lookAtArray?.[1]).toBe(1.4);
    expect(lookAtArray?.[2]).toBe(0);
  });

  test("App component has minimal complexity", () => {
    // This test ensures the App component remains simple
    const appString = App.toString();

    // Should contain basic structure (checking for transformed code)
    expect(appString).toContain("App");
    expect(appString).toContain("1.4"); // lookAt value
    expect(appString).toContain("className");

    // Should not contain complex logic
    expect(appString).not.toContain("useState");
    expect(appString).not.toContain("useEffect");
    expect(appString).not.toContain("useCallback");
    expect(appString).not.toContain("useContext");
  });

  test("renders correctly in different environments", () => {
    // Test that component works in test environment
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost:3000" },
      writable: true,
    });

    expect(() => {
      render(<App />);
    }).not.toThrow();

    expect(screen.getByTestId("space-background")).toBeInTheDocument();
  });
});
