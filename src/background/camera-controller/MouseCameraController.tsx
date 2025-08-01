import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

const MouseCameraController = ({
  lookAt
}: {
  lookAt?: [number, number, number];
}) => {
  const { camera } = useThree();

  // Store default rotation on mount - camera stays stationary
  useEffect(() => {
    if (lookAt) {
      camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    }
  }, [camera, lookAt]);

  // This component doesn't directly control camera movement anymore
  // The galaxy itself will rotate based on mouse position
  // Keeping this component for future camera-specific controls
  return null;
};

export default MouseCameraController;
