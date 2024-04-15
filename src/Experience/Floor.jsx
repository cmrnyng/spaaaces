import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useRef } from "react";

export const Floor = ({ points }) => {
  const textures = useTexture({
    map: "textures/diagonal_parquet_diff_4k.jpg",
  });

  const flooring = useRef();

  console.log(flooring.current);

  points = points.map(p => new THREE.Vector2(p.x, p.y));
  const shape = new THREE.Shape(points);

  return (
    <mesh rotation-x={Math.PI / 2} position-y={0}>
      <shapeGeometry args={[shape, 24]} ref={flooring} />
      <meshBasicMaterial {...textures} side={THREE.BackSide} />
    </mesh>
  );
};
