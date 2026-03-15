import { useRef, useEffect, useState } from "react";
import drawAlgo from "../drawing/algo";

import { example_env } from "../example-env";
import { generateEnvironmentDrawables } from "../drawing/environments";

interface VisualizationProps {
	width: number;
	height: number;
}

function Visualization({ width, height }: VisualizationProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const startTime = performance.now();
	

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const env = example_env;
		const objs = generateEnvironmentDrawables(env, ctx, height, width);

		const elements: elementData[] = [{xPos: 50, yPos: 600}]
		const animation = getAnimation("liftAnimation", elements);

		const render = () => {
			const time = (performance.now() - startTime) / 1000;

			ctx.clearRect(0, 0, width, height);

			drawAlgo.drawHeadAndBody(width / 2, 300, ctx);

			objs.forEach(v => v.draw());

			const rHandX = keyframe(time, animation.rHandX);
			const rHandY = keyframe(time, animation.rHandY);
			//const elementsGrab = 

			drawAlgo.drawArmsAndHands(width / 2, 300, rHandX, rHandY, 300, 500, ctx);

			requestAnimationFrame(render);
		};

		requestAnimationFrame(render);

	}, [height, width, startTime]);

	return <canvas ref={canvasRef} width={width} height={height} />;
}

function keyframe(time: number, frames: [number, number][]) {
  for (let i = 0; i < frames.length - 1; i++) {
    const [t1, v1] = frames[i];
    const [t2, v2] = frames[i + 1];

    if (time >= t1 && time <= t2) {
      const p = (time - t1) / (t2 - t1);
      return v1 + (v2 - v1) * p;
    }
  }

  return frames[frames.length - 1][1];
}

interface elementData {
	xPos: number;
	yPos: number;
}

function getAnimation(operation: string, elements: elementData[]) {
	const rHandXDefault = 100;
	const rHandYDefault = 500;

	switch (operation) {
		case "liftAnimation": {
			return {
				rHandX: [
					[0, rHandXDefault],
					[1, elements[0].xPos],
					[2, 50],
					[3, elements[0].xPos],
					[4, rHandXDefault],
				],
				rHandY: [
					[0, rHandYDefault],
					[1, elements[0].yPos],
					[2, 400],
					[3, elements[0].yPos],
					[4, rHandYDefault],
				],
				elementsGrab: [
					[1, "inRightHand"],
					[3, "free"],
				],
			}
		}
			
	}
};

export default Visualization;
