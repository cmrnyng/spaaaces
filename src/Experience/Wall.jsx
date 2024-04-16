import * as THREE from "three";
import * as utils from "../utils.js";

const pi = Math.PI;
const height = 2.7;

const thickness = 0.1;
// Try to keep rotations consistently clockwise, may solve the wall direction issue
export const Wall = ({ wall }) => {
  const { start, end } = wall;
  let interiorTransform = new THREE.Matrix4();
  let invInteriorTransform = new THREE.Matrix4();
  let exteriorTransform = new THREE.Matrix4();
  let invExteriorTransform = new THREE.Matrix4();

  const thetaStart = (2 * pi - start.angle) / 2 - pi / 2;
  const startSideLength = thickness / Math.cos(thetaStart);
  const interiorStart = {
    x: start.x - (startSideLength / 2) * Math.sin(thetaStart),
    y: start.y + (startSideLength / 2) * Math.cos(thetaStart),
  };
  const exteriorStart = {
    x: start.x - (startSideLength / 2) * Math.sin(thetaStart),
    y: start.y - (startSideLength / 2) * Math.cos(thetaStart),
  };

  const thetaEnd = (2 * pi - end.angle) / 2 - pi / 2;
  const endSideLength = thickness / Math.cos(thetaEnd);
  const interiorEnd = {
    x: end.x + (startSideLength / 2) * Math.sin(thetaEnd),
    y: end.y + (startSideLength / 2) * Math.cos(thetaEnd),
  };
  const exteriorEnd = {
    x: end.x + (startSideLength / 2) * Math.sin(thetaEnd),
    y: end.y - (startSideLength / 2) * Math.cos(thetaEnd),
  };

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

  const makeWall = (start, end, transform, invTransform) => {
    let v1 = new THREE.Vector3(start.x, 0, start.y);
    let v2 = new THREE.Vector3(end.x, 0, end.y);
    let v3 = new THREE.Vector3(end.x, height, end.y);
    let v4 = new THREE.Vector3(start.x, height, start.y);

    let points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

    points.forEach(p => {
      p.applyMatrix4(transform);
    });

    let shape = new THREE.Shape([
      new THREE.Vector2(points[0].x, points[0].y),
      new THREE.Vector2(points[1].x, points[1].y),
      new THREE.Vector2(points[2].x, points[2].y),
      new THREE.Vector2(points[3].x, points[3].y),
    ]);

    let geometry = new THREE.ShapeGeometry(shape);

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

  const interior = makeWall(interiorStart, interiorEnd, interiorTransform, invInteriorTransform);

  return (
    <>
      <mesh geometry={interior}>
        <meshBasicMaterial color={"mediumpurple"} />
      </mesh>
    </>
  );
};
