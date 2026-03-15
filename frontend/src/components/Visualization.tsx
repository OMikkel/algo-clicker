import { useRef, useEffect, useState } from "react";
import drawAlgo from "../drawing/algo";
import { generateEnvironmentDrawables } from "../drawing/environments";
import type { DrawableElement } from "../drawing/DrawableElement";
import { Vec2D } from "../drawing/Vec2D";
import { useGlobalStateContext } from "../context/GlobalStateContext";

interface VisualizationProps {
	width: number;
	height: number;
}

function Visualization({ width, height }: VisualizationProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const startTime = performance.now();
	const {env} = useGlobalStateContext()
	
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.textBaseline = "top"
		const objs = generateEnvironmentDrawables(env, ctx, height, width);

		const [leftObj,rightObj] = [objs[1],objs[4]]
		
		const animation = leftObj && rightObj ? operations.compare(leftObj,rightObj) : null

		const render = () => {
			const time = (performance.now() - startTime) / 1000;

			ctx.clearRect(0, 0, width, height);

			let eyeFocus: Vec2D = new Vec2D(200, 500);

			if (animation)
			{
				eyeFocus = keyframe(time, animation.eyeFocus);
			}

			drawAlgo.drawHeadAndBody(width / 2, 300, eyeFocus.X(), eyeFocus.Y(), ctx);

			objs.forEach((v) => v.draw());
			let rhand = rHandPosDefault
			let lhand = lHandPosDefault
			if (animation)
			{
				rhand = keyframe(time, animation.rHandPos);
				lhand = keyframe(time, animation.lHandPos);
				const leftObjFrame = keyframe(time, animation.leftObj);
				const rightObjFrame = keyframe(time, animation.rightObj);
				leftObj.setPosition(leftObjFrame);
				rightObj.setPosition(rightObjFrame);
			}

			drawAlgo.drawArmsAndHands(
				width / 2,
				300,
				lhand.X(),
				lhand.Y(),
				rhand.X(),
				rhand.Y(),
				ctx,
			);

			// Must only be run when testing:
			//drawAlgo.drawEyeFocusPoint(eyeFocus.X(), eyeFocus.Y(), ctx);

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
const lHandGrabOffset = new Vec2D(-15,35)
const lHandPosDefault = new Vec2D(100, 500);
const rHandGrabOffset = new Vec2D(-15,35)
const rHandPosDefault = new Vec2D(300, 500);
const eyeFocusDefault = new Vec2D(200, 500);

const operations = {
	"swap": (left: DrawableElement,right: DrawableElement) => {
		const leftPos = left.position
		const rightPos = right.position
		const viaLeftPoint = lHandPosDefault.slerp(leftPos, 0.3);
		const viaRightPoint = rHandPosDefault.slerp(rightPos, 0.3);
		return ({
			lHandPos: [
				[0, lHandPosDefault],
				[1, leftPos.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[2, viaLeftPoint.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[3, rightPos.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[4, lHandPosDefault],
			],
			leftObj: [
				[0, leftPos],
				[1, leftPos],
				[2, viaLeftPoint],
				[3, rightPos],
				[4, rightPos],
			],
			rHandPos: [
				[0, rHandPosDefault],
				[1, rightPos.subtract(rHandGrabOffset)],
				[2, viaRightPoint.subtract(rHandGrabOffset)],
				[3, leftPos.subtract(rHandGrabOffset)],
				[4, rHandPosDefault],
			],
			rightObj: [
				[0, rightPos],
				[1, rightPos],
				[2, viaRightPoint],
				[3, leftPos],
				[4, leftPos],
				[5, leftPos],
			],
			eyeFocus: [
				[0, eyeFocusDefault],
				[1, new Vec2D(200, 600)],
				[3, new Vec2D(200, 600)],
				[4, eyeFocusDefault],
			],
		})
	},
	"compare": (left: DrawableElement,right: DrawableElement) => {
		const leftPos = left.position
		const rightPos = right.position
		const leftComparePoint = new Vec2D(30, 370);
		const rightComparePoint = new Vec2D(300, 370);
		return ({
			lHandPos: [
				[0, lHandPosDefault],
				[1, leftPos.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[2, leftComparePoint.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[5, leftComparePoint.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[6, leftPos.subtract(lHandGrabOffset).translateX(left.size.X()/2)],
				[7, lHandPosDefault],
			],
			leftObj: [
				[1, leftPos],
				[2, leftComparePoint],
				[5, leftComparePoint],
				[6, leftPos],
			],
			rHandPos: [
				[0, rHandPosDefault],
				[1, rightPos.subtract(lHandGrabOffset).translateX(right.size.X()/2)],
				[2, rightComparePoint.subtract(lHandGrabOffset).translateX(right.size.X()/2)],
				[5, rightComparePoint.subtract(lHandGrabOffset).translateX(right.size.X()/2)],
				[6, rightPos.subtract(lHandGrabOffset).translateX(right.size.X()/2)],
				[7, rHandPosDefault],
			],
			rightObj: [
				[1, rightPos],
				[2, rightComparePoint],
				[5, rightComparePoint],
				[6, rightPos],
			],
			eyeFocus: [
				[1, eyeFocusDefault],
				[2, leftComparePoint],
				[2.5, leftComparePoint],
				[3, rightComparePoint],
				[3.5, rightComparePoint],
				[4, leftComparePoint],
				[5, leftComparePoint],
				[5.5, eyeFocusDefault],
			],
		})
	},
}

export default Visualization;
