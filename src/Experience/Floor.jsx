import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { useSelect } from "../selection.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import textureData from "../data/floorTextures.json";

export const Floor = ({ edges, id }) => {
  const globalTextures = useSelect.getState().textures;
  const textureLoader = new TextureLoader();

  const floors = useMemo(() => {
    const floorPts = edges.map(edge => {
      const i = edge.interiorStart;
      return new THREE.Vector2(i.x, i.y);
    });
    const floor = new THREE.Shape(floorPts);

    const outerFloorPts = edges.map(edge => {
      const i = edge.exteriorStart;
      return new THREE.Vector2(i.x, i.y);
    });
    const outerFloor = new THREE.Shape(outerFloorPts);

    return { floor, outerFloor };
  }, []);

  const textures = useMemo(() => {
    let currentTexture;
    if (globalTextures[id]) {
      currentTexture = textureData.find(tex => tex.name === globalTextures[id]);
    } else {
      currentTexture = textureData.find(tex => tex.name === "woodPattern");
    }

    const textures = {
      map: textureLoader.load(currentTexture.urls.map),
      aoMap: textureLoader.load(currentTexture.urls.aoMap),
      normalMap: textureLoader.load(currentTexture.urls.normalMap),
      roughnessMap: textureLoader.load(currentTexture.urls.roughnessMap),
    };

    for (const key in textures) {
      const texture = textures[key];
      texture.rotation = Math.PI / 2;
      texture.repeat.set(currentTexture.scale, currentTexture.scale);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      if (key === "map") texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
    return textures;
  }, []);

  const changeTexture = e => {
    if (e.delta > 5) return;
    useSelect.setState({ selection: { obj: e.eventObject } });
  };

  return (
    <group>
      <mesh
        rotation-x={Math.PI / 2}
        position-y={0}
        userData={{ id, type: "floor" }}
        onClick={changeTexture}
      >
        <shapeGeometry args={[floors.floor]} />
        <meshStandardMaterial side={THREE.BackSide} {...textures} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={-0.001}>
        <shapeGeometry args={[floors.outerFloor]} />
        <meshStandardMaterial side={THREE.BackSide} color={"#d3d3d3"} />
      </mesh>
    </group>
  );
};
