import { useEffect, useState, useRef } from "react";
import * as UTILS from "./utils.js";

const previewSnapTolerance = 7;

export default function FloorplanEditor({ elements, setElements }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [preview, setPreview] = useState({});

  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Esc key detection
  const handleKeyPress = e => {
    if (e.key === "Escape") {
      if (drawing) {
        setDrawing(false);
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Editor changes
  useEffect(() => {
    draw();
  }, [preview, elements, drawing]);

  //

  const drawGrid = ctx => {
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    for (let x = 0; x <= ctx.canvas.width; x += 20) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
    }
    for (let y = 0; y <= ctx.canvas.height; y += 20) {
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
    }
    ctx.stroke();
  };

  const draw = () => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawPreview(ctx);

    // Draw walls
    elementsRef.current.forEach(element => {
      drawWalls(ctx, element);
    });
  };

  const drawPreview = ctx => {
    const { x1, y1, x2, y2 } = preview;
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 6;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const drawWalls = (ctx, { x1, y1, x2, y2 }) => {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const handleMouseClick = ({ clientX, clientY }) => {
    if (!drawing) {
      setDrawing(true);
      setPreview({ x1: clientX, y1: clientY, x2: clientX, y2: clientY });
    } else {
      setElements(prevState => [...prevState, preview]);
      setPreview(prevPreview => ({
        x1: prevPreview.x2,
        y1: prevPreview.y2,
        x2: clientX,
        y2: clientY,
      }));
    }
  };

  const handleMouseMove = ({ clientX, clientY }) => {
    if (!drawing) return;
    const { x1, y1 } = preview;
    const { x2, y2 } = snapToAngle(x1, y1, clientX, clientY);
    setPreview({ x1, y1, x2, y2 });
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ backgroundColor: "ivory" }}
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={handleMouseClick}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    />
  );
}

const snapToAngle = (x1, y1, x2, y2) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  if (dx < previewSnapTolerance) return { x2: x1, y2 };
  if (dy < previewSnapTolerance) return { x2, y2: y1 };
  return { x2, y2 };
};
