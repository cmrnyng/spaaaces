import { OrbitControls, Grid } from "@react-three/drei";
import { useStore } from "../store.js";
import { Wall } from "./Wall.jsx";
import { Floor } from "./Floor.jsx";

export const Experience = () => {
	const wallIds = useStore.getState().walls;
	const corners = useStore.getState().corners;
	const roomIds = useStore.getState().rooms;

	const walls = wallIds.map(wall => ({
		start: corners.find(corner => corner.id === wall.startId),
		end: corners.find(corner => corner.id === wall.endId),
		id: wall.id,
	}));
	const rooms = roomIds.map(room =>
		room.map(cornerId => corners.find(corner => corner.id === cornerId))
	);

	// Grid config
	const { gridSize, ...gridConfig } = {
		gridSize: [10.5, 10.5],
		cellSize: 0.4,
		cellThickness: 1,
		cellColor: "#000000",
		sectionSize: 3.3,
		sectionThickness: 0,
		sectionColor: "#9d4b4b",
		fadeDistance: 25,
		fadeStrength: 1,
		followCamera: false,
		infiniteGrid: true,
	};

	// Convert all coordinates into Three.js coordinates

	return (
		<>
			<OrbitControls maxPolarAngle={Math.PI / 2} />
			<axesHelper args={[2, 2, 2]} />
			<Grid position={[0, -1.36, 0]} args={gridSize} {...gridConfig} />

			<Wall />
			<Floor />
		</>
	);
};
