import { OrbitControls, Grid } from "@react-three/drei";
import { useStore } from "../store.js";
import { Room } from "./Room.jsx";
import { OrphanWall } from "./OrphanWall.jsx";
import { Floor } from "./Floor.jsx";

export const Experience = () => {
  const wallIds = useStore.getState().walls;
  const unconvertedCorners = useStore.getState().corners;
  const roomIds = useStore.getState().rooms;

  // Conversion into Three.js coords
  const corners = unconvertedCorners.map(c => ({ x: c.x / 40, y: c.y / 40, id: c.id }));

  const walls = wallIds.map(wall => ({
    start: corners.find(corner => corner.id === wall.startId),
    end: corners.find(corner => corner.id === wall.endId),
    id: wall.id,
  }));

  const rooms = roomIds.map(room => ({
    corners: room.corners.map(id => corners.find(c => c.id === id)),
    walls: room.walls.map(id => walls.find(w => w.id === id)),
  }));

  const orphanWalls = walls.filter(
    wall => !rooms.some(room => room.walls.some(w => w.id === wall.id))
  );

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
    cellColor: "#000000",
    sectionSize: 3.3,
    sectionThickness: 0,
    fadeDistance: 25,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true,
  };

  return (
    <>
      <OrbitControls
        maxPolarAngle={Math.PI / 2}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={10}
        target-y={1.35}
      />
      <axesHelper args={[2, 2, 2]} />
      <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />

      {/* <WallTest /> */}

      {/* {walls.map((wall, i) => (
        <Wall key={i} wall={wall} />
      ))}
      {rooms.map((room, i) => (
        <Floor key={i} points={room} />
      ))} */}

      {rooms.map((room, i) => (
        <Room key={i} room={room} />
      ))}
    </>
  );
};
