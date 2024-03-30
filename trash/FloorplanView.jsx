import { Canvas, useFrame } from "@react-three/fiber";
import { MapControls, Grid } from "@react-three/drei";
import { useState, useRef } from "react";
import * as THREE from "three";

const z = 0.0001;

export default function FloorplanView() {
  return (
    <Canvas orthographic camera={{ near: 0.1, far: 200, zoom: 100 }}>
      <Circle />
      <MapControls enableZoom={false} screenSpacePanning mouseButtons={{ LEFT: THREE.MOUSE.PAN }} />
      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
        cellSize={0.25}
        cellThickness={1}
        cellColor="#B7B7B2"
        sectionSize={1.25}
        sectionColor="#91918A"
        rotation-x={Math.PI / 2}
      />
    </Canvas>
  );
}

function Circle() {
  const circle = useRef();
  const [pos1, setPos1] = useState({ x: null, y: null });
  const [pos2, setPos2] = useState({ x: null, y: null });
  const [walls, setWalls] = useState([]);

  useFrame(({ camera, pointer }) => {
    const vector = new THREE.Vector3(pointer.x, pointer.y, z);
    vector.unproject(camera);
    circle.current.position.set(vector.x, vector.y, z);
  });

  const getPositions = ({ camera, pointer }) => {
    if (!pos1.x) {
      const vector = new THREE.Vector3(pointer.x, pointer.y, 0);
      vector.unproject(camera);
      const newPos1 = { x: vector.x, y: vector.y };
      setPos1(newPos1);
    } else if (pos1.x) {
      const vector2 = new THREE.Vector3(pointer.x, pointer.y, 0);
      vector2.unproject(camera);
      const newPos2 = { x: vector2.x, y: vector2.y };
      setPos2(newPos2);
      setWalls([...walls, { pos1, pos2: newPos2 }]);
      setPos1({ x: null, y: null });
      setPos2({ x: null, y: null });
    }
  };

  return (
    <>
      <mesh ref={circle} onClick={getPositions}>
        <circleGeometry args={[0.01 * 100, 64]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {walls.map((wall, index) => (
        <Wall key={index} pos1={wall.pos1} pos2={wall.pos2} />
      ))}
    </>
  );
}

function Wall({ pos1, pos2 }) {
  const wallRef = useRef();

  const length = Math.abs(pos2.x - pos1.x);
  const position = [(pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2, z];

  return (
    <mesh ref={wallRef} position={position}>
      <planeGeometry args={[length, 0.1]} />
      <meshBasicMaterial color="grey" />
    </mesh>
  );
}

//
//
//
//
//
//
//
//
//

// function Editor() {
//   const { pointer } = useThree();

//   const getPositions = e => {
//     // const pos1 = [e.clientX, e.clientY];
//     // console.log(pos1);
//     console.log(pointer);
//   };

//   return (
//     <mesh position-z={z} position-x={1} onClick={getPositions}>
//       <planeGeometry args={[0.25 * 10, 0.1 * 10]} />
//       <meshBasicMaterial color="grey" />
//     </mesh>
//   );
// }
