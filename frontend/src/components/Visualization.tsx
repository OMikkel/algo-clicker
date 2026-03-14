import React, { useRef, useEffect } from "react";
import drawAlgo from "../drawing/algo";

import { example_env } from "../example-env";
import { drawEnvironment } from "../drawing/environments";

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

		drawAlgo(width / 2, 300, ctx);
		const env = example_env;
		drawEnvironment(env, ctx, height, width);
	}, [height, width]);

	return <canvas ref={canvasRef} width={width} height={height} />;
}

export default Visualization;
