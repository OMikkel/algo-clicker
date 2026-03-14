import React, { useRef, useEffect } from "react";
import { example_env } from "../example-env";
import type { Environment } from "../data-model";

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

    const env = example_env
    drawEnvironment(env,ctx,height,width)

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

const drawEnvironment = (env: Environment, ctx:CanvasRenderingContext2D,height:number,_width:number) => {
  const [root_x,root_y] = [0,height-100];
    const [row_padding,col_padding] = [5,10]

    const font_height = 30;
    ctx.font = `${font_height}px roboto`
    let [offset_x,offset_y] = [col_padding,font_height] 
    
    const drawInt = (env: Environment["intEnv"]) => {
      Object.entries(env).forEach(([key,value]) => {
          ctx.fillStyle = "white";
          const txt = `${key}: ${value}`
          
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y);
          const metrics = ctx.measureText(txt)
          offset_x += metrics.width + col_padding
        })
    }
    
    const drawBool = (env: Environment["boolEnv"]) => {
      Object.entries(env).forEach(([key,value]) => {
          ctx.fillStyle = "white";
          const txt = `${key}: ${value}`
          
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y);
          const metrics = ctx.measureText(txt)
          offset_x += metrics.width + col_padding
        })
    }
    const drawArray = (arrEnv: Environment["arrEnv"]) => {
      ctx.fillStyle = "white";
      Object.entries(arrEnv).forEach(([key,value]) => {
        ctx.fillText(key,root_x+offset_x, root_y+offset_y);
        const metrics = ctx.measureText(key)
        offset_x += metrics.width + col_padding;
        value.forEach((v) => {
          const txt = `| ${v}`
          ctx.fillText(txt,root_x+offset_x, root_y+offset_y);
          const metrics = ctx.measureText(txt)
          offset_x += metrics.width + col_padding
        })
        })
    }

    const newRow = () => {
      offset_x = root_x + col_padding
      offset_y += font_height + row_padding
    }
    drawInt(env.intEnv)
    newRow()
    drawBool(env.boolEnv)
    newRow()
    drawArray(env.arrEnv)
    newRow()
}



export default Visualization;
