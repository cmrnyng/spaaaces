import { Canvas } from "@react-three/fiber";
import { MapControls, Grid } from "@react-three/drei";

export default function FloorplanView() {
  return (
    <Canvas orthographic camera={{ near: 0.1, far: 200, zoom: 100, position: [0, 2, 0] }}>
      <MapControls enableZoom={false} />
      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
        cellSize={0.25}
        cellThickness={1}
        sectionSize={0}
      />

      <mesh rotation-x={-Math.PI / 2} position-y={0.0001}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial color="grey" />
      </mesh>
    </Canvas>
  );
}
