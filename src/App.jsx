import { useState } from "react";
import UI from "./UI.jsx";
import { DesignView } from "./DesignView.jsx";
import { FloorplanEditor } from "./FloorplanEditor.jsx";
import { useSelect } from "./selection.js";

export default function App() {
  const [designView, setDesignView] = useState(true);
  const [storeUpdated, setStoreUpdated] = useState(true);
  const [itemsUpdated, setItemsUpdated] = useState(false);

  console.log("app render");

  const toggleView = () => {
    if (designView) {
      setStoreUpdated(false);
      setItemsUpdated(false);
    }
    setDesignView(!designView);
    useSelect.setState({ selection: null });
  };

  return (
    <>
      <UI toggleView={toggleView} />
      {/* <div
				style={{
					display: designView ? "block" : "none",
					width: "100%",
					height: "100%",
				}}
			>
				<DesignView shouldMemoize={designView} />
			</div> */}
      {designView && storeUpdated && <DesignView setItemsUpdated={setItemsUpdated} />}
      {!designView && <FloorplanEditor setStoreUpdated={setStoreUpdated} />}
    </>
  );
}
