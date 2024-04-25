import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useMemo, useState, useEffect } from "react";
import { useSelect } from "../selection.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import textureData from "../data/floorTextures.json";

export const Floor = ({ edges, id }) => {
  console.log("floor render");
  const globalTextures = useSelect.getState().textures;
  const [isReady2, setIsReady2] = useState(false);

  const loadingManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loadingManager);
  useEffect(() => {
    loadingManager.onLoad = () => {
      setIsReady2(true);
    };
  }, []);

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

  let currentTexture;
  if (globalTextures[id]) {
    currentTexture = textureData.find(tex => tex.name === globalTextures[id]);
  } else {
    currentTexture = textureData.find(tex => tex.name === "woodPattern");
  }

  const rawTextures = {
    map: textureLoader.load(currentTexture.urls.map),
    aoMap: textureLoader.load(currentTexture.urls.aoMap),
    normalMap: textureLoader.load(currentTexture.urls.normalMap),
    roughnessMap: textureLoader.load(currentTexture.urls.roughnessMap),
  };

  // const rawTextures = {
  //   map: useLoader(TextureLoader, currentTexture.urls.map),
  //   aoMap: useLoader(TextureLoader, currentTexture.urls.aoMap),
  //   normalMap: useLoader(TextureLoader, currentTexture.urls.normalMap),
  //   roughnessMap: useLoader(TextureLoader, currentTexture.urls.roughnessMap),
  // };

  const textures = {};
  for (const key in rawTextures) {
    const texture = rawTextures[key];
    const textureClone = texture.clone();
    textureClone.rotation = Math.PI / 2;
    textureClone.repeat.set(currentTexture.scale, currentTexture.scale);
    textureClone.wrapS = THREE.RepeatWrapping;
    textureClone.wrapT = THREE.RepeatWrapping;
    if (key === "map") textureClone.colorSpace = THREE.SRGBColorSpace;
    textures[key] = textureClone;
    texture.dispose();
  }

  const changeTexture = e => {
    if (e.delta > 5) return;
    useSelect.setState({ selection: { obj: e.eventObject } });
  };

  if (!isReady2) return;

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
