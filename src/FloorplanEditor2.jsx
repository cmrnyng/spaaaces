import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import * as UTILS from "./utils.js";
import moveIcon from "./assets/moveicon.svg";
import drawIcon from "./assets/drawicon.svg";
import deleteIcon from "./assets/deleteicon.svg";

const previewSnapTolerance = 7;
const wallSnapTolerance = 7;
const globalSnapTolerance = 10;

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
	const mousePosOnClick = useRef({ x: 0, y: 0 });

	const [mode, setMode] = useState("draw"); // Fine
	const action = useRef("none");
	const preview = useRef({});
	const activeElement = useRef();

	const mouseDown = useRef(false);
	const mouseMoved = useRef(false);

	const originX = useRef(0);
	const originY = useRef(0);
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
			console.log(corners.current);
			console.log(walls.current);
			console.log(activeElement.current);
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
		action.current === "drawing" && drawPreview(context);

		// Draw walls
		walls.current.forEach(wall => {
			drawWalls(context, convertWall(wall));
		});

		if (activeElement.current) drawHover(context, activeElement.current);

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
		const { start, end } = preview.current;
		drawLine(context, start.x, start.y, end.x, end.y, 6, "blue");
	};

	const drawHover = (context, { element, type }) => {
		const colour = mode === "move" ? "lightgreen" : mode === "delete" ? "red" : null;

		if (type === "corner") {
			const { x, y } = element;
			drawCircle(context, x, y, colour);
		} else if (type === "wall") {
			const { start, end } = element;
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

	// const updateTarget = (clientX, clientY) => {
	//   if (mode === "draw" && lastCorner.current) {
	//     if (Math.abs(clientX - lastCorner.current.x) < previewSnapTolerance) {
	//       preview.current.end.x =
	//     }
	//   }
	// };

	const snapToAxis = activeCorner => {
		corners.current.forEach(corner => {
			if (corner.id === activeCorner.id) return;
			if (Math.abs(corner.x - activeCorner.x) < globalSnapTolerance) {
				activeCorner.x = corner.x;
			}
			if (Math.abs(corner.y - activeCorner.y) < globalSnapTolerance) {
				activeCorner.y = corner.y;
			}
		});
		updateToActive();
	};

	const snapToAxis2 = activeCorner => {
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		if (dx < previewSnapTolerance) return { x2: x1, y2 };
		if (dy < previewSnapTolerance) return { x2, y2: y1 };
		return { x2, y2 };
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
			if (activeElement.current.type === "wall") {
				offsetX.current = clientX - activeElement.current.element.start.x;
				offsetY.current = clientY - activeElement.current.element.start.y;
			}
		}

		// Delete
		if (mode === "delete") {
			if (activeElement.current) {
				deleteElement(activeElement.current);
				draw();
			}
		}
	};

	const handleMouseMove = e => {
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseMoved.current = true;

		// if (
		//   (mode === "draw" && action.current === "drawing") ||
		//   (mode === "move" && action.current === "moving")
		// ) {
		//   updateTarget(clientX, clientY);
		// }

		// Update object target
		if (mode !== "draw" && !mouseDown.current) {
			activeElement.current = getElementAtPosition(clientX, clientY);
			draw();
		}

		// Dragging
		if (mode === "move" && mouseDown.current) {
			if (activeElement.current && activeElement.current.type === "corner") {
				move(clientX, clientY);
				snapToAxis(activeElement.current.element);
				draw();
			} else if (activeElement.current && activeElement.current.type === "wall") {
				move(clientX, clientY);
				snapToAxis(activeElement.current.element.start);
				snapToAxis(activeElement.current.element.end);
				draw();
			}
		}

		// Preview
		if (action.current === "drawing" && mode === "draw") {
			const x1 = preview.current.start.x;
			const y1 = preview.current.start.y;
			var { x2, y2 } = snapToAngle(x1, y1, clientX, clientY);
			preview.current = { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } };
			draw();
		}

		// Panning
		if (mouseDown.current && !activeElement.current) {
			const deltaX = clientX - mousePosOnClick.current.x;
			const deltaY = clientY - mousePosOnClick.current.y;

			originX.current += mousePosOnClick.current.x - clientX;
			originY.current += mousePosOnClick.current.y - clientY;

			const panOffsetCopy = { ...panOffset.current };
			panOffset.current = {
				x: panOffsetCopy.x + deltaX,
				y: panOffsetCopy.y + deltaY,
			};
			draw();
		}
	};

	const handleMouseUp = e => {
		if (e.button === 1 || e.button === 2 || e.button === 3) return;
		const { clientX, clientY } = getMouseCoordinates(e);
		mouseDown.current = false;

		// Drawing
		if (mode === "draw" && !mouseMoved.current) {
			createWall(clientX, clientY);
		}
	};

	const createWall = (x, y) => {
		if (action.current !== "drawing") {
			action.current = "drawing";
			preview.current = { start: { x, y }, end: { x, y } };
		} else if (action.current === "drawing") {
			const startCornerId = uuidv4();
			const endCornerId = uuidv4();

			const startCorner = isEmpty(lastCorner.current)
				? { ...preview.current.start, id: startCornerId }
				: lastCorner.current;

			const endCorner = { ...preview.current.end, id: endCornerId };

			isEmpty(lastCorner.current) && corners.current.push(startCorner);
			corners.current.push(endCorner);

			lastCorner.current = endCorner;

			walls.current.push({
				startId: startCorner.id,
				endId: endCorner.id,
				id: `${startCorner.id}-${endCorner.id}`,
			});

			// if 2 corners are next to each other (using a tolerance), the new corner should replace the old corner

			const previewCopy = { ...preview.current };
			preview.current = { start: previewCopy.end, end: { x, y } };
		}
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
		} else if (activeElement.current.type === "corner") {
			const newX1 = clientX;
			const newY1 = clientY;

			activeElement.current.element = { x: newX1, y: newY1, id: activeElement.current.element.id };
		}
		updateToActive();
	};

	// const snapAdjacent = () => {
	//   const corner1 = findCorner(selectedElement.current.element.startId);
	//   const corner2 = findCorner(selectedElement.current.element.endId);

	//   corners.current.forEach(corner => {
	//     if (Math.abs(corner.x - corner1.x) < globalSnapTolerance) {
	//       corner1.x = corner.x;
	//     }
	//     if (Math.abs(corner.x - corner2.x) < globalSnapTolerance) {
	//       corner2.x = corner.x;
	//     }
	//     if (Math.abs(corner.y - corner1.y) < globalSnapTolerance) {
	//       corner1.y = corner.y;
	//     }
	//     if (Math.abs(corner.y - corner2.y) < globalSnapTolerance) {
	//       corner2.y = corner.y;
	//     }
	//   });
	// };

	// const snapCorners = () => {
	//   const selectedCorners = [];

	//   if (selectedElement.current?.type === "corner") {
	//     selectedCorners.push(
	//       corners.current.find(corner => corner.id === selectedElement.current.element.id)
	//     );
	//   } else if (selectedElement.current?.type === "wall") {
	//     selectedCorners.push(
	//       findCorner(selectedElement.current.element.startId),
	//       findCorner(selectedElement.current.element.endId)
	//     );
	//   }

	//   selectedCorners.forEach(selectedCorner => {
	//     const closestCorner = findClosestCornerToElement(selectedCorner);
	//     if (
	//       closestCorner &&
	//       UTILS.distance(closestCorner.x, closestCorner.y, selectedCorner.x, selectedCorner.y) <
	//         globalSnapTolerance
	//     ) {
	//       console.log("ye");
	//       const updatedWalls = walls.current.map(wall => {
	//         if (wall.startId === selectedCorner.id)
	//           return { startId: closestCorner.id, endId: wall.endId, id: wall.id };
	//         if (wall.endId === selectedCorner.id)
	//           return { startId: wall.startId, endId: closestCorner.id, id: wall.id };
	//         return wall;
	//       });
	//       walls.current = updatedWalls;
	//       selectedElement.current.type === "corner"
	//         ? (selectedElement.current.element = closestCorner)
	//         : null;
	//       const updatedCorners = corners.current.filter(corner => corner.id !== selectedCorner.id);
	//       corners.current = updatedCorners;

	//       console.log("completed");
	//     }
	//   });
	// };
	// Error is happening because we need to update the selectedCorners array, because after the 1st corner snaps, the startId / endId will change, however the value in selectedCorners wouldn't.

	const findClosestCornerToElement = selectedCorner => {
		let closestCorner = null;
		let minDistance = Infinity;

		corners.current.forEach(otherCorner => {
			if (otherCorner.id !== selectedCorner.id) {
				const distance = UTILS.distance(
					selectedCorner.x,
					selectedCorner.y,
					otherCorner.x,
					otherCorner.y
				);
				if (distance < minDistance) {
					closestCorner = otherCorner;
					minDistance = distance;
				}
			}
		});
		return closestCorner;
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
