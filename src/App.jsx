import { useState } from "react";
import UI from "./UI.jsx";
import DesignView from "./DesignView.jsx";
import FloorplanEditor from "./FloorplanEditor.jsx";
import Test from "./Test.jsx";

export default function App() {
	const [designView, setDesignView] = useState(true);

	console.log("app render");

	const toggleView = () => {
		setDesignView(!designView);
	};

	return (
		<>
			<UI toggleView={toggleView} designView={designView} />
			<div style={{ display: designView ? "block" : "none", width: "100%", height: "100%" }}>
				<DesignView />
			</div>
			{!designView && <FloorplanEditor />}
			{/* {!designView && <Test />} */}
		</>
	);
}
