import { useState } from "react";
import UI from "./UI.jsx";
import DesignView from "./DesignView.jsx";
import FloorplanEditor from "./FloorplanEditor.jsx";

export default function App() {
  const [designView, setDesignView] = useState(true);
  const [globalElements, setGlobalElements] = useState([]);
  console.log(globalElements);

  const toggleView = () => {
    setDesignView(!designView);
  };

  return (
    <>
      <UI toggleView={toggleView} designView={designView} />
      <div style={{ display: designView ? "block" : "none", width: "100%", height: "100%" }}>
        <DesignView />
      </div>
      {!designView && (
        <FloorplanEditor handleStateUpdate={setGlobalElements} globalElements={globalElements} />
      )}
    </>
  );
}
