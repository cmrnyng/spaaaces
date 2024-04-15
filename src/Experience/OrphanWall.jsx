import * as THREE from "three";
import { useRef, useLayoutEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as utils from "../utils.js";

const height = 2.7;

export const OrphanWall = ({ wall }) => {
  const length = utils.distance(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.lineTo(0, height);

  const direction = new THREE.Vector3(
    wall.end.x - wall.start.x,
    0,
    wall.end.y - wall.start.y
  ).normalize();

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    direction,
    new THREE.Vector3(1, 0, 0)
  );

  return (
    <mesh quaternion={quaternion} position={[wall.start.x, 0, wall.start.y]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};

// export const Wall = ({ wall }) => {
//   const textures = useTexture({
//     map: "textures/large_red_bricks_diff_4k.jpg",
//   });
//   const top = 2.7;
//   const bottom = 0;

//   const geometryRef = useRef();

//   const wallPts = [
//     new THREE.Vector3(wall.end.x, top, wall.end.y),
//     new THREE.Vector3(wall.start.x, top, wall.start.y),
//     new THREE.Vector3(wall.end.x, bottom, wall.end.y),
//     new THREE.Vector3(wall.start.x, bottom, wall.start.y),
//   ];

//   useLayoutEffect(() => {
//     if (geometryRef.current) {
//       geometryRef.current.setFromPoints(wallPts);
//     }
//   }, []);

//   // console.log(geometryRef.current);

//   return (
//     <mesh>
//       <planeGeometry attach="geometry" ref={geometryRef} />
//       <meshBasicMaterial {...textures} />
//     </mesh>
//   );
// };

// export const Wall = ({ wall }) => {
//   let interiorTransform = new THREE.Matrix4();
//   let invInteriorTransform = new THREE.Matrix4();
//   let exteriorTransform = new THREE.Matrix4();
//   let invEteriorTransform = new THREE.Matrix4();

//   let v1 = new THREE.Vector3(wall.start.x, 0, wall.start.y);
//   let v2 = new THREE.Vector3(wall.end.x, 0, wall.end.y);
//   let v3 = v2.clone();
//   v3.y = height;
//   let v4 = v1.clone();
//   v4.y = height;

//   let points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

//   points = points.map(p => p.applyMatrix4(transform));
// };

// const computeTransforms = (transform, invTransform, start, end) => {
//   let v1 = start;
//   let v2 = end;

//   let angle = utils.angle();
// };
