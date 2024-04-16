import * as THREE from "three";
import { Wall } from "./Wall.jsx";

export const Room = ({ room, walls }) => {
  // let { corners, walls } = room;
  let corners = room;

  // Floor - needs to be updated using interior wall as corners
  const floorPts = corners.map(p => new THREE.Vector2(p.x, p.y));
  const floor = new THREE.Shape(floorPts);

  // Walls
  // Getting walls which are part of the room

  // Walls
  // Calculating angle between walls at each corner
  corners.forEach(corner => {
    // Finding adjacent corners
    const adjCorners = [];
    const connectedWalls = walls.filter(
      wall => wall.start.id === corner.id || wall.end.id === corner.id
    );
    connectedWalls.forEach(wall => {
      if (wall.end.id === corner.id) adjCorners.push(wall.start);
      if (wall.start.id === corner.id) adjCorners.push(wall.end);
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

  // For each corner, find walls where it is their start and walls where it is their end
  corners.forEach(corner => {
    corner.wallStarts = [];
    corner.wallEnds = [];
    walls.forEach(wall => {
      if (wall.start.id === corner.id) return corner.wallStarts.push(wall);
      if (wall.end.id === corner.id) return corner.wallEnds.push(wall);
    });
  });

  const findWallTo = (firstCorner, secondCorner) => {
    for (let i = 0; i < firstCorner.wallStarts.length; i++) {
      if (firstCorner.wallStarts[i].end.id === secondCorner.id) return firstCorner.wallStarts[i];
    }
    return null;
  };

  const findWallFrom = (firstCorner, secondCorner) => {
    for (let i = 0; i < firstCorner.wallEnds.length; i++) {
      if (firstCorner.wallEnds[i].start.id === secondCorner.id) return firstCorner.wallEnds[i];
    }
    return null;
  };

  const changeDirection = wall => {
    const { start, end, id } = wall;
    return { start: end, end: start, id };
  };

  // Find half edges - maybe put this code in a usememo or something
  // If wall goes start to end in the direction it is being checked in, then front = true, otherwise front = false
  let halfEdges = [];

  for (let i = 0; i < corners.length; i++) {
    let firstCorner = corners[i];
    let secondCorner = corners[(i + 1) % corners.length];

    let wallTo = findWallTo(firstCorner, secondCorner);
    let wallFrom = findWallFrom(firstCorner, secondCorner);

    // Every wall should go from first -> second
    if (wallTo) {
      halfEdges.push({ wall: wallTo, front: true });
    }
    if (wallFrom) {
      halfEdges.push({ wall: changeDirection(wallFrom), front: true });
    }
  }

  console.log(halfEdges);

  // Signed area
  // const signedArea = vertices => {
  //   let area = 0;

  //   for (let i = 0; i < vertices.length; i++) {
  //     const j = (i + 1) % vertices.length;
  //     area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
  //   }

  //   return area / 2;
  // };

  // const area = signedArea(corners);

  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position-y={0}>
        <shapeGeometry args={[floor]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>
      {/* {walls.map((wall, i) => (
        <Wall key={i} wall={wall} />
      ))} */}
      {halfEdges.map((edge, i) => (
        <Wall key={i} wall={edge.wall} />
      ))}
    </group>
  );
};
