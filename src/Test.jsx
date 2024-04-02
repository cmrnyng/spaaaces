import { useEffect, useState, useRef } from "react";
import * as UTILS from "./utils.js";
import drawIcon from "./assets/drawicon.svg";

const previewSnapTolerance = 7;
const wallSnapTolerance = 7;

export default function Test() {
  const canvasRef = useRef();
  const ctxRef = useRef();

  const [mouseMoved, setMouseMoved] = useState(true);

  // Esc key detection

  const testDraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
  };

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const handleResize = () => {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      testDraw();
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Initial draw
  useEffect(() => {
    // draw();
    testDraw();
  }, []);

  // New element
  // useEffect(() => {
  //   setNodes(
  //     elementsRef.current.map(element => {
  //       const node1 = { x: element.x1, y: element.y1 };
  //       const node2 = { x: element.x2, y: element.y2 };
  //       return { node1, node2 };
  //     })
  //   );
  // }, [elements]);

  // useEffect(() => {
  //   //
  // }, [elements]);

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

  // const draw = () => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);

  //   drawGrid(ctx);
  //   // drawPreview(ctx);

  //   // // Draw walls
  //   // elementsRef.current.forEach(element => {
  //   //   drawWalls(ctx, element);
  //   // });
  // };

  const handleMouseDown = ({ clientX, clientY, button }) => {
    setMouseMoved(false); // This line is causing a resizing bug somehow
  };

  // const handleMouseMove = ({ clientX, clientY }) => {
  //   setMouseMoved(true);
  // };

  return (
    <>
      <div className="floorplan-btns">
        <button className="editor-btn">
          <img src={drawIcon} className="icon" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ backgroundColor: "ivory" }}
        // width={window.innerWidth}
        // height={window.innerHeight}
        onMouseDown={handleMouseDown}
        // onMouseUp={handleMouseUp}
        // onMouseMove={handleMouseMove}
        onContextMenu={e => e.preventDefault()}
        tabIndex={0}
      />
    </>
  );
}
