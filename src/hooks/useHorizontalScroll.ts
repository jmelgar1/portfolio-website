import { useState, useEffect, useRef } from "react";

// Custom hook for smooth horizontal scrolling
export const useHorizontalScroll = (
  maxScroll: number = 200,
  scrollSensitivity: number = 0.6,
) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollData = useRef({
    current: 0,
    previous: 0,
    ease: 0.1,
    rounded: 0,
  });

  const keysPressed = useRef(new Set<string>());
  const keyScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const animateScroll = () => {
      // Apply easing: previous += (current - previous) * ease
      scrollData.current.previous +=
        (scrollData.current.current - scrollData.current.previous) *
        scrollData.current.ease;
      scrollData.current.rounded =
        Math.round(scrollData.current.previous * 100) / 100;

      // Update React state
      setScrollPosition(scrollData.current.rounded);

      // Continue animation
      animationFrame.current = requestAnimationFrame(animateScroll);
    };

    // Start the animation loop
    animationFrame.current = requestAnimationFrame(animateScroll);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const deltaY = e.deltaY * scrollSensitivity;

      // Update current scroll position with bounds checking
      scrollData.current.current = Math.max(
        0,
        Math.min(scrollData.current.current + deltaY * 0.2, maxScroll),
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)
      ) {
        return;
      }

      e.preventDefault();
      keysPressed.current.add(e.key);

      if (!keyScrollInterval.current) {
        startKeyScrolling();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);

      if (keysPressed.current.size === 0 && keyScrollInterval.current) {
        clearInterval(keyScrollInterval.current);
        keyScrollInterval.current = null;
      }
    };

    const startKeyScrolling = () => {
      const scrollSpeed = 0.8;

      keyScrollInterval.current = setInterval(() => {
        if (keysPressed.current.size === 0) {
          if (keyScrollInterval.current) {
            clearInterval(keyScrollInterval.current);
            keyScrollInterval.current = null;
          }
          return;
        }

        let scrollDirection = 0;

        if (
          keysPressed.current.has("ArrowRight") ||
          keysPressed.current.has("ArrowDown")
        ) {
          scrollDirection += 1;
        }
        if (
          keysPressed.current.has("ArrowLeft") ||
          keysPressed.current.has("ArrowUp")
        ) {
          scrollDirection -= 1;
        }

        if (scrollDirection !== 0) {
          // Update current scroll position with bounds checking
          scrollData.current.current = Math.max(
            0,
            Math.min(
              scrollData.current.current + scrollDirection * scrollSpeed,
              maxScroll,
            ),
          );
        }
      }, 16);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (keyScrollInterval.current) {
        clearInterval(keyScrollInterval.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [maxScroll, scrollSensitivity]);

  const scrollToSection = (index: number) => {
    if (keyScrollInterval.current) {
      clearInterval(keyScrollInterval.current);
      keyScrollInterval.current = null;
    }

    // Update both current and previous for instant navigation (no easing)
    const targetPosition = Math.max(0, Math.min(index * 100, maxScroll));
    scrollData.current.current = targetPosition;
    scrollData.current.previous = targetPosition;
    scrollData.current.rounded = targetPosition;
    setScrollPosition(targetPosition);
  };

  const getCurrentSection = () => Math.floor(scrollPosition / 100);
  const getSectionProgress = () => (scrollPosition % 100) / 100;

  return {
    scrollPosition,
    scrollToSection,
    getCurrentSection,
    getSectionProgress,
    maxScroll,
  };
};
