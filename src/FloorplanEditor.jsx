import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import * as utils from "./utils.js";
import * as dim from "./dim.js";
import moveIcon from "./assets/moveicon.svg";
import drawIcon from "./assets/drawicon.svg";
import deleteIcon from "./assets/deleteicon.svg";

const previewSnapTolerance = 7;
const wallSnapTolerance = 7;
const globalSnapTolerance = 10;
const cornerSnapTolerance = 10;

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
	const rooms = useRef([]);
	const visited = new Set();

	const panOffset = useRef({ x: 0, y: 0 });
	const mousePosOnClick = useRef({ x: 0, y: 0 });

	const [mode, setMode] = useState("draw"); // Fine
	const action = useRef("none");
	const preview = useRef({});
	const activeElement = useRef();

	const mouseDown = useRef(false);
	const mouseMoved = useRef(false);

	const offsetX = useRef(0);
	const offsetY = useRef(0);

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
			console.log("Corners:");
			console.log(corners.current);
			console.log("Walls:");
			console.log(walls.current);
			// console.log("Last Corner:");
			// console.log(lastCorner.current);
			// console.log("Preview:");
			// console.log(preview.current);
			console.log("Active Element:");
			console.log(activeElement.current);
			// formPolygon();
			console.log(rooms.current);
			findRooms();
		}

		if (e.key === "1") changeMode("move");
		if (e.key === "2") changeMode("draw");
		if (e.key === "3") changeMode("delete");
	};

	// Handle resizing
	const handleResize = () => {
		canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
		canvasRef.current.height = window.innerHeight * window.devicePixelRatio;

		canvasRef.current.style.width = `${window.innerWidth}px`;
		canvasRef.current.style.height = `${window.innerHeight}px`;

		contextRef.current.scale(window.devicePixelRatio, window.devicePixelRatio);

		draw();
	};

	// Pan Function
	const pan = (deltaX, deltaY) => {
		const panOffsetCopy = { ...panOffset.current };
		panOffset.current = {
			x: panOffsetCopy.x + deltaX,
			y: panOffsetCopy.y + deltaY,
		};
		draw();
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		contextRef.current = context;

		handleResize();
		window.addEventListener("resize", handleResize);

		const handleWheel = e => {
			pan(-e.deltaX, -e.deltaY);
		};
		window.addEventListener("wheel", handleWheel);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("wheel", handleWheel);
		};
	}, []);

	const drawGrid = context => {
		context.beginPath();
		context.strokeStyle = "#E6E6E6";
		context.lineWidth = 1;

		const offsetX = panOffset.current.x;
		const offsetY = panOffset.current.y;

		for (let x = offsetX; x <= context.canvas.width; x += 40) {
			context.moveTo(x - offsetX, -offsetY);
			context.lineTo(x - offsetX, context.canvas.height + Math.abs(offsetY));
		}
		for (let x = -offsetX + 40; x <= context.canvas.width; x += 40) {
			context.moveTo(-x - offsetX, -offsetY);
			context.lineTo(-x - offsetX, context.canvas.height + Math.abs(offsetY));
		}

		for (let y = offsetY; y <= context.canvas.height; y += 40) {
			context.moveTo(-offsetX, y - offsetY);
			context.lineTo(context.canvas.width + Math.abs(offsetX), y - offsetY);
		}
		for (let y = -offsetY + 40; y <= context.canvas.height; y += 40) {
			context.moveTo(-offsetX, -y - offsetY);
			context.lineTo(context.canvas.width + Math.abs(offsetX), -y - offsetY);
		}
		context.stroke();
	};

	const draw = () => {
		const canvas = canvasRef.current;
		const context = contextRef.current;
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.save();

		context.translate(panOffset.current.x, panOffset.current.y);

		drawGrid(context);

		// Draw rooms
		rooms.current.forEach(room => {
			drawRooms(context, room);
		});

		// Draw walls
		walls.current.forEach(wall => {
			drawWalls(context, convertWall(wall));
		});

		action.current === "drawing" && drawPreview(context);
		if (activeElement.current && mode !== "draw") drawHover(context, activeElement.current);

		walls.current.forEach(wall => {
			drawLabels(context, convertWall(wall));
		});

		context.restore();
	};

	const drawRooms = (context, room) => {
		room = room.map(el => findCorner(el));

		context.beginPath();
		context.moveTo(room[0].x, room[0].y);
		for (let i = 1; i < room.length; i++) {
			context.lineTo(room[i].x, room[i].y);
		}
		context.closePath();
		context.fillStyle = "#ffffff";
		context.fill();
		// context.lineWidth = 6;
		// context.strokeStyle = "#303030";
		// context.stroke();
	};

	const drawLabels = (context, wall) => {
		const length = utils.distance(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
		const pos = {
			x: Math.abs((wall.start.x + wall.end.x) / 2),
			y: Math.abs((wall.start.y + wall.end.y) / 2),
		};
		if (length < 55) return;

		context.font = "normal 12px Arial";
		context.fillStyle = "#000000";
		context.textBaseLine = "middle";
		context.textAlign = "center";
		context.strokeStyle = "#ffffff";
		context.lineWidth = 4;

		context.strokeText(dim.toM(length), pos.x, pos.y);
		context.fillText(dim.toM(length), pos.x, pos.y);
	};

	const drawLine = (context, x1, y1, x2, y2, width, colour, lineCap) => {
		lineCap = lineCap || false;
		context.beginPath();
		context.strokeStyle = colour;
		context.lineWidth = width;
		context.lineCap = lineCap;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
		context.lineWidth = 1;
	};

	const drawCircle = (context, x, y, colour) => {
		context.beginPath();
		context.fillStyle = colour;
		context.arc(x, y, 7, 0, 2 * Math.PI);
		context.fill();
	};

	const drawPreview = context => {
		const { start, end } = preview.current;
		drawLine(context, start.x, start.y, end.x, end.y, 6, "blue", "round");
		drawCircle(context, end.x, end.y, "blue");
	};

	const drawHover = (context, { element, type }) => {
		const colour = mode === "move" ? "lightgreen" : mode === "delete" ? "red" : null;

		if (type === "corner") {
			const { x, y } = element;
			drawCircle(context, x, y, colour);
		} else if (type === "wall") {
			const { start, end } = element;
			drawLine(context, start.x, start.y, end.x, end.y, 7, colour, "round");
		}
	};

	const drawWalls = (context, { start, end }) => {
		drawLine(context, start.x, start.y, end.x, end.y, 6, "#303030", "round");
	};

	const getMouseCoordinates = e => {
		const clientX = e.clientX - panOffset.current.x;
		const clientY = e.clientY - panOffset.current.y;
		return { clientX, clientY };
	};

	const snapToAxis = activeCorner => {
		let connectedWalls = walls.current.filter(
			wall => activeCorner.id === wall.startId || activeCorner.id === wall.endId
		);

		if (activeElement.current.type === "wall") {
			connectedWalls = connectedWalls.filter(wall => wall.id !== activeElement.current.element.id);
		}

		const adjCorners = [];
		connectedWalls.forEach(wall => {
			if (wall.startId !== activeCorner.id) adjCorners.push(findCorner(wall.startId));
			if (wall.endId !== activeCorner.id) adjCorners.push(findCorner(wall.endId));
		});

		adjCorners.forEach(corner => {
			if (corner.id === activeCorner.id) return;
			if (Math.abs(corner.x - activeCorner.x) < globalSnapTolerance) {
				activeCorner.x = corner.x;
			}
			if (Math.abs(corner.y - activeCorner.y) < globalSnapTolerance) {
				activeCorner.y = corner.y;
			}
		});
	};

	const movePreview = (clientX, clientY) => {
		var [x1, y1] = [preview.current.start.x, preview.current.start.y];
		var [x2, y2] = [clientX, clientY];

		if (Math.abs(x2 - x1) < globalSnapTolerance) x2 = x1;
		if (Math.abs(y2 - y1) < globalSnapTolerance) y2 = y1;

		preview.current = { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } };
	};

	const updateToActive = () => {
		if (activeElement.current && activeElement.current.type === "corner") {
			const updatedCorners = corners.current.map(corner => {
				if (corner.id === activeElement.current.element.id)
					return {
						x: activeElement.current.element.x,
						y: activeElement.current.element.y,
						id: corner.id,
					};
				return corner;
			});
			corners.current = updatedCorners;
		}
		if (activeElement.current && activeElement.current.type === "wall") {
			const updatedCorners = corners.current.map(corner => {
				if (corner.id === activeElement.current.element.start.id)
					return {
						x: activeElement.current.element.start.x,
						y: activeElement.current.element.start.y,
						id: corner.id,
					};
				if (corner.id === activeElement.current.element.end.id)
					return {
						x: activeElement.current.element.end.x,
						y: activeElement.current.element.end.y,
						id: corner.id,
					};
				return corner;
			});
			corners.current = updatedCorners;
		}
	};

	const handleMouseDown = e => {
		if (e.button === 1 || e.button === 2 || e.button === 3) return;
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseDown.current = true;
		mouseMoved.current = false;
		mousePosOnClick.current = { x: clientX, y: clientY };

		// Move
		if (mode === "move" && activeElement.current) {
			canvasRef.current.style.cursor = "grabbing";
			if (activeElement.current.type === "wall") {
				offsetX.current = clientX - activeElement.current.element.start.x;
				offsetY.current = clientY - activeElement.current.element.start.y;
			}
		}

		// Delete
		if (mode === "delete") {
			if (activeElement.current) {
				deleteElement(activeElement.current);
				findRooms();
				draw();
			}
		}
	};

	const handleMouseMove = e => {
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseMoved.current = true;

		// Update object target
		if (mode !== "draw" && !mouseDown.current) {
			activeElement.current = getElementAtPosition(clientX, clientY);
			draw();
		}

		if (mode === "move" && activeElement.current) {
			canvasRef.current.style.cursor = "grab";
		} else {
			canvasRef.current.style.cursor = "default";
		}

		// Dragging
		if (mode === "move" && mouseDown.current && activeElement.current) {
			canvasRef.current.style.cursor = "grabbing";
			action.current = "moving";
			move(clientX, clientY);
			mergeWithIntersected();
			updateToActive();
			fixWalls();
			findRooms();
			draw();
		}

		// Preview
		if (action.current === "drawing" && mode === "draw") {
			movePreview(clientX, clientY);
			draw();
		}

		// Panning
		if (mouseDown.current && action.current !== "moving") {
			const deltaX = clientX - mousePosOnClick.current.x;
			const deltaY = clientY - mousePosOnClick.current.y;
			pan(deltaX, deltaY);
		}
	};

	const handleMouseUp = e => {
		if (e.button === 1 || e.button === 2 || e.button === 3) return;
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseDown.current = false;

		// Drawing
		if (mode === "draw" && !mouseMoved.current) {
			createWall(clientX, clientY);
			fixWalls();
			findRooms();
			draw();
		}

		if (mode === "move" && activeElement.current) {
			canvasRef.current.style.cursor = "grab";
		}

		if (mode === "move") {
			action.current = "none";
		}
	};

	const startPreview = (x, y) => {
		corners.current.forEach(corner => {
			if (utils.distance(x, y, corner.x, corner.y) < cornerSnapTolerance) {
				x = corner.x;
				y = corner.y;
				lastCorner.current = corner;
			}
		});
		preview.current = { start: { x, y }, end: { x, y } };
	};

	const createWall = (x, y) => {
		if (action.current !== "drawing") {
			action.current = "drawing";
			startPreview(x, y);
		} else if (action.current === "drawing") {
			const startCornerId = uuidv4();
			const endCornerId = uuidv4();

			const startCorner = isEmpty(lastCorner.current)
				? { ...preview.current.start, id: startCornerId }
				: lastCorner.current;

			let endCorner = { ...preview.current.end, id: endCornerId };

			isEmpty(lastCorner.current) && corners.current.push(startCorner);
			corners.current.push(endCorner);

			walls.current.push({
				startId: startCorner.id,
				endId: endCorner.id,
				id: uuidv4(),
			});

			const previewCopy = { ...preview.current };
			preview.current = { start: previewCopy.end, end: { x: endCorner.x, y: endCorner.y } };
			activeElement.current = { element: startCorner, type: "corner" };
			mergeWithIntersected();
			activeElement.current = { element: endCorner, type: "corner" };
			mergeWithIntersected();
			lastCorner.current = activeElement.current.element;
			endCorner = activeElement.current.element;

			if (startCorner.x === endCorner.x && startCorner.y === endCorner.y) {
				preview.current = {};
				action.current = "none";
				lastCorner.current = {};
				return;
			}
		}
	};

	const findRooms = () => {
		const visitedCorners = new Set();
		const polygons = [];

		const findPolygon = (startCorner, currentCorner, polygonCorners, prevWall, visitedWalls) => {
			visitedCorners.add(startCorner);
			// visitedCorners.add(currentCorner);
			polygonCorners.push(currentCorner);

			const currentWalls = walls.current.filter(
				wall =>
					(wall.startId === currentCorner || wall.endId === currentCorner) &&
					wall.id !== prevWall?.id &&
					!visitedWalls.has(wall.id)
			);

			if (currentWalls.length === 0) {
				return false;
			}

			if (currentWalls.length === 1) {
				visitedCorners.add(currentCorner);
			}

			let verdict;

			currentWalls.forEach(currentWall => {
				let nextCorner;
				if (currentWall.startId === currentCorner) nextCorner = currentWall.endId;
				if (currentWall.endId === currentCorner) nextCorner = currentWall.startId;

				visitedWalls.add(currentWall.id);

				if (nextCorner === startCorner && polygonCorners.length > 2) {
					polygons.push(polygonCorners.slice());
					verdict = true;
					return true;
				}

				if (visitedCorners.has(nextCorner)) {
					verdict = false;
					return false;
				}

				const success = findPolygon(
					startCorner,
					nextCorner,
					polygonCorners,
					currentWall,
					visitedWalls
				);

				if (!success) {
					visitedCorners.delete(nextCorner);
					polygonCorners.pop();
				}

				verdict = success;
			});

			return verdict;
		};

		for (const corner of corners.current) {
			if (!visitedCorners.has(corner.id)) {
				findPolygon(corner.id, corner.id, [], null, new Set());
			}
		}

		rooms.current = polygons;
	};

	const move = (clientX, clientY) => {
		if (activeElement.current.type === "wall") {
			const newX1 = clientX - offsetX.current;
			const newY1 = clientY - offsetY.current;
			const { start, end } = activeElement.current.element;

			activeElement.current.element.start = {
				x: newX1,
				y: newY1,
				id: activeElement.current.element.start.id,
			};
			activeElement.current.element.end = {
				x: newX1 + (end.x - start.x),
				y: newY1 + (end.y - start.y),
				id: activeElement.current.element.end.id,
			};
			snapToAxis(activeElement.current.element.start);
			snapToAxis(activeElement.current.element.end);
		} else if (activeElement.current.type === "corner") {
			const newX1 = clientX;
			const newY1 = clientY;

			activeElement.current.element = { x: newX1, y: newY1, id: activeElement.current.element.id };
			snapToAxis(activeElement.current.element);
		}
	};

	const checkIntersected = activeCorner => {
		var snapped = false;
		// Checks corners
		corners.current.forEach(corner => {
			if (
				utils.distance(activeCorner.x, activeCorner.y, corner.x, corner.y) < cornerSnapTolerance &&
				corner.id !== activeCorner.id
			) {
				snapped = true;
				combineWithCorner(corner, activeCorner.id);
			}
		});

		// Checks walls
		if (snapped) return;
		const wallsToCheck = walls.current.filter(wall => {
			if (wall.startId === activeCorner.id || wall.endId === activeCorner.id) return false;
			return true;
		});
		wallsToCheck.forEach(wall => {
			const w = convertWall(wall);
			if (isWithinWall(activeCorner.x, activeCorner.y, w)) {
				combineWithWall(w, activeCorner);
			}
		});
	};

	const mergeWithIntersected = () => {
		if (activeElement.current.type === "corner") {
			checkIntersected(activeElement.current.element);
		} else if (activeElement.current.type === "wall") {
			checkIntersected(activeElement.current.element.start);
			checkIntersected(activeElement.current.element.end);
		}
	};

	const combineWithWall = (wall, activeCorner) => {
		const point = utils.closestPointOnLine(
			activeCorner.x,
			activeCorner.y,
			wall.start.x,
			wall.start.y,
			wall.end.x,
			wall.end.y
		);

		if (activeElement.current.type === "wall") {
			if (activeElement.current.element.start.id === activeCorner.id) {
				activeElement.current.element.start.x = point.x;
				activeElement.current.element.start.y = point.y;
			} else if (activeElement.current.element.end.id === activeCorner.id) {
				activeElement.current.element.end.x = point.x;
				activeElement.current.element.end.y = point.y;
			}
		} else if (activeElement.current.type === "corner") {
			activeElement.current.element.x = point.x;
			activeElement.current.element.y = point.y;
		}

		walls.current.push(
			{ startId: wall.start.id, endId: activeCorner.id, id: uuidv4() },
			{ startId: activeCorner.id, endId: wall.end.id, id: uuidv4() }
		);

		walls.current = walls.current.filter(w => w.id !== wall.id);
	};

	const combineWithCorner = (corner, id) => {
		const updatedWalls = walls.current.map(wall => {
			if (wall.startId === id) {
				return { startId: corner.id, endId: wall.endId, id: wall.id };
			}
			if (wall.endId === id) {
				return { startId: wall.startId, endId: corner.id, id: wall.id };
			}
			return wall;
		});
		walls.current = updatedWalls;
		const deleteID = id;

		if (activeElement.current.type === "wall") {
			if (activeElement.current.element.start.id === id) {
				activeElement.current.element.start = corner;
			} else if (activeElement.current.element.end.id === id) {
				activeElement.current.element.end = corner;
			}
		} else if (activeElement.current.type === "corner") {
			activeElement.current.element = corner;
		}

		const updatedCorners = corners.current.filter(c => c.id !== deleteID);
		corners.current = updatedCorners;
	};

	const fixWalls = () => {
		var deleteID;
		const updatedWalls = walls.current.filter(wall => {
			if (wall.startId === wall.endId) {
				deleteID = wall.startId;
				activeElement.current = null;
				mouseDown.current = false;
				return false;
			}
			return true;
		});

		walls.current = updatedWalls;

		const inOtherWalls = walls.current.some(
			wall => wall.startId === deleteID || wall.endId === deleteID
		);

		if (!inOtherWalls) {
			corners.current = corners.current.filter(corner => corner.id !== deleteID);
		}

		const stackedWalls = findStackedWalls();
		if (stackedWalls) {
			// Need to fix this. Make a square and close it on itself, see what happens
			activeElement.current = { element: convertWall(stackedWalls.switch), type: "wall" };
			walls.current = walls.current.filter(wall => wall.id !== stackedWalls.delete.id);
		}
	};

	const findStackedWalls = () => {
		for (let i = 0; i < walls.current.length; i++) {
			const wall1 = walls.current[i];
			for (let j = i + 1; j < walls.current.length; j++) {
				const wall2 = walls.current[j];
				if (
					(wall1.startId === wall2.startId && wall1.endId === wall2.endId) ||
					(wall1.startId === wall2.endId && wall1.endId === wall2.startId)
				) {
					return { switch: wall1, delete: wall2 };
				}
			}
		}
		return null;
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
			utils.distance(start.x, start.y, end.x, end.y) -
			(utils.distance(start.x, start.y, x, y) + utils.distance(end.x, end.y, x, y));
		return Math.abs(diff) < 0.2;
	};

	const isWithinCorner = (mouseX, mouseY, { x, y }) => {
		return utils.distance(mouseX, mouseY, x, y) < 10;
	};

	const getElementAtPosition = (x, y) => {
		const wallFound = walls.current.find(wall => isWithinWall(x, y, convertWall(wall)));
		const cornerFound = corners.current.find(corner => isWithinCorner(x, y, corner));

		if (cornerFound) {
			return { element: cornerFound, type: "corner" };
		} else if (wallFound) {
			return { element: convertWall(wallFound), type: "wall" };
		} else {
			return undefined;
		}
	};

	const deleteElement = ({ element, type }) => {
		const id = element.id;
		if (type === "wall") {
			const updatedWalls = walls.current.filter(wall => wall.id !== id);
			walls.current = updatedWalls;
			const updatedCorners = corners.current.filter(corner => {
				if (!isCornerInOtherWalls(corner.id)) {
					if (corner.id === element.start.id || corner.id === element.end.id) return false;
				}
				return true;
			});
			corners.current = updatedCorners;
		} else if (type === "corner") {
			walls.current.map(wall => {
				if (wall.startId === id || wall.endId === id)
					deleteElement({ element: convertWall(wall), type: "wall" });
			});
			const updatedCorners = corners.current.filter(corner => corner.id !== id);
			corners.current = updatedCorners;
		}
		activeElement.current = undefined;
	};

	const isCornerInOtherWalls = id => {
		return walls.current.some(wall => wall.startId === id || wall.endId === id);
	};

	const changeMode = newMode => {
		setMode(newMode);
		action.current = "none";
		preview.current = {};
		lastCorner.current = {};
		activeElement.current = null;
		draw();
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
				style={{ backgroundColor: "#ffffff" }}
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

const isEmpty = obj => {
	return Object.keys(obj).length === 0;
};
