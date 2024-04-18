import * as THREE from "three";
import { useRef } from "react";
import { useTexture, useSelect } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Wall } from "./Wall.jsx";
import * as utils from "../utils.js";

const height = 2.7;
const wallThickness = 0.1;

export const OrphanWall = ({ wall }) => {
  const selected = useSelect();
  console.log(selected);
  let select = false;
  if (!selected.length === 0) {
    console.log("true");
    select = true;
  }

  const { start, end } = wall;
  const wallRef = useRef();

  let interiorTransform = new THREE.Matrix4();
  let invInteriorTransform = new THREE.Matrix4();
  let exteriorTransform = new THREE.Matrix4();
  let invExteriorTransform = new THREE.Matrix4();

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

  const edge = { interiorStart, interiorEnd, exteriorStart, exteriorEnd };

  return <Wall edge={edge} orphan={true} colour={select} />;
};
