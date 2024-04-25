import * as THREE from "three";
import * as utils from "../utils.js";
import { Wall } from "./Wall.jsx";
import { Floor } from "./Floor.jsx";
import { useRef, useEffect, useMemo } from "react";

const wallThickness = 0.08;

export const Room = ({ room, walls, mainLoadingManager }) => {
  console.log("room render");
  const finalEdges = useMemo(() => {
    let corners = room;

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
    let halfEdges = [];

    for (let i = 0; i < corners.length; i++) {
      let firstCorner = corners[i];
      let secondCorner = corners[(i + 1) % corners.length];

      let wallTo = findWallTo(firstCorner, secondCorner);
      let wallFrom = findWallFrom(firstCorner, secondCorner);

      // Every wall should go from first -> second
      if (wallTo) {
        halfEdges.push({ wall: wallTo });
      } else if (wallFrom) {
        halfEdges.push({ wall: changeDirection(wallFrom) });
      } else {
        console.log("Error");
      }
    }

    const halfEdgesCopy = halfEdges.map(el => Object.assign({}, el));

    for (let i = 0; i < halfEdges.length; i++) {
      if (i === 0) {
        halfEdges[i].next = halfEdgesCopy[i + 1].wall;
        halfEdges[i].prev = halfEdgesCopy[halfEdges.length - 1].wall;
      } else if (i === halfEdges.length - 1) {
        halfEdges[i].next = halfEdgesCopy[0].wall;
        halfEdges[i].prev = halfEdgesCopy[i - 1].wall;
      } else {
        halfEdges[i].next = halfEdgesCopy[i + 1].wall;
        halfEdges[i].prev = halfEdgesCopy[i - 1].wall;
      }
    }

    // Calculate angles between walls
    const cornerAngle = (v1, v2) => {
      var theta = utils.angle2pi(
        v1.start.x - v1.end.x,
        v1.start.y - v1.end.y,
        v2.end.x - v1.end.x,
        v2.end.y - v1.end.y
      );

      var cs = Math.cos(theta / 2);
      var sn = Math.sin(theta / 2);

      var v2dx = v2.end.x - v2.start.x;
      var v2dy = v2.end.y - v2.start.y;

      var vx = v2dx * cs - v2dy * sn;
      var vy = v2dx * sn + v2dy * cs;

      var mag = utils.distance(0, 0, vx, vy);
      var desiredMag = wallThickness / 2 / sn;
      var scalar = desiredMag / mag;

      return { x: vx * scalar, y: vy * scalar };
    };

    const finalEdges = halfEdges.map(edge => {
      const { wall, prev, next } = edge;
      const startVec = cornerAngle(prev, wall);
      const endVec = cornerAngle(wall, next);

      const interiorStart = { x: wall.start.x + startVec.x, y: wall.start.y + startVec.y };
      const interiorEnd = { x: wall.end.x + endVec.x, y: wall.end.y + endVec.y };
      const exteriorStart = { x: wall.start.x - startVec.x, y: wall.start.y - startVec.y };
      const exteriorEnd = { x: wall.end.x - endVec.x, y: wall.end.y - endVec.y };
      const id = wall.id;

      return { interiorStart, interiorEnd, exteriorStart, exteriorEnd, id };
    });

    return finalEdges;
  });

  const floorID = room.map(c => c.id.substring(0, 8)).join("-");

  return (
    <group>
      <Floor edges={finalEdges} id={floorID} mainLoadingManager={mainLoadingManager} />
      {finalEdges.map((edge, i) => {
        return <Wall key={i} edge={edge} orphan={false} mainLoadingManager={mainLoadingManager} />;
      })}
    </group>
  );
};
