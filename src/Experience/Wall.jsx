import * as THREE from "three";
import * as utils from "../utils.js";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const height = 2.7;

// Try to keep rotations consistently clockwise, may solve the wall direction issue
export const Wall = ({ edge, visible }) => {
  const { interiorStart, interiorEnd, exteriorStart, exteriorEnd } = edge;

  const wallRef = useRef();

  let interiorTransform = new THREE.Matrix4();
  let invInteriorTransform = new THREE.Matrix4();
  let exteriorTransform = new THREE.Matrix4();
  let invExteriorTransform = new THREE.Matrix4();

  // Compute transforms
  const computeTransforms = (transform, invTransform, start, end) => {
    let v1 = start;
    let v2 = end;

    let angle = utils.angle(1, 0, v2.x - v1.x, v2.y - v1.y);

    let translation = new THREE.Matrix4();
    translation.makeTranslation(-v1.x, 0, -v1.y);
    let rotation = new THREE.Matrix4();
    rotation.makeRotationY(-angle);

    transform.multiplyMatrices(rotation, translation);
    invTransform.copy(transform).invert();
  };

  computeTransforms(interiorTransform, invInteriorTransform, interiorStart, interiorEnd);
  computeTransforms(exteriorTransform, invExteriorTransform, exteriorStart, exteriorEnd);

  // Creates the wall (shapeGeometry)
  const makeWall = (start, end, transform, invTransform) => {
    let v1 = new THREE.Vector3(start.x, 0, start.y);
    let v2 = new THREE.Vector3(end.x, 0, end.y);
    let v3 = new THREE.Vector3(end.x, height, end.y);
    let v4 = new THREE.Vector3(start.x, height, start.y);

    let points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

    points.forEach(p => {
      p.applyMatrix4(transform);
    });

    const shape = new THREE.Shape([
      new THREE.Vector2(points[0].x, points[0].y),
      new THREE.Vector2(points[1].x, points[1].y),
      new THREE.Vector2(points[2].x, points[2].y),
      new THREE.Vector2(points[3].x, points[3].y),
    ]);

    const geometry = new THREE.ShapeGeometry(shape);

    const pos = geometry.getAttribute("position");

    const vertex = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i);
      vertex.applyMatrix4(invTransform);
      pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    // Make UVs
    let totalDistance = utils.distance(v1.x, v1.z, v2.x, v2.z);
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2)
    );

    let uvs = geometry.getAttribute("uv");

    const vertexToUv = vertex => {
      let x = utils.distance(v1.x, v1.z, vertex.x, vertex.z) / totalDistance;
      let y = vertex.y / height;
      return new THREE.Vector2(x, y);
    };

    let uvIndex = 0;
    for (let i = 0; i < geometry.attributes.position.count; i += 3) {
      const vertA = new THREE.Vector3(
        geometry.attributes.position.getX(i),
        geometry.attributes.position.getY(i),
        geometry.attributes.position.getZ(i)
      );
      const vertB = new THREE.Vector3(
        geometry.attributes.position.getX(i + 1),
        geometry.attributes.position.getY(i + 1),
        geometry.attributes.position.getZ(i + 1)
      );
      const vertC = new THREE.Vector3(
        geometry.attributes.position.getX(i + 2),
        geometry.attributes.position.getY(i + 2),
        geometry.attributes.position.getZ(i + 2)
      );

      uvs.setXY(i, vertexToUv(vertA).x, vertexToUv(vertA).y);
      uvs.setXY(i + 1, vertexToUv(vertB).x, vertexToUv(vertB).y);
      uvs.setXY(i + 2, vertexToUv(vertC).x, vertexToUv(vertC).y);

      uvIndex += 2;
    }

    geometry.computeVertexNormals();

    return geometry;
  };

  // Create fillers
  const buildSide = (v1, v2) => {
    const points = [
      new THREE.Vector3(v1.x, 0, v1.y),
      new THREE.Vector3(v2.x, 0, v2.y),
      new THREE.Vector3(v2.x, height, v2.y),
      new THREE.Vector3(v2.x, height, v2.y),
      new THREE.Vector3(v1.x, height, v1.y),
      new THREE.Vector3(v1.x, 0, v1.y),
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    return geometry;
  };

  const buildTopBottom = (v1, v2, v3, v4) => {
    const points = [
      new THREE.Vector2(v3.x, v3.y),
      new THREE.Vector2(v4.x, v4.y),
      new THREE.Vector2(v2.x, v2.y),
      new THREE.Vector2(v1.x, v1.y),
    ];

    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);

    return geometry;
  };

  const interior = makeWall(interiorStart, interiorEnd, interiorTransform, invInteriorTransform);
  const exterior = makeWall(exteriorStart, exteriorEnd, exteriorTransform, invExteriorTransform);
  const topBottom = buildTopBottom(interiorStart, interiorEnd, exteriorStart, exteriorEnd);
  const sideLeft = buildSide(interiorStart, exteriorStart);
  const sideRight = buildSide(interiorEnd, exteriorEnd);

  // Update visibility
  const updateVisibility = camera => {
    const start = interiorStart;
    const end = interiorEnd;

    let x = end.x - start.x;
    let y = end.y - start.y;

    let normal = new THREE.Vector3(-y, 0, x);
    normal.normalize();

    let pos = new THREE.Vector3();
    camera.getWorldPosition(pos);
    let foc = new THREE.Vector3((start.x + end.x) / 2, 0, (start.y + end.y) / 2);
    let direction = pos.sub(foc).normalize();

    let dot = normal.dot(direction);

    return dot >= 0;
  };

  // useFrame(({ camera }) => {
  //   let u = new THREE.Vector3(),
  //     v = new THREE.Vector3();

  //   wallRef.current.getWorldDirection(v);
  //   camera.getWorldDirection(u);

  //   wallRef.current.visible = v.dot(u) > 0;
  // });

  useFrame(({ camera }) => {
    wallRef.current.visible = updateVisibility(camera);
  });

  // Adjust opacity of every material at the same time to make an animation - so instead of toggling visibility,
  // adjust opacity. Also, after the animation we can toggle visibility of the wall so any objects on the wall,
  // such as windows, will be invisible

  return (
    <>
      <group ref={wallRef}>
        <mesh geometry={interior}>
          <meshBasicMaterial color={"#ffffff"} />
        </mesh>
        <mesh geometry={exterior}>
          <meshBasicMaterial color={"#ffffff"} side={THREE.BackSide} />
        </mesh>
        <mesh geometry={topBottom} rotation-x={Math.PI / 2} position-y={height}>
          <meshBasicMaterial color={"#D3D3D3"} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={sideLeft}>
          <meshBasicMaterial color={"#D3D3D3"} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={sideRight}>
          <meshBasicMaterial color={"#D3D3D3"} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh geometry={topBottom} rotation-x={Math.PI / 2} position-y={0}>
        <meshBasicMaterial color={"#D3D3D3"} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};
