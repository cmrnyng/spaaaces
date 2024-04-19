import * as THREE from "three";
import * as utils from "../utils.js";
import { useEffect, useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Edges, Html } from "@react-three/drei";
import { useSelect } from "../selection.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import textureData from "../data/wallTextures.json";

const height = 2.7;

export const Wall = ({ edge, orphan, colour }) => {
  console.log("wall render");
  const { interiorStart, interiorEnd, exteriorStart, exteriorEnd, id } = edge;
  const wallRef = useRef();

  const [vis, setVis] = useState(true);
  const [menu, setMenu] = useState(false);

  const geom = useMemo(() => {
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

    const computeUVs = (geometry, v1x, v1y, v2x, v2y) => {
      let totalDistance = utils.distance(v1x, v1y, v2x, v2y);
      geometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2)
      );

      let uvs = geometry.getAttribute("uv");

      const vertexToUv = vertex => {
        let x = utils.distance(v1x, v1y, vertex.x, vertex.z) / totalDistance;
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

      let geometry = new THREE.ShapeGeometry(shape);

      const pos = geometry.getAttribute("position");

      const vertex = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        vertex.fromBufferAttribute(pos, i);
        vertex.applyMatrix4(invTransform);
        pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      // Compute UVs + normals
      computeUVs(geometry, v1.x, v1.z, v2.x, v2.z);
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

      // Compute UVs + normals
      computeUVs(geometry, v1.x, v1.y, v2.x, v2.y);
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

      // Compute UVs + normals
      computeUVs(geometry, v1.x, v1.y, v2.x, v2.y);
      return geometry;
    };

    const geometries = [];
    geometries.push(
      makeWall(interiorStart, interiorEnd, interiorTransform, invInteriorTransform),
      makeWall(exteriorStart, exteriorEnd, exteriorTransform, invExteriorTransform),
      buildTop(interiorEnd, interiorStart, exteriorEnd, exteriorStart),
      buildSide(exteriorStart, interiorStart),
      buildSide(interiorEnd, exteriorEnd)
    );

    // Creating groups
    const nonIndexedGeometries = geometries.map(geometry => geometry.toNonIndexed());
    const geom = BufferGeometryUtils.mergeGeometries(nonIndexedGeometries);
    geom.clearGroups();
    geom.addGroup(0, 6, 0);
    geom.addGroup(6, 6, 1);
    geom.addGroup(12, 6, 2);
    geom.addGroup(18, 6, 3);
    geom.addGroup(24, 6, 4);

    geom.computeBoundingSphere();
    return geom;
  }, []);

  const urls = {
    map: "textures/Wood_Wall_003_SD/Wood_Wall_003_basecolor.jpg",
    aoMap: "textures/Wood_Wall_003_SD/Wood_Wall_003_ambientOcclusion.jpg",
    normalMap: "textures/Wood_Wall_003_SD/Wood_Wall_003_normal.jpg",
    roughnessMap: "textures/Wood_Wall_003_SD/Wood_Wall_003_roughness.jpg",
  };

  const urls2 = {
    map: "textures/Beige/map.jpg",
    aoMap: "textures/Beige/ao.jpg",
    normalMap: "textures/Beige/normal.jpg",
    roughnessMap: "textures/Beige/roughness.jpg",
  };

  const textures = useTexture(urls);

  // We will have a store for textures, which will essentially be an array of objects or an object with {id: texture}, and each time
  // this component is rendered, it will use the id to find the texture corresponding to that id. This store will be updated when the
  // user changes the texture, and we will have a default texture for each wall.
  const materials = useMemo(() => {
    // Textures
    const length = utils.distance(interiorStart.x, interiorStart.y, interiorEnd.x, interiorEnd.y);
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

    // Materials
    const texturedMaterial = new THREE.MeshStandardMaterial({
      ...finalTextures,
      side: THREE.DoubleSide,
    });
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: "#d3d3d3",
    });
    return [
      texturedMaterial,
      orphan ? texturedMaterial : sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
    ];
  }, []);

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

  // Adjust opacity of every material at the same time to make an animation - so instead of toggling visibility,
  // adjust opacity. Also, after the animation we can toggle visibility of the wall so any objects on the wall,
  // such as windows, will be invisible

  useFrame(({ camera }) => {
    wallRef.current.visible = updateVisibility(camera);
    // setVis(updateVisibility(camera));
  });

  // Make it so that if this is the wall set as the selection, and the result of updateVisibility(camera) is false, clear the selection
  // by setting selection to null

  const eventHandler = e => {
    // setMenu(!menu);
    useSelect.setState({ selection: { el: e.eventObject, type: "wall" } });
  };

  // useEffect(() => {
  //   console.log(wallRef);
  // }, []);

  return (
    <>
      <mesh
        geometry={geom}
        material={materials}
        userData={{ id, type: "wall" }}
        ref={wallRef}
        onClick={eventHandler}
      />
      {menu && <Html position={geom.boundingSphere.center}>Test</Html>}
    </>
  );
};
