import { FloorItem } from "./FloorItem.jsx";
import { Placeholder } from "./Placeholder.jsx";
import { useSelect } from "../selection.js";
import { useRoomData } from "../store.js";
import { Suspense } from "react";
import * as THREE from "three";

export const Furniture = () => {
  const { centre } = useRoomData.getState().origin;
  const items = useSelect(state => state.items);
  return (
    <>
      {items.map((item, i) => (
        <Suspense
          key={i}
          fallback={
            <Placeholder
              position={
                item.position ? item.position : new THREE.Vector3(centre.x / 40, 0.5, centre.y / 40)
              }
            />
          }
        >
          <FloorItem
            key={i}
            url={item.url}
            uuid={item.uuid}
            position={
              item.position ? item.position : new THREE.Vector3(centre.x / 40, 0, centre.y / 40)
            }
            quaternion={item.quaternion}
          />
        </Suspense>
      ))}
    </>
  );
};
