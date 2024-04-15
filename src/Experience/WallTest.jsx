import * as THREE from "three";
import * as utils from "../utils.js";

const height = 2.7;

export const WallTest = () => {
  // Example
  // In 2D, (0, 0) -> (5, 5)
  // Angle = Math.PI / 4 radians
  // Length = 5 * Math.sqrt(2)

  let length = Math.sqrt((5 - 0) ** 2 + (5 - 0) ** 2);

  let points = [
    { x: 0, y: 0 },
    { x: length, y: 0 },
    { x: length, y: height },
    { x: 0, y: height },
  ];
  points = points.map(p => new THREE.Vector2(p.x, p.y));

  let forward2D = new THREE.Vector3(5 - 0, 0, 5 - 0).normalize(); // x2 - x1, y2 - y1

  let quaternion = new THREE.Quaternion().setFromUnitVectors(forward2D, new THREE.Vector3(0, 0, 1));

  // const quaternion = new THREE.Quaternion().setFromAxisAngle(
  //   new THREE.Vector3(0, 1, 0),
  //   Math.PI / 4
  // );

  const shape = new THREE.Shape(points);

  return (
    <mesh quaternion={quaternion}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};
