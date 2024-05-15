import { useRef, useMemo } from "react";
import { useGLTF, DragControls, PivotControls } from "@react-three/drei";

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
            // onPointerDown={e => e.stopPropagation()}
          />
        </PivotControls>
      </DragControls>
    </>
  );
};
