import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

const MouseCameraController = ({
  lookAt,
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

  return null;
};

export default MouseCameraController;
