import { Experience } from "./Experience/Experience.jsx";
import { Canvas } from "@react-three/fiber";
import { useSelect } from "./selection.js";
import { useRef, useState, useEffect, memo } from "react";
import { SaveButton } from "./SaveButton.jsx";
import { LoadButton } from "./LoadButton.jsx";
import { NewButton } from "./NewButton.jsx";
import { Items } from "./Experience/Items.jsx";
import addIcon from "./assets/add.svg";

const ItemsMemo = memo(Items);
const ExperienceMemo = memo(Experience);

export const DesignView = () => {
  console.log("designview render");
  const [itemMenu, setItemMenu] = useState(false);
  const wrapper = useRef();

  useEffect(() => {
    if (!itemMenu) {
      wrapper.current.scrollTop = 0;
    }
  }, [itemMenu]);

  const eventHandler = () => {
    useSelect.setState({ selection: null });
  };

  const handleCanvasClick = () => {
    if (itemMenu) setItemMenu(false);
  };

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
            filter: intersections => {
              const visibleIntersections = intersections.filter(i => i.object.visible);
              return visibleIntersections.length > 0 ? [visibleIntersections[0]] : [];
            },
          });
        }}
        onPointerMissed={eventHandler}
        onClick={handleCanvasClick}
      >
        {/* <Suspense fallback={null}> */}
        <ExperienceMemo />
        {/* <Experience /> */}
        {/* </Suspense> */}
      </Canvas>
      <div className="designview-btns">
        <button className="designview-btn" onClick={() => setItemMenu(!itemMenu)}>
          <img src={addIcon} className="icon" />
        </button>
      </div>
      <div className="menu-contents">
        <SaveButton />
        <LoadButton />
        <NewButton />
      </div>
      <div ref={wrapper} className={`content-wrapper ${itemMenu ? "show" : ""}`}>
        <div className="content">
          <ItemsMemo setItemMenu={setItemMenu} />
        </div>
      </div>
    </>
  );
};
