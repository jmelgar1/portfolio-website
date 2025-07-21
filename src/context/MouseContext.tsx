import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface MouseContextType {
  mousePosition: { x: number; y: number };
  lastMouseActivity: number;
}

const MouseContext = createContext<MouseContextType | undefined>(undefined);

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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      setMousePosition({ x, y });
      setLastMouseActivity(Date.now());
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <MouseContext.Provider value={{ mousePosition, lastMouseActivity }}>
      {children}
    </MouseContext.Provider>
  );
};
