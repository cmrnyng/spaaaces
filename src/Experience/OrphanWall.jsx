import { useMemo } from "react";
import { Wall } from "./Wall.jsx";
import * as utils from "../utils.js";

const height = 2.7;
const wallThickness = 0.08;

export const OrphanWall = ({ wall }) => {
  const edge = useMemo(() => {
    const { start, end } = wall;

    // Calculate angles between walls
    const cornerAngle = w => {
      var theta = Math.PI;

      var cs = Math.cos(theta / 2);
      var sn = Math.sin(theta / 2);

      var wdx = w.end.x - w.start.x;
      var wdy = w.end.y - w.start.y;

      var vx = wdx * cs - wdy * sn;
      var vy = wdx * sn + wdy * cs;

      var mag = utils.distance(0, 0, vx, vy);
      var desiredMag = wallThickness / 2 / sn;
      var scalar = desiredMag / mag;

      return { x: vx * scalar, y: vy * scalar };
    };

    const vec = cornerAngle(wall);

    const interiorStart = { x: start.x + vec.x, y: start.y + vec.y };
    const interiorEnd = { x: end.x + vec.x, y: end.y + vec.y };
    const exteriorStart = { x: start.x - vec.x, y: start.y - vec.y };
    const exteriorEnd = { x: end.x - vec.x, y: end.y - vec.y };
    const id = wall.id;

    return { interiorStart, interiorEnd, exteriorStart, exteriorEnd, id };
  }, []);

  return <Wall edge={edge} orphan={true} />;
};
