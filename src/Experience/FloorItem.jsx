import { useRef, useEffect } from "react";
import { useGLTF, DragControls, PivotControls } from "@react-three/drei";

export const FloorItem = ({ url, position }) => {
  const { scene } = useGLTF(url);
  console.log(scene);
  const obj = useRef();
  const pivot = useRef();
  let toggle = true;

  const handleClick = e => {
    e.stopPropagation();
    if (e.delta > 5) return;
  };

  const toggleRotate = () => {
    if (pivot.current) {
      pivot.current.children[0].visible = false;
    }
  };

  // const changeTexture = e => {
  // 	if (e.delta > 5) return;
  // 	e.stopPropagation();
  // 	useSelect.setState({ selection: { obj: e.eventObject, len, height } });
  // };

  useEffect(() => {
    const currentPivot = pivot.current;
    if (currentPivot) {
      currentPivot.children[0].children[0].children[0].visible = true;
    }
  }, []);

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
        >
          <primitive
            ref={obj}
            object={scene}
            position={position}
            onClick={handleClick}
            onPointerDown={toggleRotate}
          />
        </PivotControls>
      </DragControls>
    </>
  );
};
