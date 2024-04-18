import * as THREE from "three";
import * as utils from "../utils.js";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Edges } from "@react-three/drei";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

const height = 2.7;

// Try to keep rotations consistently clockwise, may solve the wall direction issue
export const Wall = ({ edge, orphan, colour }) => {
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

    // Colour
    const colour = new THREE.Color(0xd3d3d3);
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
    );
    let colourAttr = geometry.getAttribute("color");

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colourAttr.setXYZ(i, colour.r, colour.g, colour.b);
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

    // Colour
    const colour = new THREE.Color(0xd3d3d3);
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
    );
    let colourAttr = geometry.getAttribute("color");

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colourAttr.setXYZ(i, colour.r, colour.g, colour.b);
    }

    // Make UVs
    let totalDistance = utils.distance(v1.x, v1.y, v2.x, v2.y);
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

  const buildTop = (v1, v2, v3, v4) => {
    const points = [
      new THREE.Vector3(v1.x, height, v1.y),
      new THREE.Vector3(v3.x, height, v3.y),
      new THREE.Vector3(v4.x, height, v4.y),
      new THREE.Vector3(v4.x, height, v4.y),
      new THREE.Vector3(v2.x, height, v2.y),
      new THREE.Vector3(v1.x, height, v1.y),
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    // Colour
    const colour = new THREE.Color(0xd3d3d3);
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
    );
    let colourAttr = geometry.getAttribute("color");

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colourAttr.setXYZ(i, colour.r, colour.g, colour.b);
    }

    // Make UVs
    let totalDistance = utils.distance(v1.x, v1.y, v2.x, v2.y);
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

  const buildBottom = (v1, v2, v3, v4) => {
    const points = [
      new THREE.Vector3(v1.x, 0, v1.y),
      new THREE.Vector3(v3.x, 0, v3.y),
      new THREE.Vector3(v4.x, 0, v4.y),
      new THREE.Vector3(v4.x, 0, v4.y),
      new THREE.Vector3(v2.x, 0, v2.y),
      new THREE.Vector3(v1.x, 0, v1.y),
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    // Make UVs
    let totalDistance = utils.distance(v1.x, v1.y, v2.x, v2.y);
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

  const geometries = [];
  geometries.push(
    makeWall(interiorStart, interiorEnd, interiorTransform, invInteriorTransform),
    makeWall(exteriorStart, exteriorEnd, exteriorTransform, invExteriorTransform),
    // buildTopBottom(interiorStart, interiorEnd, exteriorStart, exteriorEnd),
    buildTop(interiorStart, interiorEnd, exteriorStart, exteriorEnd),
    buildSide(interiorStart, exteriorStart),
    buildSide(interiorEnd, exteriorEnd)
  );

  const nonIndexedGeometries = geometries.map(geometry => {
    // Convert indexed geometry to non-indexed geometry
    return geometry.toNonIndexed();
  });

  const geom = BufferGeometryUtils.mergeGeometries(nonIndexedGeometries);

  // const interior = makeWall(interiorStart, interiorEnd, interiorTransform, invInteriorTransform);
  // const exterior = makeWall(exteriorStart, exteriorEnd, exteriorTransform, invExteriorTransform);
  // const topBottom = buildTopBottom(interiorStart, interiorEnd, exteriorStart, exteriorEnd);
  // const sideLeft = buildSide(interiorStart, exteriorStart);
  // const sideRight = buildSide(interiorEnd, exteriorEnd);

  // Textures
  const length = utils.distance(interiorStart.x, interiorStart.y, interiorEnd.x, interiorEnd.y);
  // const textures = useTexture({
  //   map: "textures/Wallpaper001A_2K-JPG/Wallpaper001A_2K-JPG_Color.jpg",
  //   // aoMap: "textures/Wallpaper001A_2K-JPG/",
  //   // displacementMap: "textures/Wallpaper001A_2K-JPG/Wall_Interior_001_height.png",
  //   normalMap: "textures/Wallpaper001A_2K-JPG/Wallpaper001A_2K-JPG_NormalGL.jpg",
  //   roughnessMap: "textures/Wallpaper001A_2K-JPG/Wallpaper001A_2K-JPG_Roughness.jpg",
  // });

  const textures = useTexture({
    map: "textures/Wall_Interior_001_SD/Wall_Interior_001_basecolor.jpg",
  });

  const cloneTextures = textures => {
    const clonedTextures = {};
    // Iterate over each texture in the textures object
    for (const key in textures) {
      const texture = textures[key];
      const textureClone = texture.clone();
      textureClone.repeat.x = length / height;
      textureClone.wrapS = THREE.RepeatWrapping;
      clonedTextures[key] = textureClone;
    }
    return clonedTextures;
  };

  const finalTextures = cloneTextures(textures);

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

    if (orphan) return Math.abs(dot) > 0.01;
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

  const standardMaterial = new THREE.MeshStandardMaterial({
    map: finalTextures.map,
    side: THREE.DoubleSide,
    transparent: false,
  });

  const basicMaterial = new THREE.MeshStandardMaterial({
    color: "red",
    side: THREE.DoubleSide,
    transparent: false,
  });

  // const materials = [standardMaterial, basicMaterial, basicMaterial, basicMaterial, basicMaterial];

  // Adjust opacity of every material at the same time to make an animation - so instead of toggling visibility,
  // adjust opacity. Also, after the animation we can toggle visibility of the wall so any objects on the wall,
  // such as windows, will be invisible

  return (
    <>
      {/* <group ref={wallRef}> */}
      <mesh geometry={geom} ref={wallRef}>
        {/* {materials.map((mat, i) => (
          <meshStandardMaterial key={i} attachArray="material" {...mat} side={THREE.DoubleSide} />
        ))} */}
        <meshStandardMaterial {...finalTextures} side={THREE.DoubleSide} />
      </mesh>
      {/* <mesh geometry={exterior}>
          <meshStandardMaterial color={"#ffffff"} side={THREE.BackSide} />
        </mesh>
        <mesh geometry={topBottom} rotation-x={Math.PI / 2} position-y={height}>
          <meshStandardMaterial color={"#D3D3D3"} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={sideLeft}>
          <meshBasicMaterial color={"#bfbfbf"} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={sideRight}>
          <meshBasicMaterial color={"#bfbfbf"} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh geometry={topBottom} rotation-x={Math.PI / 2} position-y={0}>
        <meshStandardMaterial color={"#D3D3D3"} side={THREE.DoubleSide} />
      </mesh> */}
    </>
  );
};
