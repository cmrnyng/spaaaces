import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import * as UTILS from "./utils.js";
import moveIcon from "./assets/moveicon.svg";
import drawIcon from "./assets/drawicon.svg";
import deleteIcon from "./assets/deleteicon.svg";

const previewSnapTolerance = 7;
const wallSnapTolerance = 7;

export default function FloorplanEditor({ walls, setWalls, corners, setCorners }) {
  const canvasRef = useRef();
  const wallsRef = useRef(walls);
  const cornersRef = useRef(corners);

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPanMousePosition, setStartPanMousePosition] = useState({ x: 0, y: 0 });

  const [mode, setMode] = useState("draw");
  const [action, setAction] = useState("none");
  const [preview, setPreview] = useState({});
  const [selectedWall, setSelectedWall] = useState(null);
  // const [nodes, setNodes] = useState([]);
  const [mouseDown, setMouseDown] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);

  useEffect(() => {
    wallsRef.current = walls;
  }, [walls]);

  // Esc key detection
  const handleKeyPress = e => {
    if (e.key === "Escape") {
      if (action === "drawing") {
        setAction("none");
        setPreview({});
      }
    }
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      draw();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Mouse scrolling
  // useEffect(() => {
  //   const panFunction = e => {
  //     setPanOffset(prevState => ({
  //       x: prevState.x - e.deltaX,
  //       y: prevState.y - e.deltaY,
  //     }));
  //   };

  //   window.addEventListener("wheel", panFunction);

  //   return () => {
  //     window.removeEventListener("wheel", panFunction);
  //   };
  // }, []);

  // Editor changes
  useEffect(() => {
    draw();
  }, [preview, walls, panOffset]);

  // New wall
  // useEffect(() => {
  //   setNodes(
  //     wallsRef.current.map(wall => {
  //       const node1 = { x: wall.x1, y: wall.y1 };
  //       const node2 = { x: wall.x2, y: wall.y2 };
  //       return { node1, node2 };
  //     })
  //   );
  // }, [walls]);

  // useEffect(() => {
  //   //
  // }, [walls]);

  // const drawGrid = ctx => {
  //   ctx.beginPath();
  //   ctx.strokeStyle = "#ddd";
  //   for (let x = 0; x <= ctx.canvas.width; x += 20) {
  //     ctx.moveTo(x, 0);
  //     ctx.lineTo(x, ctx.canvas.height);
  //   }
  //   for (let y = 0; y <= ctx.canvas.height; y += 20) {
  //     ctx.moveTo(0, y);
  //     ctx.lineTo(ctx.canvas.width, y);
  //   }
  //   ctx.stroke();
  // };

  const drawGrid = ctx => {
    let step = 20;
    let left = 0.5 - Math.ceil(ctx.canvas.width / step) * step;
    let top = 0.5 - Math.ceil(ctx.canvas.height / step) * step;
    let right = 2 * ctx.canvas.width;
    let bottom = 2 * ctx.canvas.height;
    ctx.clearRect(left, top, right - left, bottom - top);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = left; x < right; x += step) {
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
    }
    for (let y = top; y < bottom; y += step) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    }
    ctx.strokeStyle = "#ddd";
    ctx.stroke();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(panOffset.x, panOffset.y);

    drawGrid(ctx);
    drawPreview(ctx);

    // Draw walls
    wallsRef.current.forEach(wall => {
      drawWalls(ctx, wall);
    });

    ctx.restore();
  };

  const drawLine = (ctx, x1, y1, x2, y2, width, colour) => {
    ctx.beginPath();
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const drawPreview = ctx => {
    const { x1, y1, x2, y2 } = preview;
    drawLine(ctx, x1, y1, x2, y2, 6, "blue");
  };

  const drawWalls = (ctx, { x1, y1, x2, y2 }) => {
    drawLine(ctx, x1, y1, x2, y2, 6, "black");
  };

  const getMouseCoordinates = e => {
    const clientX = e.clientX - panOffset.x;
    const clientY = e.clientY - panOffset.y;
    return { clientX, clientY };
  };

  const handleMouseDown = e => {
    if (e.button === 1 || e.button === 2 || e.button === 3) return;
    const { clientX, clientY } = getMouseCoordinates(e);
    setMouseDown(true);
    setMouseMoved(false);
    setStartPanMousePosition({ x: clientX, y: clientY });

    if (mode === "move") {
      const wall = getWallAtPosition(clientX, clientY, walls);
      if (wall) {
        const offsetX = clientX - wall.x1;
        const offsetY = clientY - wall.y1;
        setAction("moving");
        setSelectedWall({ ...wall, offsetX, offsetY });
      }
    }

    if (mode === "delete") {
      const wall = getWallAtPosition(clientX, clientY, walls);
      if (wall) {
        setWalls(deleteWall(wall.id, walls));
      }
    }
  };

  const handleMouseMove = e => {
    const { clientX, clientY } = getMouseCoordinates(e);
    setMouseMoved(true);

    if (mouseDown) {
      const deltaX = clientX - startPanMousePosition.x;
      const deltaY = clientY - startPanMousePosition.y;

      setPanOffset(prevState => ({
        x: prevState.x + deltaX,
        y: prevState.y + deltaY,
      }));
    }

    if (action === "drawing" && mode === "draw") {
      const { x1, y1 } = preview;
      var { x2, y2 } = snapToAngle(x1, y1, clientX, clientY);
      setPreview({ x1, y1, x2, y2 });
    } else if (action === "moving" && mode === "move") {
      const { id, x1, y1, x2, y2, offsetX, offsetY } = selectedWall;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      updateWall(id, newX1, newY1, newX1 + (x2 - x1), newY1 + (y2 - y1));
    }
  };

  const handleMouseUp = e => {
    if (e.button === 1 || e.button === 2 || e.button === 3) return;
    const { clientX, clientY } = getMouseCoordinates(e);
    setMouseDown(false);

    if (mode === "draw" && !mouseMoved) {
      if (action !== "drawing") {
        setAction("drawing");
        setPreview({ x1: clientX, y1: clientY, x2: clientX, y2: clientY });
      } else if (action === "drawing") {
        const id = uuidv4();
        setCorners(prevState => [
          ...prevState,
          { x: preview.x1, y: preview.y1, id: uuidv4() },
          { x: preview.x2, y: preview.y2, id: uuidv4() },
        ]);
        setWalls(prevState => [...prevState, { id, ...preview }]);
        setPreview(prevPreview => ({
          x1: prevPreview.x2,
          y1: prevPreview.y2,
          x2: clientX,
          y2: clientY,
        }));
      }
    }
    if (mode === "move") {
      setAction("none");
      setSelectedWall(null);
    }
  };

  const updateWall = (id, x1, y1, x2, y2) => {
    const updatedWall = { id, x1, y1, x2, y2 };

    const updatedWalls = walls.map(wall => {
      if (wall.id === id) return updatedWall;
      return wall;
    });

    setWalls(updatedWalls);
  };

  const changeMode = newMode => {
    setMode(newMode);
    setAction("none");
    setPreview({});
  };

  return (
    <>
      <div className="floorplan-btns">
        <button
          className="editor-btn"
          onClick={() => changeMode("move")}
          style={{ backgroundColor: mode === "move" ? "#e0dfff" : "white" }}
        >
          <img src={moveIcon} className="icon" />
        </button>
        <button
          className="editor-btn"
          onClick={() => changeMode("draw")}
          style={{ backgroundColor: mode === "draw" ? "#e0dfff" : "white" }}
        >
          <img src={drawIcon} className="icon" />
        </button>
        <button
          className="editor-btn"
          onClick={() => changeMode("delete")}
          style={{ backgroundColor: mode === "delete" ? "#e0dfff" : "white" }}
        >
          <img src={deleteIcon} className="icon" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ backgroundColor: "ivory" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onKeyDown={handleKeyPress}
        onContextMenu={e => e.preventDefault()}
        tabIndex={0}
      />
    </>
  );
}

const snapToAngle = (x1, y1, x2, y2) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  if (dx < previewSnapTolerance) return { x2: x1, y2 };
  if (dy < previewSnapTolerance) return { x2, y2: y1 };
  return { x2, y2 };
};

// x2, y2 -> Mouse position
// x, y -> Corner of wall
const snapToCorner = (x1, y1, x2, y2, x, y) => {
  const distance = UTILS.distance(x2, y2, x, y);
  if (distance < wallSnapTolerance) return { x2: x, y2: y };
  return { x2, y2 };
};

const isWithinWall = (x, y, wall) => {
  const { x1, y1, x2, y2 } = wall;
  const diff =
    UTILS.distance(x1, y1, x2, y2) - (UTILS.distance(x1, y1, x, y) + UTILS.distance(x2, y2, x, y));
  return Math.abs(diff) < 1;
};

const getWallAtPosition = (x, y, walls) => {
  return walls.find(wall => isWithinWall(x, y, wall));
};

const deleteWall = (id, walls) => {
  return walls.filter(wall => wall.id !== id);
};
