import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";

interface MouseContextType {
  mousePosition: { x: number; y: number };
  lastMouseActivity: number;
  mouseVelocity: number;
  isMouseMoving: boolean;
}

const MouseContext = createContext<MouseContextType | undefined>(undefined);

// Export the context for direct use
export { MouseContext };

export const useMousePosition = () => {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error("useMousePosition must be used within a MouseProvider");
  }
  return context;
};

interface MouseProviderProps {
  children: ReactNode;
}

export const MouseProvider: React.FC<MouseProviderProps> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lastMouseActivity, setLastMouseActivity] = useState(Date.now());
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  
  const previousPosition = useRef({ x: 0, y: 0 });
  const previousTime = useRef(Date.now());
  const velocityHistory = useRef<number[]>([]);
  const movementTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const currentTime = Date.now();
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Calculate velocity based on distance moved over time
      const deltaX = x - previousPosition.current.x;
      const deltaY = y - previousPosition.current.y;
      const deltaTime = currentTime - previousTime.current;
      
      // Calculate instantaneous velocity (distance per ms)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const instantVelocity = deltaTime > 0 ? (distance * 1000) / deltaTime : 0;
      
      // Smooth velocity with rolling average (last 5 samples)
      velocityHistory.current.push(instantVelocity);
      if (velocityHistory.current.length > 5) {
        velocityHistory.current.shift();
      }
      
      const smoothedVelocity = velocityHistory.current.reduce((sum, v) => sum + v, 0) / velocityHistory.current.length;
      
      setMousePosition({ x, y });
      setMouseVelocity(smoothedVelocity);
      setLastMouseActivity(currentTime);
      setIsMouseMoving(true);
      
      // Clear existing timeout
      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }
      
      // Set new timeout to detect when movement stops
      movementTimeout.current = setTimeout(() => {
        setIsMouseMoving(false);
        setMouseVelocity(0);
      }, 300); // Consider stopped after 300ms of no movement for smoother pausing
      
      previousPosition.current = { x, y };
      previousTime.current = currentTime;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }
    };
  }, []);

  return (
    <MouseContext.Provider value={{ mousePosition, lastMouseActivity, mouseVelocity, isMouseMoving }}>
      {children}
    </MouseContext.Provider>
  );
};
