import { useRef, useMemo } from "react";
import { useGLTF, DragControls, PivotControls, Html } from "@react-three/drei";
import { useSelect } from "../selection";
import * as THREE from "three";

export const FloorItem = ({ url, uuid, position, quaternion }) => {
  const { scene } = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  copiedScene.uuid = uuid;
  copiedScene.name = "Furniture";
  const obj = useRef();
  const pivot = useRef();
  let toggle = true;

  const handleClick = e => {
    e.stopPropagation();
    if (e.delta > 5) return;
    const worldPosition = new THREE.Vector3();
    console.log(e.eventObject);
    e.eventObject.getWorldPosition(worldPosition);
    useSelect.setState({ selection: { obj: e.eventObject, position: worldPosition } });
    toggleRotate();
  };

  const toggleRotate = () => {
    if (pivot.current) {
      toggle = !toggle;
      pivot.current.children[0].visible = toggle;
      pivot.current.children[0].children[0].children[0].visible = toggle;
    }
  };

  return (
    <>
      <DragControls axisLock="y">
        <PivotControls
          ref={pivot}
          disableScaling
          disableSliders
          disableAxes
          activeAxes={[true, false, true]}
          depthTest={false}
          anchor={[0, -1, 0]}
        >
          <primitive
            ref={obj}
            object={copiedScene}
            position={position}
            quaternion={quaternion}
            onClick={handleClick}
            userData={{ uuid, type: "furniture" }}
            // onPointerDown={e => e.stopPropagation()}
          />
        </PivotControls>
      </DragControls>
    </>
  );
};
