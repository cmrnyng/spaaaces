import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import * as UTILS from "./utils.js";
import moveIcon from "./assets/moveicon.svg";
import drawIcon from "./assets/drawicon.svg";
import deleteIcon from "./assets/deleteicon.svg";

const previewSnapTolerance = 7;
const wallSnapTolerance = 7;

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

	const panOffset = useRef({ x: 0, y: 0 });
	const startPanMousePosition = useRef({ x: 0, y: 0 });

	const [mode, setMode] = useState("draw"); // Fine
	const action = useRef("none");
	const preview = useRef({});
	const selectedWall = useRef(null);

	const mouseDown = useRef(false);
	const mouseMoved = useRef(false);

	const originX = useRef(0);
	const originY = useRef(0);

	// Key down detection
	const handleKeyPress = (e) => {
		if (e.key === "Escape") {
			if (action.current === "drawing") {
				action.current = "none";
				preview.current = {};
				draw();
			}
		}
		// Console logs
		if (e.key === "l") {
			console.log(corners);
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

	const drawGrid = (context) => {
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
		walls.current.forEach((wall) => {
			drawWalls(context, wall);
		});

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

	const drawPreview = (context) => {
		const { x1, y1, x2, y2 } = preview.current;
		drawLine(context, x1, y1, x2, y2, 6, "blue");
	};

	const drawWalls = (context, { x1, y1, x2, y2 }) => {
		drawLine(context, x1, y1, x2, y2, 6, "black");
	};

	const getMouseCoordinates = (e) => {
		const clientX = e.clientX - panOffset.current.x;
		const clientY = e.clientY - panOffset.current.y;
		return { clientX, clientY };
	};

	const handleMouseDown = (e) => {
		if (e.button === 1 || e.button === 2 || e.button === 3) return;
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseDown.current = true;
		mouseMoved.current = false;
		startPanMousePosition.current = { x: clientX, y: clientY };

		if (mode === "move") {
			const wall = getWallAtPosition(clientX, clientY, walls.current);
			if (wall) {
				action.current = "moving";
				const offsetX = clientX - wall.x1;
				const offsetY = clientY - wall.y1;
				selectedWall.current = { ...wall, offsetX, offsetY };
			}
		}

		if (mode === "delete") {
			const wall = getWallAtPosition(clientX, clientY, walls.current);
			if (wall) {
				walls.current = deleteWall(wall.id, walls.current);
				draw();
			}
		}
	};

	const handleMouseMove = (e) => {
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
			const { id, x1, y1, x2, y2, offsetX, offsetY } = selectedWall.current;
			const newX1 = clientX - offsetX;
			const newY1 = clientY - offsetY;
			updateWall(id, newX1, newY1, newX1 + (x2 - x1), newY1 + (y2 - y1));
			draw();
		}
	};

	const handleMouseUp = (e) => {
		if (e.button === 1 || e.button === 2 || e.button === 3) return;
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseDown.current = false;

		if (mode === "draw" && !mouseMoved.current) {
			if (action.current !== "drawing") {
				action.current = "drawing";
				preview.current = { x1: clientX, y1: clientY, x2: clientX, y2: clientY };
			} else if (action.current === "drawing") {
				const id = uuidv4();
				const startCorner = { x: preview.current.x1, y: preview.current.y1, id: uuidv4() };
				const endCorner = { x: preview.current.x2, y: preview.current.y2, id: uuidv4() };
				corners.current.push(startCorner, endCorner);

				// if 2 corners are next to each other (using a tolerance), the new corner should replace the old corner
				walls.current.push({ id, ...preview.current });

				const previewCopy = { ...preview.current };
				preview.current = { x1: previewCopy.x2, y1: previewCopy.y2, x2: clientX, y2: clientY };
			}
		}
		if (mode === "move") {
			action.current = "none";
			selectedWall.current = null;
		}
	};

	const createWall = (startCorner, endCorner) => {
		const id = `${startCorner.id}-${endCorner.id}`;
		return { start: startCorner, end: endCorner, id };
	};

	const handleMouseLeave = (e) => {
		mouseDown.current = false;
	};

	const updateWall = (id, x1, y1, x2, y2) => {
		const updatedWall = { id, x1, y1, x2, y2 };

		const updatedWalls = walls.current.map((wall) => {
			if (wall.id === id) return updatedWall;
			return wall;
		});

		walls.current = updatedWalls;
	};

	const changeMode = (newMode) => {
		setMode(newMode);
		action.current = "none";
		preview.current = {};
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
				onContextMenu={(e) => e.preventDefault()}
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

const isWithinWall = (x, y, wall) => {
	const { x1, y1, x2, y2 } = wall;
	const diff =
		UTILS.distance(x1, y1, x2, y2) - (UTILS.distance(x1, y1, x, y) + UTILS.distance(x2, y2, x, y));
	return Math.abs(diff) < 1;
};

const getWallAtPosition = (x, y, walls) => {
	return walls.find((wall) => isWithinWall(x, y, wall));
};

const deleteWall = (id, walls) => {
	return walls.filter((wall) => wall.id !== id);
};

// const calculateGridOffset = n => {
//   if (n >= 0) {
//     return ((n + gridSpacing / 2) % gridSpacing) - gridSpacing / 2;
//   } else {
//     return ((n - gridSpacing / 2) % gridSpacing) + gridSpacing / 2;
//   }
// };

const calculateGridOffset = (n, canvasSize) => {
	if (n >= 0) {
		return ((n + gridSpacing / 2) % gridSpacing) - (gridSpacing / 2 - (n % canvasSize));
	} else {
		return (
			((n - gridSpacing / 2) % gridSpacing) +
			(gridSpacing / 2 + (canvasSize - Math.abs(n % canvasSize)))
		);
	}
};
