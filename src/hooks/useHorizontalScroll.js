import { useState, useEffect, useRef } from 'react';

export const useHorizontalScroll = (maxScroll = 200, scrollSensitivity = 0.6) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const keysPressed = useRef(new Set());
  const keyScrollInterval = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      
      const deltaY = e.deltaY * scrollSensitivity;
      
      setScrollPosition(prev => {
        const newPosition = prev + (deltaY * 0.05);
        return Math.max(0, Math.min(newPosition, maxScroll));
      });
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
          setScrollPosition(prev => {
            const newPosition = prev + (scrollDirection * scrollSpeed);
            return Math.max(0, Math.min(newPosition, maxScroll));
          });
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
    };
  }, [maxScroll, scrollSensitivity]);

  const scrollToSection = (index) => {
    const targetPosition = index * 100;
    const startPosition = scrollPosition;
    const distance = targetPosition - startPosition;
    const duration = 800;
    const startTime = Date.now();
    
    const animateScroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const newPosition = startPosition + (distance * easeOutCubic);
      
      setScrollPosition(newPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
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