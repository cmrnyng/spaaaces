import * as THREE from "three";
import { Wall } from "./Wall.jsx";

export const Room = ({ room }) => {
  let { corners, walls } = room;

  // Floor
  const floorPts = corners.map(p => new THREE.Vector2(p.x, p.y));
  const floor = new THREE.Shape(floorPts);

  // Walls
  // Calculating angle between walls at each corner
  corners.forEach(corner => {
    // Finding adjacent corners
    const adjCorners = [];
    const connectedWalls = walls.filter(
      wall => wall.start.id === corner.id || wall.end.id === corner.id
    );
    connectedWalls.forEach(wall => {
      if (wall.start.id !== corner.id) adjCorners.push(wall.start);
      if (wall.end.id !== corner.id) adjCorners.push(wall.end);
    });
    // Calculate angle between these corners
    const corner1 = new THREE.Vector2(adjCorners[0].x - corner.x, adjCorners[0].y - corner.y);
    const corner2 = new THREE.Vector2(adjCorners[1].x - corner.x, adjCorners[1].y - corner.y);
    const angle = corner1.angleTo(corner2);
    walls = walls.map(wall => {
      if (wall.start.id === corner.id) wall.start.angle = angle;
      if (wall.end.id === corner.id) wall.end.angle = angle;
      return wall;
    });
  });

  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position-y={0}>
        <shapeGeometry args={[floor]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>
      {walls.map((wall, i) => (
        <Wall key={i} wall={wall} />
      ))}
    </group>
  );
};
