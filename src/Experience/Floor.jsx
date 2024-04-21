import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export const Floor = ({ edges, id }) => {
  // Floor
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

  // Textures
  const textures = useTexture({
    map: "textures/WoodFloor023_2K-JPG/WoodFloor023_2K-JPG_Color.jpg",
    aoMap: "textures/WoodFloor023_2K-JPG/WoodFloor023_2K-JPG_AmbientOcclusion.jpg",
    normalMap: "textures/WoodFloor023_2K-JPG/WoodFloor023_2K-JPG_NormalGL.jpg",
    roughnessMap: "textures/WoodFloor023_2K-JPG/WoodFloor023_2K-JPG_Roughness.jpg",
  });

  const cloneTextures = textures => {
    const clonedTextures = {};
    for (const key in textures) {
      const texture = textures[key];
      const textureClone = texture.clone();
      textureClone.rotation = Math.PI / 2;
      textureClone.repeat.set(0.3, 0.3); // 0.3 by default, or if texture has a scale, use that
      textureClone.wrapS = THREE.RepeatWrapping;
      textureClone.wrapT = THREE.RepeatWrapping;
      clonedTextures[key] = textureClone;
    }
    return clonedTextures;
  };

  const finalTextures = cloneTextures(textures);

  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position-y={0} userData={id}>
        <shapeGeometry args={[floor]} />
        <meshStandardMaterial side={THREE.BackSide} {...finalTextures} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={-0.001}>
        <shapeGeometry args={[outerFloor]} />
        <meshStandardMaterial side={THREE.BackSide} color={"#d3d3d3"} />
      </mesh>
    </group>
  );
};
