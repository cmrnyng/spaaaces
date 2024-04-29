import { Experience } from "./Experience/Experience.jsx";
import { Canvas } from "@react-three/fiber";
import { useStore } from "./store.js";
import { useSelect } from "./selection.js";
import { useRef, useState } from "react";
import { Loader } from "./Loader.jsx";
import { Items } from "./Experience/Items.jsx";
import addIcon from "./assets/add.svg";

export const DesignView = () => {
  console.log("designview render");
  const [itemMenu, setItemMenu] = useState(false);
  const wrapper = useRef();

  const eventHandler = () => {
    useSelect.setState({ selection: null });
  };

  const { centre, size } = useStore.getState().origin;

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
      <div style={{ backgroundColor: "red", width: "50px", height: "50px" }} />
      <div className="designview-btns">
        <button className="designview-btn" onClick={() => setItemMenu(!itemMenu)}>
          <img src={addIcon} className="icon" />
        </button>
      </div>
      <div ref={wrapper} className={`content-wrapper ${itemMenu ? "show" : ""}`}>
        <div className="content">
          <Items />
        </div>
      </div>
    </>
  );
};
