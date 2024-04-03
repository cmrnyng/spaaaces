import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function DesignView() {
  console.log("designview render");
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 2000,
        position: [-3, 1.5, 4],
      }}
      dpr={[1, 2]}
    >
      <OrbitControls />

      <mesh>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </Canvas>
  );
}
