import { Experience } from "./Experience/Experience.jsx";
import { Canvas } from "@react-three/fiber";
import { useSelect } from "./selection.js";
import { Suspense } from "react";
import { Loader } from "./Loader.jsx";

export const DesignView = () => {
  console.log("designview render");
  const eventHandler = () => {
    useSelect.setState({ selection: null });
  };

  // <Canvas shadows camera={{ position: [10, 12, 12], fov: 25 }} dpr={[1, 2]}>

  return (
    <>
      <Canvas
        camera={{
          fov: 60,
          position: [4, 4, 4],
        }}
        dpr={[1, 2]}
        onCreated={state => {
          state.setEvents({
            filter: intersections => intersections.filter(i => i.object.visible),
          });
        }}
        onPointerMissed={eventHandler}
      >
        {/* <Suspense fallback={null}> */}
        <Experience />
        {/* </Suspense> */}
      </Canvas>
    </>
  );
};
