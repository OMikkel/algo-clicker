
const drawAlgo = {
    drawHeadAndBody: (xPos: number, yPos: number, ctx: CanvasRenderingContext2D) => {
        drawBody(xPos, yPos + 150, 50, 70, 20, ctx);
        drawHead(xPos, yPos, 60, ctx);
    },
    drawArmsAndHands: (algoXPos: number, algoYPos: number, lArmXPos: number, lArmYPos: number, rArmXPos: number, rArmYPos: number, ctx: CanvasRenderingContext2D) => {
        drawArm(algoXPos - 50, algoYPos + 95, Math.PI, lArmXPos, lArmYPos, -Math.PI / 2, 10, ctx);
        drawHand(lArmXPos, lArmYPos, 30, ctx);
        drawArm(algoXPos + 50, algoYPos + 95, 0, rArmXPos, rArmYPos, -Math.PI / 2, 10, ctx);
        drawHand(rArmXPos, rArmYPos, 30, ctx);
    },
}




function drawHead(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "gray";
    ctx.beginPath();
    drawCircle(xPos, yPos, size, ctx);
    ctx.fill();

    drawEye(xPos+size*0.4, yPos, size * 0.3, ctx);
    drawEye(xPos-size*0.4, yPos, size * 0.3, ctx);
}

function drawEye(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    drawCircle(xPos, yPos, size, ctx);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    drawCircle(xPos, yPos + size * 0.4, size / 2, ctx);
    ctx.fill();
}

function drawArm(fromX: number, fromY: number, fromDirection: number, toX: number, toY: number, toDirection: number, thickness: number, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "lightGray";
    ctx.lineWidth = thickness;

    const distance = Math.hypot(toX - fromX, toY - fromY);
    const controlLength = distance * 0.4;

    const c1x = fromX + Math.cos(fromDirection) * controlLength;
    const c1y = fromY + Math.sin(fromDirection) * controlLength;

    const c2x = toX + Math.cos(toDirection) * controlLength;
    const c2y = toY + Math.sin(toDirection) * controlLength;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, toX, toY);
    ctx.stroke();
}

function drawCircle(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    ctx.arc(xPos, yPos, size, 0, size * Math.PI);
}

function drawHand(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    const thickness = size * 0.5;

    const radius = size / 2;

    ctx.save();
    ctx.translate(xPos, yPos + 15);

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

    ctx.fillStyle = "white";

    ctx.fillRect(-radius - tipWidth / 2, tipHeight - size*0.25, tipWidth, tipHeight);
    ctx.fillRect(radius - tipWidth / 2, tipHeight - size*0.25, tipWidth, tipHeight);

    ctx.restore();
}

function drawBody(xPos: number, yPos: number, width: number, height: number, circleHeight: number, ctx: CanvasRenderingContext2D) {
    // Bottom
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.ellipse(xPos, yPos, width, circleHeight/2, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Middle
    ctx.beginPath();
    ctx.rect(xPos - width, yPos - height, 2 * width, height);
    ctx.fill();

    // Top
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    ctx.ellipse(xPos, yPos - height, width, circleHeight / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
}


export default drawAlgo;