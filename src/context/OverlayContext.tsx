import React, { createContext, useContext, useState, useCallback } from "react";

interface OverlayState {
  isOverlayOpen: boolean;
  isTransitioning: boolean;
  transitionPhase: 'idle' | 'expanding' | 'fading' | 'showing';
  isInitialOpen: boolean;
}

interface OverlayContextType {
  overlayState: OverlayState;
  openOverlay: () => void;
  closeOverlay: () => void;
  setTransitionPhase: (phase: OverlayState['transitionPhase']) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [overlayState, setOverlayState] = useState<OverlayState>({
    isOverlayOpen: false,
    isTransitioning: false,
    transitionPhase: 'idle',
    isInitialOpen: true
  });

  const openOverlay = useCallback(() => {
    setOverlayState(prev => ({
      isOverlayOpen: true,
      isTransitioning: true,
      transitionPhase: 'expanding',
      isInitialOpen: !prev.isOverlayOpen
    }));
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlayState({
      isOverlayOpen: false,
      isTransitioning: false,
      transitionPhase: 'idle',
      isInitialOpen: true
    });
  }, []);

  const setTransitionPhase = useCallback((phase: OverlayState['transitionPhase']) => {
    setOverlayState(prev => ({
      ...prev,
      transitionPhase: phase,
      isTransitioning: phase !== 'idle' && phase !== 'showing',
      isInitialOpen: phase === 'showing' ? false : prev.isInitialOpen
    }));
  }, []);

  return (
    <OverlayContext.Provider value={{
      overlayState,
      openOverlay,
      closeOverlay,
      setTransitionPhase
    }}>
      {children}
    </OverlayContext.Provider>
  );
};