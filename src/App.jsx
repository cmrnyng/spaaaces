import { useState } from "react";
import { AppProvider } from "./AppContext.jsx";
import UI from "./UI.jsx";
import { DesignView } from "./DesignView.jsx";
import { FloorplanEditor } from "./FloorplanEditor.jsx";
import { useSelect } from "./selection.js";

export default function App() {
  const [designView, setDesignView] = useState(true);
  const [storeUpdated, setStoreUpdated] = useState(true);

  console.log("app render");

  const toggleView = () => {
    if (designView) {
      setStoreUpdated(false);
    }
    setDesignView(!designView);
    useSelect.setState({ selection: null });
  };

  return (
    <AppProvider>
      <UI toggleView={toggleView} designView={designView} />
      {/* <div
				style={{
					display: designView ? "block" : "none",
					width: "100%",
					height: "100%",
				}}
			>
				<DesignView shouldMemoize={designView} />
			</div> */}
      {designView && storeUpdated && <DesignView />}
      {!designView && <FloorplanEditor setStoreUpdated={setStoreUpdated} />}
    </AppProvider>
  );
}
