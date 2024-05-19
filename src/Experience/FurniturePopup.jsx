import { Html } from "@react-three/drei";
import { useRef, useEffect } from "react";
import binIcon from "../assets/binIcon1.svg";
import * as THREE from "three";
import { useSelect } from "../selection";

export const FurniturePopup = ({ obj }) => {
  const htmlRef = useRef();
  const deleteItems = useSelect(state => state.deleteItems);
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

  const handleClick = () => {
    // Dispose of the object
    obj.traverseAncestors(parent => {
      if (parent.name === "DragControls") {
        parent.traverse(child => {
          if (child instanceof THREE.Mesh) {
            console.log(child);
            child.geometry.dispose();
            for (const key in child.material) {
              const value = child.material[key];
              if (value && typeof value.dispose === "function") {
                console.log(value);
                value.dispose();
              }
            }
          }
        });
      }
    });

    // Remove it from items array
    deleteItems(obj.uuid);
  };

  return (
    <group ref={htmlRef}>
      <Html position={[0, 1, 0]} center>
        <div className="furniture-popup">
          <img src={binIcon} className="popup-icon" draggable="false" onClick={handleClick} />
        </div>
      </Html>
    </group>
  );
};
