import { useRef, useEffect, useState } from "react";
import drawAlgo from "../drawing/algo";

import { example_env } from "../example-env";
import { generateEnvironmentDrawables } from "../drawing/environments";
import type { DrawableElement } from "../drawing/DrawableElement";
import { Vec2D } from "../drawing/Vec2D";

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

		const elements: DrawableElement[] = objs;
		const animation = getAnimation("liftAnimation", elements);

		const render = () => {
			const time = (performance.now() - startTime) / 1000;

			ctx.clearRect(0, 0, width, height);

			drawAlgo.drawHeadAndBody(width / 2, 300, ctx);

			objs.forEach((v) => v.draw());

			// const rHandX = keyframe(time, animation.rHandX);
			// const rHandY = keyframe(time, animation.rHandY);
			const rhand = keyframe(time, animation.rHandPos);
			const leftObj = keyframe(time, animation.leftObj);
			const rightObj = keyframe(time, animation.rightObj);
			objs[0].setPosition(leftObj);
			objs[2].setPosition(rightObj);

			drawAlgo.drawArmsAndHands(
				width / 2,
				300,
				rhand.X(),
				rhand.Y(),
				300,
				500,
				ctx,
			);

			requestAnimationFrame(render);
		};

		requestAnimationFrame(render);
	}, [height, width, startTime]);

	return <canvas ref={canvasRef} width={width} height={height} />;
}

function keyframe(time: number, frames: [number, Vec2D][]) {
	for (let i = 0; i < frames.length - 1; i++) {
		const [t1, v1] = frames[i];
		const [t2, v2] = frames[i + 1];

		if (time >= t1 && time <= t2) {
			const p = (time - t1) / (t2 - t1);
			return v1.slerp(v2, p);
		}
	}

	return frames[frames.length - 1][1];
}

function getAnimation(operation: string, elements: DrawableElement[]) {
	const rHandPosDefault = new Vec2D(100, 500);
	const obj0pos = elements[0].position;
	const obj3pos = elements[2].position;
	const viaLiftPoint = new Vec2D(50, 400);
	switch (operation) {
		case "liftAnimation": {
			return {
				rHandPos: [
					[0, rHandPosDefault],
					[1, obj0pos],
					[2, viaLiftPoint],
					[3, obj3pos],
					[4, rHandPosDefault],
				],
				leftObj: [
					[0, obj0pos],
					[1, obj0pos],
					[2, viaLiftPoint],
					[3, obj3pos],
					[4, obj3pos],
					[5, obj3pos],
				],
				rightObj: [
					[0, obj3pos],
					[1, obj3pos],
					[2, obj3pos],
					[3, obj0pos],
					[4, obj0pos],
					[5, obj0pos],
				],
			};
		}
	}
}

export default Visualization;
