import { useState } from "react";
import UI from "./UI.jsx";
import DesignView from "./DesignView.jsx";
import FloorplanView from "./FloorplanView.jsx";

export default function App() {
  const [designView, setDesignView] = useState(true);

  const toggleView = () => {
    setDesignView(!designView);
  };

  return (
    <>
      <UI toggleView={toggleView} designView={designView} />
      <div style={{ display: designView ? "block" : "none", width: "100%", height: "100%" }}>
        <DesignView />
      </div>
      <div style={{ display: designView ? "none" : "block", width: "100%", height: "100%" }}>
        <FloorplanView />
      </div>
    </>
  );
}
