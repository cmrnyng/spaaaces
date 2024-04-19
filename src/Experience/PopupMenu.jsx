import { Html } from "@react-three/drei";
import { useSelect } from "../selection";
import { useEffect, useRef, useState } from "react";
import wallTex from "../data/wallTextures.json";

export const PopupMenu = () => {
  const sel = useSelect(state => state.selection);
  const prevSel = useRef(null);
  let pos;

  if (!sel) return (prevSel.current = null);
  const { el } = sel;
  if (el == prevSel.current?.el) return (prevSel.current = null);
  if (el.userData.type === "wall") {
    pos = el.geometry.boundingSphere.center;
    prevSel.current = sel;
  }

  const eventHandler = e => {
    return e.preventDefault();
  };

  return (
    <>
      {sel && (
        <Html position={[pos.x, pos.y + 1, pos.z]} wrapperClass="popup" center>
          {wallTex.map((tex, i) => (
            <img key={i} draggable="false" className="thumbnail" src={tex.urls.map} />
          ))}
        </Html>
      )}
    </>
  );
};
