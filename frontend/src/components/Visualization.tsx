import React, { useRef, useEffect } from "react";
import drawAlgo from "../drawing/algo";

import { example_env } from "../example-env";
import { generateEnvironmentDrawables } from "../drawing/environments";

interface VisualizationProps {
	width: number;
	height: number;
}

function Visualization({ width, height }: VisualizationProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		
		
		const env = example_env;
		const objs = generateEnvironmentDrawables(env, ctx, height, width);
		const render = () => { 
			ctx.clearRect(0,0,width,height)
			drawAlgo.drawHeadAndBody(width / 2, 300, ctx);
			objs.forEach(v => v.draw())
			drawAlgo.drawArmsAndHands(width / 2, 300, 100, 480, 300, 500, ctx); // Her kan man indstille hvor Algos hænder skal være.
			requestAnimationFrame(render)
		}
		requestAnimationFrame(render)
		
	}, [height, width]);

	return <canvas ref={canvasRef} width={width} height={height} />;
}

export default Visualization;
