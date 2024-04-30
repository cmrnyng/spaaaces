import { useGLTF } from "@react-three/drei";

export const FloorItem = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};
