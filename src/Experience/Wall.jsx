import * as THREE from "three";
import { useRef, useLayoutEffect } from "react";
import { useTexture } from "@react-three/drei";

export const Wall = ({ wall }) => {
  const textures = useTexture({
    map: "textures/large_red_bricks_diff_4k.jpg",
  });
  const top = 1.35;
  const bottom = -1.35;

  const geometryRef = useRef();

  const wallPts = [
    new THREE.Vector3(wall.end.x, top, wall.end.y),
    new THREE.Vector3(wall.start.x, top, wall.start.y),
    new THREE.Vector3(wall.end.x, bottom, wall.end.y),
    new THREE.Vector3(wall.start.x, bottom, wall.start.y),
  ];

  useLayoutEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setFromPoints(wallPts);
    }
  }, []);

  // console.log(geometryRef.current);

  return (
    <mesh>
      <planeGeometry attach="geometry" ref={geometryRef} />
      <meshBasicMaterial {...textures} />
    </mesh>
  );
};
