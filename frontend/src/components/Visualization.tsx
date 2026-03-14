import React, { useRef, useEffect } from "react";

const CanvasExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw a rectangle
    ctx.fillStyle = "blue";
    ctx.fillRect(50, 50, 150, 100);
  }, []);

  return <canvas ref={canvasRef} width={400} height={300} />;
};

export default CanvasExample;