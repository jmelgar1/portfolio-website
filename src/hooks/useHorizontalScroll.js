import { useState, useEffect, useRef } from 'react';

export const useHorizontalScroll = (maxScroll = 200, scrollSensitivity = 0.6) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const targetScrollPosition = useRef(0);
  const animationFrame = useRef(null);

  const keysPressed = useRef(new Set());
  const keyScrollInterval = useRef(null);

  const startAnimation = useRef(() => {});

  useEffect(() => {
    targetScrollPosition.current = 0;

    const animateScroll = () => {
      setScrollPosition(currentPosition => {
        const target = targetScrollPosition.current;
        const diff = target - currentPosition;

        if (Math.abs(diff) < 0.1) {
          if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
          }
          return target;
        }

        const newPosition = currentPosition + diff * 0.1;
        animationFrame.current = requestAnimationFrame(animateScroll);
        return newPosition;
      });
    };

    startAnimation.current = () => {
      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(animateScroll);
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      
      const deltaY = e.deltaY * scrollSensitivity;
      
      targetScrollPosition.current = Math.max(0, Math.min(targetScrollPosition.current + (deltaY * 0.2), maxScroll));
      startAnimation.current();
    };

    const handleKeyDown = (e) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
        return;
      }
      
      e.preventDefault();
      keysPressed.current.add(e.key);
      
      if (!keyScrollInterval.current) {
        startKeyScrolling();
      }
    };

    const handleKeyUp = (e) => {
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
          clearInterval(keyScrollInterval.current);
          keyScrollInterval.current = null;
          return;
        }
        
        let scrollDirection = 0;
        
        if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('ArrowDown')) {
          scrollDirection += 1;
        }
        if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('ArrowUp')) {
          scrollDirection -= 1;
        }
        
        if (scrollDirection !== 0) {
          targetScrollPosition.current = Math.max(0, Math.min(targetScrollPosition.current + (scrollDirection * scrollSpeed), maxScroll));
          startAnimation.current();
        }
      }, 16);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (keyScrollInterval.current) {
        clearInterval(keyScrollInterval.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [maxScroll, scrollSensitivity]);

  const scrollToSection = (index) => {
    if (keyScrollInterval.current) {
      clearInterval(keyScrollInterval.current);
      keyScrollInterval.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    
    targetScrollPosition.current = Math.max(0, Math.min(index * 100, maxScroll));
    startAnimation.current();
  };

  const getCurrentSection = () => Math.floor(scrollPosition / 100);
  const getSectionProgress = () => (scrollPosition % 100) / 100;

  return {
    scrollPosition,
    scrollToSection,
    getCurrentSection,
    getSectionProgress,
    maxScroll
  };
}; 