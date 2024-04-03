import { useEffect, useState, useRef } from "react";

export default function Test() {
  const canvasRef = useRef();
  const contextRef = useRef();

  const draw = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillRect(50, 50, 100, 100);
  };

  const handleResize = () => {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    draw();
  };

  // Handle resize
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

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ backgroundColor: "ivory" }}
        // width={window.innerWidth}
        // height={window.innerHeight}
        // onMouseDown={handleMouseDown}
        // onMouseUp={handleMouseUp}
        // onMouseMove={handleMouseMove}
        onContextMenu={e => e.preventDefault()}
        tabIndex={0}
      />
    </>
  );
}
