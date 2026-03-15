import { useRef, useEffect, useState } from "react";
import drawAlgo from "../drawing/algo";
import { generateEnvironmentDrawables } from "../drawing/environments";
import type { DrawableElement } from "../drawing/DrawableElement";
import { Vec2D } from "../drawing/Vec2D";
import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { Environment } from "../data-model";
import { ParticleSystem } from "../effects/ParticleSystem";
import { soundManager } from "../effects/SoundManager";
import { achievementSystem } from "../systems/AchievementSystem";
import { comboSystem } from "../systems/ComboSystem";

interface VisualizationProps {
	width: number;
	height: number;
}

type Vec2DKeyframes = [number, Vec2D][];

interface SwapAnimation {
	lHandPos: Vec2DKeyframes;
	leftObj: Vec2DKeyframes;
	rHandPos: Vec2DKeyframes;
	rightObj: Vec2DKeyframes;
	eyeFocus: Vec2DKeyframes;
}

type TracePayload = {
	type?: string;
	event?: string;
	arr?: string;
	index?: number;
	index1?: number;
	index2?: number;
	value?: number;
	intEnv?: Record<string, number>;
	boolEnv?: Record<string, boolean>;
	arrEnv?: Record<string, number[]>;
	parentEnv?: Environment | null;
};

function Visualization({ width, height }: VisualizationProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const startTimeRef = useRef(performance.now());
	const eyeFocusRef = useRef(new Vec2D(width / 2, height / 2));
	const pointerActiveRef = useRef(false);
	const particleSystemRef = useRef(new ParticleSystem());
	const [latestTrace, setLatestTrace] = useState<TracePayload | null>(null);
	const { env } = useGlobalStateContext();
	const algoClickCountRef = useRef(0);
	const konamiSequenceRef = useRef<string[]>([]);

	// Konami code sequence
	const konamiCode = [
		"ArrowUp",
		"ArrowUp",
		"ArrowDown",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"ArrowLeft",
		"ArrowRight",
		"b",
		"a",
	];

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			konamiSequenceRef.current.push(e.key);
			if (konamiSequenceRef.current.length > konamiCode.length) {
				konamiSequenceRef.current.shift();
			}

			if (
				konamiSequenceRef.current.length === konamiCode.length &&
				konamiSequenceRef.current.every((key, i) => key === konamiCode[i])
			) {
				achievementSystem.checkKonamiCode();
				particleSystemRef.current.burst(
					new Vec2D(width / 2, height / 2),
					"success",
				);
				soundManager.playAchievement();
				konamiSequenceRef.current = [];
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [width, height]);

	useEffect(() => {
		const onTrace: EventListener = (event) => {
			const customEvent = event as CustomEvent<TracePayload>;
			if (!customEvent.detail) return;
			setLatestTrace(customEvent.detail);

			// Track achievements and combos
			if (customEvent.detail.event === "ArraySwap") {
				achievementSystem.recordSwap();
				comboSystem.increment();
				soundManager.playSwap();

				const combo = comboSystem.getCurrent();
				achievementSystem.recordCombo(combo);

				if (combo >= 5) {
					soundManager.playCombo(combo);
				}
			}
		};

		document.addEventListener("algoclickertrace", onTrace);
		return () => {
			document.removeEventListener("algoclickertrace", onTrace);
		};
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		startTimeRef.current = performance.now();
		ctx.textBaseline = "top";
		const objs = generateEnvironmentDrawables(env, ctx, height, width);

		const [leftObj, rightObj] = getTraceObjects(objs, env, latestTrace);
		const animation =
			leftObj && rightObj
				? operations.swap(leftObj, rightObj)
				: latestTrace
					? operations.wave()
					: null;

		const handleClick = (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const clickX = event.clientX - rect.left;
			const clickY = event.clientY - rect.top;

			// Check if clicking on Algo's head
			const algoHeadX = width / 2;
			const algoHeadY = 300;
			const headRadius = 60;

			const distance = Math.sqrt(
				(clickX - algoHeadX) ** 2 + (clickY - algoHeadY) ** 2,
			);

			if (distance <= headRadius) {
				algoClickCountRef.current++;
				achievementSystem.checkAlgoClick(algoClickCountRef.current);
				particleSystemRef.current.emit({
					position: new Vec2D(clickX, clickY),
					count: 10,
					type: "heart",
					colors: ["#FF69B4", "#FF1493"],
					minSpeed: 50,
					maxSpeed: 150,
					minSize: 4,
					maxSize: 8,
				});
				soundManager.playClick();

				if (algoClickCountRef.current === 10) {
					achievementSystem.checkSecretWave();
				}
			}
		};

		const updateEyeFocusFromPointer = (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const pointerX = event.clientX - rect.left;
			const pointerY = event.clientY - rect.top;
			pointerActiveRef.current = true;
			eyeFocusRef.current = new Vec2D(pointerX, pointerY);
		};

		const resetEyeFocus = () => {
			pointerActiveRef.current = false;
			eyeFocusRef.current = new Vec2D(width / 2, height / 2);
		};

		canvas.addEventListener("click", handleClick);
		canvas.addEventListener("mousemove", updateEyeFocusFromPointer);
		canvas.addEventListener("mouseleave", resetEyeFocus);

		let animationFrameId: number;

		let swapEvent = null;
		let new_env = null;
		let [index1, index2] = [null, null];
		let swapTriggered = false;

		const traceHandler = (e: Event) => {
			const customEvent = e as CustomEvent;
			let { event, env } = customEvent.detail;
			if (event == "ArraySwap") {
				swapEvent = event;
				new_env = env;
				index1 = customEvent.detail["index1"];
				index2 = customEvent.detail["index2"];
				swapTriggered = true;
			}
		};

		document.addEventListener("algoclickertrace", traceHandler);

		const objs2 = generateEnvironmentDrawables(
			new_env || env,
			ctx,
			height,
			width,
		);

		let [leftObj2, rightObj2] =
			swapEvent && index1 != null && index2 != null
				? [objs2[index1], objs2[index2]]
				: [null, null];

		const animation2 =
			leftObj2 && rightObj2 ? operations.swap(leftObj2, rightObj2) : null;

		let lastTime = performance.now();

		const render = () => {
			const currentTime = performance.now();
			const deltaTime = (currentTime - lastTime) / 1000;
			lastTime = currentTime;

			const time = (currentTime - startTimeRef.current) / 1000;

			ctx.clearRect(0, 0, width, height);

			// Update and draw particles
			particleSystemRef.current.update(deltaTime);
			particleSystemRef.current.draw(ctx);

			let eyeFocus: Vec2D = eyeFocusRef.current;

			if (!pointerActiveRef.current && animation) {
				eyeFocus = keyframe(time, animation.eyeFocus);
			}

			drawAlgo.drawHeadAndBody(width / 2, 300, eyeFocus.X(), eyeFocus.Y(), ctx);

			objs.forEach((v) => v.draw());
			let rhand = rHandPosDefault;
			let lhand = lHandPosDefault;

			if (animation) {
				rhand = keyframe(time, animation.rHandPos);
				lhand = keyframe(time, animation.lHandPos);
				const leftObjFrame = keyframe(time, animation.leftObj);
				const rightObjFrame = keyframe(time, animation.rightObj);
				leftObj.setPosition(leftObjFrame);
				rightObj.setPosition(rightObjFrame);
			}

			// Emit swap particles when swap happens
			if (swapTriggered && leftObj && rightObj) {
				const midpoint = leftObj.position
					.add(rightObj.position)
					.scale(0.5)
					.translateY(-50);
				particleSystemRef.current.burst(midpoint, "swap");
				swapTriggered = false;
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

			animationFrameId = requestAnimationFrame(render);
		};

		animationFrameId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animationFrameId);
			canvas.removeEventListener("click", handleClick);
			canvas.removeEventListener("mousemove", updateEyeFocusFromPointer);
			canvas.removeEventListener("mouseleave", resetEyeFocus);
			document.removeEventListener("algoclickertrace", traceHandler);
		};
	}, [env, height, width, latestTrace]);

	return <canvas ref={canvasRef} width={width} height={height} className="cursor-pointer" />;
}

function keyframe(time: number, frames: Vec2DKeyframes) {
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
const lHandGrabOffset = new Vec2D(-15, 35);
const lHandPosDefault = new Vec2D(100, 500);
const rHandGrabOffset = new Vec2D(-15, 35);
const rHandPosDefault = new Vec2D(300, 500);
const eyeFocusDefault = new Vec2D(200, 500);

const operations: {
	wave: () => SwapAnimation;
	swap: (left: DrawableElement, right: DrawableElement) => SwapAnimation;
	compare: (left: DrawableElement, right: DrawableElement) => SwapAnimation;
} = {
	wave: (): SwapAnimation => {
		const lHandPos: Vec2DKeyframes = [
			[0, lHandPosDefault],
			[0.5, new Vec2D(70, 430)],
			[1, new Vec2D(130, 420)],
			[1.5, new Vec2D(70, 430)],
			[2, lHandPosDefault],
		];
		const leftObj: Vec2DKeyframes = [[0, new Vec2D(0, 0)]];
		const rHandPos: Vec2DKeyframes = [
			[0, rHandPosDefault],
			[0.5, new Vec2D(330, 420)],
			[1, new Vec2D(280, 410)],
			[1.5, new Vec2D(330, 420)],
			[2, rHandPosDefault],
		];
		const rightObj: Vec2DKeyframes = [[0, new Vec2D(0, 0)]];
		const eyeFocus: Vec2DKeyframes = [
			[0, eyeFocusDefault],
			[0.75, new Vec2D(260, 440)],
			[1.5, new Vec2D(140, 440)],
			[2, eyeFocusDefault],
		];

		return { lHandPos, leftObj, rHandPos, rightObj, eyeFocus };
	},
	swap: (left: DrawableElement, right: DrawableElement): SwapAnimation => {
		const leftPos = left.position;
		const rightPos = right.position;
		const viaLeftPoint = lHandPosDefault.slerp(leftPos, 0.3);
		const viaRightPoint = rHandPosDefault.slerp(rightPos, 0.3);
		return {
			lHandPos: [
				[0, lHandPosDefault],
				[1, leftPos.subtract(lHandGrabOffset).translateX(left.size.X() / 2)],
				[
					2,
					viaLeftPoint.subtract(lHandGrabOffset).translateX(left.size.X() / 2),
				],
				[3, rightPos.subtract(lHandGrabOffset).translateX(left.size.X() / 2)],
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
		};
	},
	compare: (left: DrawableElement, right: DrawableElement): SwapAnimation => {
		const leftPos = left.position;
		const rightPos = right.position;
		const leftComparePoint = new Vec2D(30, 370);
		const rightComparePoint = new Vec2D(300, 370);
		return {
			lHandPos: [
				[0, lHandPosDefault],
				[1, leftPos.subtract(lHandGrabOffset).translateX(left.size.X() / 2)],
				[
					2,
					leftComparePoint
						.subtract(lHandGrabOffset)
						.translateX(left.size.X() / 2),
				],
				[
					5,
					leftComparePoint
						.subtract(lHandGrabOffset)
						.translateX(left.size.X() / 2),
				],
				[6, leftPos.subtract(lHandGrabOffset).translateX(left.size.X() / 2)],
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
				[1, rightPos.subtract(lHandGrabOffset).translateX(right.size.X() / 2)],
				[
					2,
					rightComparePoint
						.subtract(lHandGrabOffset)
						.translateX(right.size.X() / 2),
				],
				[
					5,
					rightComparePoint
						.subtract(lHandGrabOffset)
						.translateX(right.size.X() / 2),
				],
				[6, rightPos.subtract(lHandGrabOffset).translateX(right.size.X() / 2)],
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
		};
	},
};

function getTraceObjects(
	objs: DrawableElement[],
	env: Environment,
	trace: TracePayload | null,
): [DrawableElement | null, DrawableElement | null] {
	if (!trace || trace.event !== "ArraySwap" || !trace.arr) {
		return [null, null];
	}

	if (typeof trace.index1 !== "number" || typeof trace.index2 !== "number") {
		return [null, null];
	}

	const firstObj = getArrayElementDrawable(objs, env, trace.arr, trace.index1);
	const secondObj = getArrayElementDrawable(objs, env, trace.arr, trace.index2);

	if (!firstObj || !secondObj) {
		return [null, null];
	}

	if (firstObj.position.X() <= secondObj.position.X()) {
		return [firstObj, secondObj];
	}

	return [secondObj, firstObj];
}

function getArrayElementDrawable(
	objs: DrawableElement[],
	env: Environment,
	arrName: string,
	index: number,
): DrawableElement | null {
	if (!Number.isInteger(index) || index < 0) return null;

	const intCount = Object.keys(env.intEnv).length;
	const boolCount = Object.keys(env.boolEnv).length;
	let offset = intCount + boolCount;

	for (const [name, values] of Object.entries(env.arrEnv)) {
		const elementStart = offset + 1;

		if (name === arrName) {
			if (index >= values.length) return null;
			return objs[elementStart + index] ?? null;
		}

		offset += 1 + values.length;
	}

	return null;
}

export default Visualization;
