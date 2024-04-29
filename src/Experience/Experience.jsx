import { OrbitControls, Grid, useHelper, useTexture, Select, Edges } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef, useEffect, Suspense } from "react";
import { useStore } from "../store.js";
import { Perf } from "r3f-perf";
import { Room } from "./Room.jsx";
import { OrphanWall } from "./OrphanWall.jsx";
import { PopupMenu } from "./PopupMenu.jsx";
import * as THREE from "three";

const mainLoadingManager = new THREE.LoadingManager();
mainLoadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
  const progress = itemsLoaded / itemsTotal;
  // console.log(`Loading progress: ${Math.round(progress * 100)}%`);
  console.log(`Loading texture ${itemUrl} | ${itemsLoaded} / ${itemsTotal}`);
};

export const Experience = () => {
  console.log("experience render");
  const wallIds = useStore.getState().walls;
  const unconvertedCorners = useStore.getState().corners;
  const roomIds = useStore.getState().rooms;
  const { centre, size } = useStore.getState().origin;

  const three = useThree();
  console.log(three);

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
      <axesHelper args={[2, 2, 2]} />
      <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
      <directionalLight ref={dirLight} position={[0, 20, 0]} />
      <ambientLight intensity={1.3} />

      {rooms.map((room, i) => {
        const roomWalls = getWalls(room);
        return (
          <Room key={i} room={room} walls={roomWalls} mainLoadingManager={mainLoadingManager} />
        );
      })}

      {orphanWalls.map((wall, i) => (
        <OrphanWall key={i} wall={wall} mainLoadingManager={mainLoadingManager} />
      ))}

      <PopupMenu />

      {/* <mesh position={[0, 3.5, 2]} material={materials} ref={boxGeo}>
        <boxGeometry args={[2.7, 2.7, 2.7]} />
      </mesh> */}
    </>
  );
};
