import { OrbitControls, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef, useEffect, Suspense } from "react";
import { useRoomData } from "../store.js";
import { Perf } from "r3f-perf";
import { useApp } from "../AppContext.jsx";
import { Room } from "./Room.jsx";
import { OrphanWall } from "./OrphanWall.jsx";
import { PopupMenu } from "./PopupMenu.jsx";
import * as THREE from "three";
import { Furniture } from "./Furniture.jsx";
import { useSelect } from "../selection.js";

const mainLoadingManager = new THREE.LoadingManager();
mainLoadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
  const progress = itemsLoaded / itemsTotal;
  // console.log(`Loading progress: ${Math.round(progress * 100)}%`);
  console.log(`Loading texture ${itemUrl} | ${itemsLoaded} / ${itemsTotal}`);
};

export const Experience = () => {
  console.log("experience render");

  const { registerUpdateFunction } = useApp();
  const updateItem = useSelect(state => state.updateItem);

  const { scene } = useThree();

  useEffect(() => {
    const updateItemPositions = () => {
      scene.traverse(child => {
        if (child.name === "Furniture") {
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          child.getWorldPosition(worldPosition);
          child.getWorldQuaternion(worldQuaternion);
          updateItem(child.uuid, worldPosition, worldQuaternion);
        }
      });
    };
    registerUpdateFunction(updateItemPositions);
  }, [registerUpdateFunction]);

  // Temp debugging useEffect
  useEffect(() => {
    const handleKeydown = e => {
      if (e.key === "u") {
        // console.log(scene);
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const wallIds = useRoomData.getState().walls;
  const unconvertedCorners = useRoomData.getState().corners;
  const roomIds = useRoomData.getState().rooms;
  const { centre, size } = useRoomData.getState().origin;

  const dirLight = useRef();
  // useHelper(dirLight, THREE.DirectionalLightHelper, 3, "red");

  // Conversion into Three.js coords
  const corners = unconvertedCorners.map(c => ({ x: c.x / 40, y: c.y / 40, id: c.id }));

  const walls = wallIds.map(wall => ({
    start: corners.find(corner => corner.id === wall.startId),
    end: corners.find(corner => corner.id === wall.endId),
    id: wall.id,
  }));

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

  return (
    <>
      {/* <Perf /> */}
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={10}
        target={[centre.x / 40, 1.35, centre.y / 40]}
        panSpeed={0.7}
        rotateSpeed={0.7}
      />
      <axesHelper args={[1, 1, 1]} />
      <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
      <directionalLight ref={dirLight} position={[0, 20, 0]} />
      <ambientLight intensity={1.3} />

      <PopupMenu />

      {rooms.map((room, i) => {
        const roomWalls = getWalls(room);
        return (
          <Room key={i} room={room} walls={roomWalls} mainLoadingManager={mainLoadingManager} />
        );
      })}

      {orphanWalls.map((wall, i) => (
        <OrphanWall key={i} wall={wall} mainLoadingManager={mainLoadingManager} />
      ))}

      {/* Prevent re-renders from this somehow (maybe have a single component
          for all models)
      */}
      <Furniture />

      {/* <PivotControls
				disableScaling
				disableSliders
				disableAxes
				activeAxes={[true, false, true]}
				depthTest={false}
			>
				<mesh>
					<boxGeometry />
					<meshNormalMaterial />
				</mesh>
			</PivotControls> */}
    </>
  );
};
