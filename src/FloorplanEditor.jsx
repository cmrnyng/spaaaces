import { useEffect, useState, useRef } from "react";

export default function FloorplanEditor({ handleStateUpdate, globalElements }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [elements, setElements] = useState(globalElements);
  const [preview, setPreview] = useState({});

  const functionHandler = data => {
    handleStateUpdate(data);
  };

  // Esc key detection
  const handleKeyPress = e => {
    if (e.key === "Escape") {
      if (drawing) {
        console.log("test");
        setDrawing(false);
        setPreview({});
      }
    }
  };

  useEffect(() => {
    return () => {
      console.log("unmount");
      functionHandler(elements);
    };
  }, []);

  // Editor changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawPreview(ctx);

    // Draw walls
    elements.forEach(element => {
      drawWalls(ctx, element);
    });
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

  const handleMouseClick = e => {
    if (!drawing) {
      setDrawing(true);
      const { clientX, clientY } = e;
      setPreview(CreateElement(clientX, clientY, clientX, clientY));
    } else {
      setDrawing(false);
      setElements(prevState => [...prevState, preview]);
      setPreview({});
    }
  };

  const handleMouseMove = e => {
    if (!drawing) return;
    const { clientX, clientY } = e;
    const { x1, y1 } = preview;
    setPreview(CreateElement(x1, y1, clientX, clientY));
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

const CreateElement = (x1, y1, x2, y2) => {
  return { x1, y1, x2, y2 };
};
