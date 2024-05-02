import { useRef, useEffect } from "react";
import { useGLTF, DragControls, TransformControls } from "@react-three/drei";

export const FloorItem = ({ url, position }) => {
  const { scene } = useGLTF(url);
  const obj = useRef();
  const controls = useRef();

  useEffect(() => {
    console.log(controls.current);
    controls.current.children[0].children[7].children[0].visible = false;
  }, []);

  const handleMouseEnter = () => {};

  const handleMouseLeave = () => {};
  return (
    <>
      <DragControls axisLock="y" onDragStart={e => console.log(e)}>
        <primitive
          ref={obj}
          object={scene}
          position={position}
          onPointerEnter={handleMouseEnter}
          onPointerLeave={handleMouseLeave}
        />
      </DragControls>
      <TransformControls ref={controls} object={obj} mode="rotate" showX={false} showZ={false} />
    </>
  );
};
