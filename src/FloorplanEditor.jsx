import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import * as UTILS from "./utils.js";
import moveIcon from "./assets/moveicon.svg";
import drawIcon from "./assets/drawicon.svg";
import deleteIcon from "./assets/deleteicon.svg";

const previewSnapTolerance = 7;
const wallSnapTolerance = 7;
const globalSnapTolerance = 5;

// Grid parameters
const gridSpacing = 20;
const gridWidth = 1;
const gridColour = "#ddd";

// May be a good idea to combine multiple refs into one useRef, and destructure them when needed
export default function FloorplanEditor() {
  console.log("floorplan render");
  const canvasRef = useRef();
  const contextRef = useRef();

  const walls = useRef([]);
  const corners = useRef([]);
  const lastCorner = useRef({});

  const panOffset = useRef({ x: 0, y: 0 });
  const startPanMousePosition = useRef({ x: 0, y: 0 });

  const [mode, setMode] = useState("draw"); // Fine
  const action = useRef("none");
  const preview = useRef({});
  const selectedElement = useRef(null);
  const hoveredElement = useRef(null);

  const mouseDown = useRef(false);
  const mouseMoved = useRef(false);

  const originX = useRef(0);
  const originY = useRef(0);

  // Key down detection
  const handleKeyPress = e => {
    if (e.key === "Escape") {
      if (action.current === "drawing") {
        action.current = "none";
        preview.current = {};
        lastCorner.current = {};
        draw();
      }
    }
    // Console logs
    if (e.key === "l") {
      console.log(corners.current);
      console.log(walls.current);
    }
  };

  // Handle resizing
  const handleResize = () => {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    draw();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    contextRef.current = context;

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const drawGrid = context => {
    context.beginPath();
    context.strokeStyle = "#ddd";

    const offsetX = panOffset.current.x;
    const offsetY = panOffset.current.y;

    for (let x = offsetX; x <= context.canvas.width; x += 20) {
      context.moveTo(x - offsetX, -offsetY);
      context.lineTo(x - offsetX, context.canvas.height + Math.abs(offsetY));
    }
    for (let x = -offsetX + 20; x <= context.canvas.width; x += 20) {
      context.moveTo(-x - offsetX, -offsetY);
      context.lineTo(-x - offsetX, context.canvas.height + Math.abs(offsetY));
    }

    for (let y = offsetY; y <= context.canvas.height; y += 20) {
      context.moveTo(-offsetX, y - offsetY);
      context.lineTo(context.canvas.width + Math.abs(offsetX), y - offsetY);
    }
    for (let y = -offsetY + 20; y <= context.canvas.height; y += 20) {
      context.moveTo(-offsetX, -y - offsetY);
      context.lineTo(context.canvas.width + Math.abs(offsetX), -y - offsetY);
    }
    context.stroke();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.translate(panOffset.current.x, panOffset.current.y);

    drawGrid(context);
    mode === "draw" && drawPreview(context);

    // Draw walls
    walls.current.forEach(wall => {
      const actualWall = convertWall(wall);
      drawWalls(context, actualWall);
    });

    hoveredElement.current !== null ? drawHover(context, hoveredElement.current) : null;

    context.restore();
  };

  const drawLine = (context, x1, y1, x2, y2, width, colour) => {
    context.beginPath();
    context.strokeStyle = colour;
    context.lineWidth = width;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.lineWidth = 1;
  };

  const drawCircle = (context, x, y, colour) => {
    context.beginPath();
    context.fillStyle = colour;
    context.arc(x, y, 8, 0, 2 * Math.PI);
    context.fill();
  };

  const drawPreview = context => {
    const { x1, y1, x2, y2 } = preview.current;
    drawLine(context, x1, y1, x2, y2, 6, "blue");
  };

  const drawHover = (context, { element, type }) => {
    const colour = mode === "move" ? "lightgreen" : mode === "delete" ? "red" : null;

    if (type === "corner") {
      const { x, y } = element;
      drawCircle(context, x, y, colour);
    } else if (type === "wall") {
      const { start, end } = convertWall(element);
      drawLine(context, start.x, start.y, end.x, end.y, 7, colour);
    }
  };

  const drawWalls = (context, { start, end }) => {
    drawLine(context, start.x, start.y, end.x, end.y, 6, "black");
  };

  const getMouseCoordinates = e => {
    const clientX = e.clientX - panOffset.current.x;
    const clientY = e.clientY - panOffset.current.y;
    return { clientX, clientY };
  };

  const handleMouseDown = e => {
    if (e.button === 1 || e.button === 2 || e.button === 3) return;
    const { clientX, clientY } = getMouseCoordinates(e);
    mouseDown.current = true;
    mouseMoved.current = false;
    startPanMousePosition.current = { x: clientX, y: clientY };

    if (mode === "move") {
      const obj = getElementAtPosition(clientX, clientY);
      if (obj) {
        action.current = "moving";
        if (obj.type === "wall") {
          const wall = convertWall(obj.element);
          const offsetX = clientX - wall.start.x;
          const offsetY = clientY - wall.start.y;
          selectedElement.current = { ...obj, offsetX, offsetY };
        } else if (obj.type === "corner") {
          const offsetX = clientX - obj.element.x;
          const offsetY = clientY - obj.element.y;
          selectedElement.current = { ...obj, offsetX, offsetY };
        }
      }
    }

    if (mode === "delete") {
      const obj = getElementAtPosition(clientX, clientY);
      if (obj) {
        deleteElement(obj);
        hoverCheck(clientX, clientY);
      }
    }
  };

  const handleMouseMove = e => {
    const { clientX, clientY } = getMouseCoordinates(e);
    mouseMoved.current = true;

    if (mouseDown.current && action.current !== "moving") {
      const deltaX = clientX - startPanMousePosition.current.x;
      const deltaY = clientY - startPanMousePosition.current.y;

      originX.current += startPanMousePosition.current.x - clientX;
      originY.current += startPanMousePosition.current.y - clientY;

      const panOffsetCopy = { ...panOffset.current };
      panOffset.current = {
        x: panOffsetCopy.x + deltaX,
        y: panOffsetCopy.y + deltaY,
      };
      draw();
    }

    if (action.current === "drawing" && mode === "draw") {
      const { x1, y1 } = preview.current;
      var { x2, y2 } = snapToAngle(x1, y1, clientX, clientY);
      preview.current = { x1, y1, x2, y2 };
      draw();
    } else if (action.current === "moving" && mode === "move") {
      const { element, type, offsetX, offsetY } = selectedElement.current;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      updateElement(element, type, newX1, newY1);
      snapAdjacent();
      draw();
    }

    if (mode === "move" || mode === "delete") {
      hoverCheck(clientX, clientY);
    }
  };

  const handleMouseUp = e => {
    if (e.button === 1 || e.button === 2 || e.button === 3) return;
    const { clientX, clientY } = getMouseCoordinates(e);
    mouseDown.current = false;

    if (mode === "draw" && !mouseMoved.current) {
      if (action.current !== "drawing") {
        action.current = "drawing";
        preview.current = { x1: clientX, y1: clientY, x2: clientX, y2: clientY };
      } else if (action.current === "drawing") {
        const startCornerId = uuidv4();
        const endCornerId = uuidv4();

        const startCorner = isEmpty(lastCorner.current)
          ? { x: preview.current.x1, y: preview.current.y1, id: startCornerId }
          : lastCorner.current;

        const endCorner = { x: preview.current.x2, y: preview.current.y2, id: endCornerId };

        isEmpty(lastCorner.current) && corners.current.push(startCorner);
        corners.current.push(endCorner);

        lastCorner.current = { x: preview.current.x2, y: preview.current.y2, id: endCornerId };

        walls.current.push({
          startId: startCorner.id,
          endId: endCorner.id,
          id: `${startCorner.id}-${endCorner.id}`,
        });

        // if 2 corners are next to each other (using a tolerance), the new corner should replace the old corner

        const previewCopy = { ...preview.current };
        preview.current = { x1: previewCopy.x2, y1: previewCopy.y2, x2: clientX, y2: clientY };
      }
    }
    if (mode === "move") {
      action.current = "none";
      selectedElement.current = null;
    }
  };

  const snapAdjacent = () => {
    const corner1 = findCorner(selectedElement.current.element.startId);
    const corner2 = findCorner(selectedElement.current.element.endId);

    corners.current.forEach(corner => {
      if (Math.abs(corner.x - corner1.x) < globalSnapTolerance) {
        corner1.x = corner.x;
      }
      if (Math.abs(corner.x - corner2.x) < globalSnapTolerance) {
        corner2.x = corner.x;
      }
      if (Math.abs(corner.y - corner1.y) < globalSnapTolerance) {
        corner1.y = corner.y;
      }
      if (Math.abs(corner.y - corner2.y) < globalSnapTolerance) {
        corner2.y = corner.y;
      }
    });
  };

  // Gets coordinates of wall using their ids
  const convertWall = ({ startId, endId, id }) => {
    return { start: findCorner(startId), end: findCorner(endId), id };
  };

  const findCorner = id => corners.current.find(corner => corner.id === id);

  const handleMouseLeave = e => {
    mouseDown.current = false;
  };

  const isWithinWall = (x, y, { start, end }) => {
    const diff =
      UTILS.distance(start.x, start.y, end.x, end.y) -
      (UTILS.distance(start.x, start.y, x, y) + UTILS.distance(end.x, end.y, x, y));
    return Math.abs(diff) < 0.5;
  };

  const isWithinCorner = (mouseX, mouseY, { x, y }) => {
    return UTILS.distance(mouseX, mouseY, x, y) < 10;
  };

  const getElementAtPosition = (x, y) => {
    const wallFound = walls.current.find(wall => isWithinWall(x, y, convertWall(wall)));
    const cornerFound = corners.current.find(corner => isWithinCorner(x, y, corner));

    if (cornerFound) {
      return { element: cornerFound, type: "corner" };
    } else if (wallFound) {
      return { element: wallFound, type: "wall" };
    } else {
      return undefined;
    }
  };

  const hoverCheck = (clientX, clientY) => {
    const obj = getElementAtPosition(clientX, clientY);
    if (obj) {
      hoveredElement.current = obj;
    } else {
      hoveredElement.current = null;
    }
    draw();
  };

  const updateElement = (element, type, newX1, newY1) => {
    if (type === "wall") {
      const wall = convertWall(element);
      const { start, end } = wall;
      const wallToUpdate = walls.current.find(wall => wall.id === element.id);

      const startCorner = findCorner(wallToUpdate.startId);
      const endCorner = findCorner(wallToUpdate.endId);

      const updatedCorners = corners.current.map(corner => {
        if (corner.id === startCorner.id) return { x: newX1, y: newY1, id: startCorner.id };
        if (corner.id === endCorner.id)
          return { x: newX1 + (end.x - start.x), y: newY1 + (end.y - start.y), id: endCorner.id };
        return corner;
      });
      corners.current = updatedCorners;
    } else if (type === "corner") {
      const cornerToUpdate = findCorner(element.id);

      const updatedCorners = corners.current.map(corner => {
        if (corner.id === cornerToUpdate.id) return { x: newX1, y: newY1, id: corner.id };
        return corner;
      });
      corners.current = updatedCorners;
    }
  };

  const deleteElement = ({ element, type }) => {
    const id = element.id;
    if (type === "wall") {
      const updatedWalls = walls.current.filter(wall => wall.id !== id);
      walls.current = updatedWalls;
      const updatedCorners = corners.current.filter(corner => {
        if (!isCornerInOtherWalls(corner.id)) {
          if (corner.id === element.startId || corner.id === element.endId) return false;
        }
        return true;
      });
      corners.current = updatedCorners;
    } else if (type === "corner") {
      walls.current.map(wall => {
        if (wall.startId === id || wall.endId === id)
          deleteElement({ element: wall, type: "wall" });
      });
      const updatedCorners = corners.current.filter(corner => corner.id !== id);
      corners.current = updatedCorners;
    }
  };

  // const snapCorners = () => {
  // 	if (corners.current.length < 3) return;
  // 	const corners = [...corners.current];
  // 	for (let i = 0; i < corners.length; i++) {
  // 		const corner1 = corners[i];
  // 		for (let j = i + 1; j < corners.length; j++) {
  // 			const corner2 = corners[j];
  // 			const distance = UTILS.distance(corner1.x, corner1.y, corner2.x, corner2.y);
  // 			if (distance < globalSnapTolerance) {
  // 				// Corner you're moving / placing should be deleted, and selectedElement should become the corner where
  // 				// distance < globalSnapTolerance. Need a way to tell which corner is being moved. Something like
  // 				// if selectedElement is of type corner, and is equal to corner1 or corner2, then delete the corner it is not
  // 				// equal to.
  // 				//
  // 				// OR corner you're moving / placing should have its position set to the corner it's close to, and the previous
  // 				// corner should be deleted.
  // 				//
  // 				// When drawing, how would I handle it? In this case, corner2 should be the corner which was just drawn, so I can
  // 				// set corner2's x and y values to corner1's, and delete corner1.
  // 				var updatedCorners = corners.current.map((corner) => {
  // 					if (corner.id === corner2.id) return { x: corner1.x, y: corner1.y, id: corner.id };
  // 					return corner;
  // 				});
  // 				updatedCorners = updatedCorners.filter((corner) => corner.id !== corner1.id);
  // 				corners.current = updatedCorners;
  // 			}
  // 		}
  // 	}
  // };

  const isCornerInOtherWalls = id => {
    return walls.current.some(wall => wall.startId === id || wall.endId === id);
  };

  const changeMode = newMode => {
    setMode(newMode);
    action.current = "none";
    preview.current = {};
    lastCorner.current = {};
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
        onMouseLeave={handleMouseLeave}
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

const isEmpty = obj => {
  return Object.keys(obj).length === 0;
};
