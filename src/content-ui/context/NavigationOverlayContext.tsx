import React, { createContext, useContext, useState, useCallback } from "react";

interface PreservedGalaxyState {
  scale: number;
  opacity: number;
  position: [number, number, number];
  rotation: [number, number, number];
  mousePosition: { x: number; y: number };
  // Galaxy-specific state
  currentGalaxyState: {
    type: 'spiral' | 'elliptical' | 'irregular';
    seed: number;
  };
  transformationProgress: number;
  transformationTarget: {
    type: 'spiral' | 'elliptical' | 'irregular';
    seed: number;
  };
  expansionProgress: number;
  // Complete galaxy snapshot - exact positions and colors at moment of preservation
  galaxySnapshot: {
    // Main galaxy particles - exact positions and colors from buffer attributes
    mainGalaxy: {
      positions: number[]; // Float32Array as regular array for serialization
      colors: number[];    // Float32Array as regular array for serialization
    };
    // Central core particles - exact positions and colors
    centralCore: {
      positions: number[];
      colors: number[];
      starCount: number;
    };
    // Current transformation state for interpolation
    currentGalaxyData: {
      positions: number[];
      colors: number[];
    } | null;
    targetGalaxyData: {
      positions: number[];
      colors: number[];
    } | null;
  };
}

interface OverlayState {
  isOverlayOpen: boolean;
  isTransitioning: boolean;
  transitionPhase: 'idle' | 'expanding' | 'fading' | 'showing';
  isInitialOpen: boolean;
  preservedGalaxyState?: PreservedGalaxyState;
}

interface OverlayContextType {
  overlayState: OverlayState;
  openOverlay: () => void;
  closeOverlay: () => void;
  setTransitionPhase: (phase: OverlayState['transitionPhase']) => void;
  preserveGalaxyState: (state: PreservedGalaxyState) => void;
  clearPreservedState: () => void;
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
    isInitialOpen: true,
    preservedGalaxyState: undefined
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
    setOverlayState(prev => ({
      isOverlayOpen: false,
      isTransitioning: prev.transitionPhase !== 'idle', // Only transitioning if not already idle
      transitionPhase: 'idle',
      isInitialOpen: true,
      preservedGalaxyState: prev.preservedGalaxyState // Keep preserved state for potential reopening
    }));
  }, []);

  const setTransitionPhase = useCallback((phase: OverlayState['transitionPhase']) => {
    setOverlayState(prev => ({
      ...prev,
      transitionPhase: phase,
      isTransitioning: phase !== 'idle' && phase !== 'showing',
      isInitialOpen: phase === 'showing' ? false : prev.isInitialOpen
    }));
  }, []);

  const preserveGalaxyState = useCallback((state: PreservedGalaxyState) => {
    setOverlayState(prev => ({
      ...prev,
      preservedGalaxyState: state
    }));
  }, []);

  const clearPreservedState = useCallback(() => {
    setOverlayState(prev => ({
      ...prev,
      preservedGalaxyState: undefined
    }));
  }, []);

  return (
    <OverlayContext.Provider value={{
      overlayState,
      openOverlay,
      closeOverlay,
      setTransitionPhase,
      preserveGalaxyState,
      clearPreservedState
    }}>
      {children}
    </OverlayContext.Provider>
  );
};