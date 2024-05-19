import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useSelect } from "../selection";
import { useRef, useEffect } from "react";
import wallTex from "../data/wallTextures.json";
import floorTex from "../data/floorTextures.json";
import binIcon from "../assets/binIcon1.svg";
import { useThree } from "@react-three/fiber";
import { FurniturePopup } from "./FurniturePopup.jsx";
import * as THREE from "three";

export const PopupMenu = () => {
  console.log("popupmenu render");
  const sel = useSelect(state => state.selection);
  const setTextures = useSelect(state => state.setTextures);
  const globalTextures = useSelect.getState().textures;
  const prevSel = useRef(null);
  const popup = useRef();
  const htmlRef = useRef();

  const mouseDown = useRef(false);
  const mouseMoved = useRef(false);
  const startX = useRef();
  const scrollLeft = useRef();

  const { controls } = useThree();

  // useEffect(() => {
  //   if (!sel) return;
  //   if (sel.obj.userData.type === "furniture" && htmlRef.current) {
  //     console.log(htmlRef.current);
  //     sel.obj.add(htmlRef.current);
  //   }
  // }, [sel]);

  let pos;
  let textures;

  if (!sel) return (prevSel.current = null);
  const { obj } = sel;
  if (obj == prevSel.current?.obj) return (prevSel.current = null);
  if (obj.userData.type === "wall") {
    pos = obj.geometry.boundingSphere.center;
    textures = wallTex;
  } else if (obj.userData.type === "floor") {
    pos = new THREE.Vector3(
      obj.geometry.boundingSphere.center.x,
      -0.5,
      obj.geometry.boundingSphere.center.y
    );
    textures = floorTex;
  }
  prevSel.current = sel;

  const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
      updateTexture();
    }
  );
  const textureLoader = new THREE.TextureLoader(loadingManager);

  let combinedTextures;
  let textureName;
  let newTextureObj;

  const handleScroll = e => {
    e.preventDefault();
    e.stopPropagation();

    var container = popup.current;
    var containerScrollPosition = popup.current.scrollLeft;
    container.scrollTo({
      top: 0,
      left: containerScrollPosition + (e.deltaX || e.deltaY) * 0.3,
      behaviour: "smooth",
    });
  };

  const handleEnter = e => {
    // e.preventDefault();
    // e.stopPropagation();
    popup.current.addEventListener("wheel", handleScroll);
    controls.enabled = false;
    // popup.current.focus();
  };

  const handleLeave = e => {
    popup.current.removeEventListener("wheel", handleScroll);
    mouseDown.current = false;
    controls.enabled = true;
  };

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    popup.current.removeEventListener("wheel", handleScroll);
    // controls.enabled = true;
  };

  const handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();

    mouseDown.current = true;
    mouseMoved.current = false;
    startX.current = e.pageX - popup.current.offsetLeft;
    scrollLeft.current = popup.current.scrollLeft;
  };

  const changeTexture = e => {
    e.preventDefault();
    e.stopPropagation();
    mouseDown.current = false;

    if (mouseMoved.current) return;
    textureName = e.target.getAttribute("texture");
    newTextureObj = textures.find(tex => tex.name === textureName);
    if (!newTextureObj) return;
    const { map, aoMap, normalMap, roughnessMap } = newTextureObj.urls;
    const mapTex = textureLoader.load(map);
    mapTex.colorSpace = THREE.SRGBColorSpace;
    const aoMapTex = textureLoader.load(aoMap);
    const normalMapTex = textureLoader.load(normalMap);
    const roughnessMapTex = textureLoader.load(roughnessMap);

    combinedTextures = {
      map: mapTex,
      aoMap: aoMapTex,
      normalMap: normalMapTex,
      roughnessMap: roughnessMapTex,
    };
  };

  const updateTexture = () => {
    if (obj.userData.type === "wall") {
      for (const key in combinedTextures) {
        const texture = combinedTextures[key];
        texture.repeat.x = sel.len / sel.height;
        texture.wrapS = THREE.RepeatWrapping;
      }
      obj.material[0].map.dispose();
      obj.material[0].aoMap.dispose();
      obj.material[0].normalMap.dispose();
      obj.material[0].roughnessMap.dispose();
      Object.assign(obj.material[0], combinedTextures);

      setTextures(obj.userData.id, {
        [obj.userData.side === "front" ? "front" : "back"]: textureName,
      });
    } else if (obj.userData.type === "floor") {
      for (const key in combinedTextures) {
        const texture = combinedTextures[key];
        texture.rotation = Math.PI / 2;
        texture.repeat.set(newTextureObj.scale, newTextureObj.scale);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
      }
      obj.material.map.dispose();
      obj.material.aoMap.dispose();
      obj.material.normalMap.dispose();
      obj.material.roughnessMap.dispose();
      Object.assign(obj.material, combinedTextures);

      setTextures(obj.userData.id, textureName);
    }
    // obj.material.needsUpdate = true;
  };

  const handleMouseMove = e => {
    if (!mouseDown.current) return;
    e.preventDefault();
    e.stopPropagation();

    const x = e.pageX - popup.current.offsetLeft;
    popup.current.scrollLeft = scrollLeft.current - (x - startX.current) * 2.5;
    mouseMoved.current = true;
  };

  return (
    <>
      {sel && obj.userData.type !== "furniture" ? (
        <Html position={[pos.x, pos.y + 1, pos.z]} center>
          <div
            className="popup"
            // key="popup"
            // initial={{ opacity: 0, scale: 0 }}
            // animate={{ opacity: 1, scale: 1 }}
            // exit={{ opacity: 0, scale: 0 }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDoubleClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={changeTexture}
            onMouseMove={handleMouseMove}
            onContextMenu={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            ref={popup}
          >
            {textures.map((tex, i) => (
              <img
                key={i}
                texture={tex.name}
                draggable="false"
                className="thumbnail"
                src={tex.thumbnail}
                // onMouseUp={changeTexture}
                // onClick={selectTexture}
              />
            ))}
          </div>
        </Html>
      ) : sel && obj.userData.type === "furniture" ? (
        <FurniturePopup obj={sel.obj} />
      ) : null}
    </>
  );
};
