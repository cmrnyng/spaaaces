import {
	OrbitControls,
	Grid,
	useHelper,
	useTexture,
	Select,
	Edges,
	useSelect,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef, useEffect, Suspense } from "react";
import { useStore } from "../store.js";
import { Perf } from "r3f-perf";
import { Room } from "./Room.jsx";
import { OrphanWall } from "./OrphanWall.jsx";
import { PopupMenu } from "./PopupMenu.jsx";
import * as THREE from "three";

export const Experience = () => {
	const wallIds = useStore.getState().walls;
	const unconvertedCorners = useStore.getState().corners;
	const roomIds = useStore.getState().rooms;

	const boxGeo = useRef();

	const dirLight = useRef();
	// useHelper(dirLight, THREE.DirectionalLightHelper, 3, "red");

	// Conversion into Three.js coords
	const corners = unconvertedCorners.map(c => ({ x: c.x / 40, y: c.y / 40, id: c.id }));

	const walls = wallIds.map(wall => ({
		start: corners.find(corner => corner.id === wall.startId),
		end: corners.find(corner => corner.id === wall.endId),
		id: wall.id,
	}));

	// const rooms = roomIds.map(room => ({
	//   corners: room.corners.map(id => corners.find(c => c.id === id)),
	//   walls: room.walls.map(id => walls.find(w => w.id === id)),
	// }));

	const rooms = roomIds.map(room => room.map(id => corners.find(c => c.id === id)));

	const getWalls = room =>
		walls.filter(
			wall => room.some(c => c.id === wall.start.id) && room.some(c => c.id === wall.end.id)
		);

	const wallsInRooms = walls.filter(wall =>
		rooms.some(
			room => room.some(c => c.id === wall.start.id) && room.some(c => c.id === wall.end.id)
		)
	);

	const orphanWalls = walls.filter(wall => !wallsInRooms.some(wir => wir.id === wall.id));

	// console.log(roomIds);
	// const rooms = roomIds.map(room =>
	//   room.map(cornerId => corners.find(corner => corner.id === cornerId))
	// );

	// for (const room of roomIds) {
	//   room.forEach(cornerId => {
	//     const connectedWalls = wallIds.filter(
	//       wall => wall.startId === cornerId || wall.endId === cornerId
	//     );
	//   });
	// }

	// Grid config
	const { gridSize, ...gridConfig } = {
		gridSize: [10.5, 10.5],
		cellSize: 0.4,
		cellThickness: 1,
		cellColor: "#d3d3d3",
		sectionSize: 3.3,
		sectionThickness: 0,
		fadeDistance: 25,
		fadeStrength: 1,
		followCamera: false,
		infiniteGrid: true,
	};

	// const textures = useTexture({
	//   map: "textures/WoodFloor004_2K-JPG/WoodFloor004_2K-JPG_Color.jpg",
	// });

	// const colorMap = useLoader(
	//   TextureLoader,
	//   "textures/WoodFloor004_2K-JPG/WoodFloor004_2K-JPG_Color.jpg"
	// );
	// colorMap.repeat.x = 1;
	// colorMap.wrapS = THREE.RepeatWrapping;

	const material1 = new THREE.MeshStandardMaterial({ color: "red" });
	const material2 = new THREE.MeshStandardMaterial({ color: "blue" });

	const materials = [null, null, null, null, material1, material2];

	// useEffect(() => {
	//   console.log(boxGeo.current);
	// }, []);

	return (
		<>
			<Perf />
			<OrbitControls
				makeDefault
				maxPolarAngle={Math.PI / 2}
				screenSpacePanning={false}
				minDistance={1}
				maxDistance={10}
				target-y={1.35}
				panSpeed={0.7}
				rotateSpeed={0.7}
			/>
			{/* <axesHelper args={[2, 2, 2]} /> */}
			<Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
			<directionalLight ref={dirLight} position={[0, 20, 0]} />
			<ambientLight intensity={1.3} />

			{rooms.map((room, i) => {
				const roomWalls = getWalls(room);
				return <Room key={i} room={room} walls={roomWalls} />;
			})}

			{orphanWalls.map((wall, i) => (
				<OrphanWall key={i} wall={wall} />
			))}

			<PopupMenu />

			{/* <mesh position={[0, 3.5, 2]} material={materials} ref={boxGeo}>
        <boxGeometry args={[2.7, 2.7, 2.7]} />
      </mesh> */}
		</>
	);
};
