import { Vec2D } from "./Vec2D";

const drawAlgo = {
    drawHeadAndBody: (pos: Vec2D, eyeFocus: Vec2D, ctx: CanvasRenderingContext2D) => {
        const perspective: number = 0.3;
        drawBody(new Vec2D(pos.X(), pos.Y() + 170), 50, 90, perspective, ctx);
        drawNeck(new Vec2D(pos.X(), pos.Y() + 80), 20, 90, perspective, ctx);
        drawHead(pos, 60, eyeFocus, ctx);
    },
    drawArmsAndHands: (algoPos: Vec2D, lHandPos: Vec2D, rHandPos: Vec2D, ctx: CanvasRenderingContext2D) => {
        drawArm(new Vec2D(algoPos.X() - 50, algoPos.Y() + 95), Math.PI, new Vec2D(lHandPos.X(), lHandPos.Y() - 40), -Math.PI / 2, 10, ctx);
        drawHand(lHandPos, 30, ctx);

        drawArm(new Vec2D(algoPos.X() + 50, algoPos.Y() + 95), 0, new Vec2D(rHandPos.X(), rHandPos.Y() - 40), -Math.PI / 2, 10, ctx);
        drawHand(rHandPos, 30, ctx);
    },
    // For testing
    drawEyeFocusPoint: (eyeFocus: Vec2D, ctx: CanvasRenderingContext2D) => {
        drawCircle(eyeFocus, 10, "yellow", ctx);
    }
}




function drawHead(pos: Vec2D, size: number, eyeFocus: Vec2D, ctx: CanvasRenderingContext2D) {
    drawCircle(pos, size, "rgb(65, 179, 255)", ctx);

    drawEye(new Vec2D(pos.X() + size * 0.4, pos.Y() + size * 0.1), size * 0.3, eyeFocus, ctx);
    drawEye(new Vec2D(pos.X() - size * 0.4, pos.Y() + size * 0.1), size * 0.3, eyeFocus, ctx);


    drawCylinder(new Vec2D(pos.X(), pos.Y() - size * 0.85), size * 0.03, size * 0.6, 0.3, "rgb(0, 153, 255)", "black", ctx)
    drawCircle(new Vec2D(pos.X(), pos.Y() - size * 1.5), size * 0.1, "rgb(65, 179, 255)", ctx);
}

function drawEye(pos: Vec2D, size: number, eyeFocus: Vec2D, ctx: CanvasRenderingContext2D) {
    drawCircle(pos, size, "white", ctx);

    const dx = eyeFocus.X() - pos.X();
    const dy = eyeFocus.Y() - pos.Y();

    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = size / 2;

    let offsetX = dx;
    let offsetY = dy;

    if (dist > maxDist && dist !== 0) {
        const scale = maxDist / dist;
        offsetX = dx * scale;
        offsetY = dy * scale;
    }

    drawPupil(new Vec2D(pos.X() + offsetX, pos.Y() + offsetY), size / 2, ctx);
}

function drawPupil(pos: Vec2D, size: number, ctx: CanvasRenderingContext2D) {
    drawCircle(pos, size, "black", ctx);
    drawCircle(new Vec2D(pos.X() + size * 0.4, pos.Y() - size * 0.4), size * 0.3, "white", ctx);
}


function drawArm(from: Vec2D, fromDirection: number, to: Vec2D, toDirection: number, thickness: number, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgb(144, 211, 255)";
    ctx.lineWidth = thickness;

    const distance = Math.hypot(to.X() - from.X(), to.Y() - from.Y());
    const controlLength = distance * 0.4;

    const c1x = from.X() + Math.cos(fromDirection) * controlLength;
    const c1y = from.Y() + Math.sin(fromDirection) * controlLength;

    const c2x = to.X() + Math.cos(toDirection) * controlLength;
    const c2y = to.Y() + Math.sin(toDirection) * controlLength;

    ctx.beginPath();
    ctx.moveTo(from.X(), from.Y());
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, to.X(), to.Y());
    ctx.stroke();
}

function drawCircle(pos: Vec2D, size: number, color: string, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.X(), pos.Y(), size, 0, size * Math.PI);
    ctx.fill();
}

function drawHand(pos: Vec2D, size: number, ctx: CanvasRenderingContext2D) {
    const thickness = size * 0.5;

    const radius = size / 2;

    ctx.save();
    ctx.translate(pos.X(), pos.Y() - size * 0.75);

    // Magnet body
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = "red";
    ctx.lineCap = "square";
    ctx.arc(0, 0, radius, Math.PI, 0);
    ctx.stroke();

    // Flat white tips
    const tipWidth = thickness;
    const tipHeight = thickness;

    ctx.fillStyle = "rgb(255, 255, 255)";

    ctx.fillRect(-radius - tipWidth / 2, tipHeight - size * 0.25, tipWidth, tipHeight);
    ctx.fillRect(radius - tipWidth / 2, tipHeight - size * 0.25, tipWidth, tipHeight);

    ctx.restore();
}

function drawBody(pos: Vec2D, width: number, height: number, perspective: number, ctx: CanvasRenderingContext2D) {
    drawCylinder(pos, width, height, perspective, "rgb(65, 179, 255)", "rgb(144, 211, 255)", ctx);
}

function drawNeck(pos: Vec2D, width: number, height: number, perspective: number, ctx: CanvasRenderingContext2D) {
    drawCylinder(pos, width, height, perspective, "rgb(0, 153, 255)", "lightgray", ctx);
}

function drawCylinder(pos: Vec2D, width: number, height: number, perspective: number, sideColor: string, topColor: string, ctx: CanvasRenderingContext2D) {
    // Bottom
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.ellipse(pos.X(), pos.Y(), width, width * perspective, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Middle
    ctx.beginPath();
    ctx.rect(pos.X() - width, pos.Y() - height, 2 * width, height);
    ctx.fill();

    // Top
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.ellipse(pos.X(), pos.Y() - height, width, width * perspective, 0, 0, 2 * Math.PI);
    ctx.fill();
}


export default drawAlgo;