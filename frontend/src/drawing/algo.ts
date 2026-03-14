
function drawAlgo(xPos: number, yPos: number, ctx: CanvasRenderingContext2D) {
    drawBody(xPos, yPos + 150, 50, 70, 20, ctx);
    drawHead(xPos, yPos, 60, ctx);
    drawHand(xPos - 100, yPos + 150, 30, ctx);
    drawHand(xPos + 100, yPos + 150, 30, ctx);
}

function drawHead(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "gray";
    ctx.beginPath();
    drawCircle(xPos, yPos, size, ctx);
    ctx.fill();

    drawEye(xPos+20, yPos, size / 4, ctx);
    drawEye(xPos-20, yPos, size / 4, ctx);
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

function drawCircle(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    ctx.arc(xPos, yPos, size, 0, size * Math.PI);
}

function drawHand(xPos: number, yPos: number, size: number, ctx: CanvasRenderingContext2D) {
    const thickness = size * 0.5;

    const radius = size / 2;

    ctx.save();
    ctx.translate(xPos, yPos);

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