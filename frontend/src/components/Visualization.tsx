import React, { useRef, useEffect } from "react";

interface VisualizationProps {
  width: number;
  height: number;
}

function Visualization({width, height}: VisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "gray";
    
    ctx.beginPath();
    ctx.arc(95, 50, 40, 0, 40 * Math.PI);
    
    ctx.fill();
    ctx.lineWidth = 4;
    
    ctx.stroke();
  }, []);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Visualization;