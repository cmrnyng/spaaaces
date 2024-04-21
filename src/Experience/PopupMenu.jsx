import { Html, useTexture } from "@react-three/drei";
import { useSelect } from "../selection";
import { useEffect, useRef, useState } from "react";
import wallTex from "../data/wallTextures.json";
import { useThree } from "@react-three/fiber";

export const PopupMenu = () => {
  const sel = useSelect(state => state.selection);
  const setTextures = useSelect(state => state.setTextures);
  const prevSel = useRef(null);
  const popup = useRef();

  const mouseDown = useRef(false);
  const mouseMoved = useRef(false);
  const startX = useRef();
  const scrollLeft = useRef();

  let pos;

  const { controls } = useThree();

  if (!sel) return (prevSel.current = null);
  const { el } = sel;
  if (el == prevSel.current?.el) return (prevSel.current = null);
  if (el.userData.type === "wall") {
    pos = el.geometry.boundingSphere.center;
    prevSel.current = sel;
  }

  const handleScroll = e => {
    e.preventDefault();
    e.stopPropagation();

    var container = popup.current;
    var containerScrollPosition = popup.current.scrollLeft;
    container.scrollTo({
      top: 0,
      left: containerScrollPosition + e.deltaY * 0.3,
      behaviour: "smooth",
    });
  };

  const handleEnter = e => {
    e.preventDefault();
    e.stopPropagation();
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
    controls.enabled = true;
  };

  const handleMouseDown = e => {
    // e.preventDefault();
    // e.stopPropagation();

    mouseDown.current = true;
    mouseMoved.current = false;
    startX.current = e.pageX - popup.current.offsetLeft;
    scrollLeft.current = popup.current.scrollLeft;
  };

  const handleMouseUp = e => {
    // e.preventDefault();
    // e.stopPropagation();
    mouseDown.current = false;

    if (mouseMoved.current) return;
    const id = el.userData.id;
    const textureName = e.target.getAttribute("texture");
    const textureObj = wallTex.find(tex => tex.name === textureName);
    console.log(textureObj.urls.map);
    console.log(el);
    // updateTexture();
    // el.material[0].map = textureObj.urls.map;
    // setTextures({ id, texture });
  };

  const handleMouseMove = e => {
    if (!mouseDown.current) return;
    e.preventDefault();
    e.stopPropagation();

    const x = e.pageX - popup.current.offsetLeft;
    popup.current.scrollLeft = scrollLeft.current - (x - startX.current) * 2.5;
    mouseMoved.current = true;
  };

  const updateTexture = () => {
    // const newTextures = useTexture(urls);
    // Object.assign(el.material[0], urls);
    // console.log(el);
  };

  return (
    <>
      {sel && (
        <Html position={[pos.x, pos.y + 1, pos.z]} center>
          <div
            className="popup"
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
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            ref={popup}
          >
            {wallTex.map((tex, i) => (
              <img
                key={i}
                texture={tex.name}
                draggable="false"
                className="thumbnail"
                src={tex.urls.map}
                onContextMenu={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                // onClick={selectTexture}
              />
            ))}
          </div>
        </Html>
      )}
    </>
  );
};
