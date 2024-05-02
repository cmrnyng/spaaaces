import { Icosahedron } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useStore } from "../store";

export const Placeholder = ({ position }) => {
  const placeholder = useRef();
  useFrame((_state, dt) => {
    placeholder.current.rotation.y += dt;
  });

  return (
    <Icosahedron ref={placeholder} scale={0.3} position={position}>
      <meshStandardMaterial color={"#a7ddac"} wireframe />
    </Icosahedron>
  );
};
