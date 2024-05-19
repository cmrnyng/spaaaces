import { useRef, useMemo, useEffect } from "react";
import { useGLTF, DragControls, PivotControls } from "@react-three/drei";
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

  useEffect(() => {
    if (obj.current) {
      obj.current.position.copy(position);
      obj.current.quaternion.copy(quaternion);
    }
  }, []);

  const handleClick = e => {
    e.stopPropagation();
    if (e.delta > 5) return;
    useSelect.setState({ selection: { obj: e.eventObject } });
    toggleRotate();
  };

  const toggleRotate = () => {
    if (pivot.current) {
      toggle = !toggle;
      pivot.current.children[0].visible = toggle;
      pivot.current.children[0].children[0].children[0].visible = toggle;
    }
  };

  const handleHover = e => {
    document.body.style.cursor = e ? "pointer" : "auto";
  };

  return (
    <>
      <DragControls axisLock="y" onHover={handleHover} name="DragControls">
        <PivotControls
          ref={pivot}
          name="PivotControls"
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
            onClick={handleClick}
            userData={{ uuid, type: "furniture" }}
            // onPointerDown={e => e.stopPropagation()}
          />
        </PivotControls>
      </DragControls>
    </>
  );
};
