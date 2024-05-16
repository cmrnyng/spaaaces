import { Html } from "@react-three/drei";
import { useRef, useEffect } from "react";
import binIcon from "../assets/binIcon1.svg";
import * as THREE from "three";

export const FurniturePopup = ({ obj }) => {
  const htmlRef = useRef();
  // const objRef = useRef(obj);

  useEffect(() => {
    const currentObj = obj;
    if (htmlRef.current) {
      currentObj.add(htmlRef.current);
      currentObj.updateMatrixWorld();
    }

    const handleKeydown = e => {
      if (e.key === "k") obj.remove(htmlRef.current);
      if (e.key === "m") console.log(obj);
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      console.log("removing");
      currentObj.remove(htmlRef.current);
      currentObj.updateMatrixWorld();

      window.removeEventListener("keydown", handleKeydown);
    };
  }, [obj]);

  return (
    <group ref={htmlRef}>
      <Html position={[0, 1, 0]} center>
        <div className="furniture-popup">
          <img src={binIcon} className="popup-icon" draggable="false" />
        </div>
      </Html>
    </group>
  );
};
