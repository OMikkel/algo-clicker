
function drawAlgo(xPos: number, yPos: number, ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "black";
  ctx.fillStyle = "gray";
  ctx.beginPath();
  ctx.arc(xPos, yPos, 40, 0, 40 * Math.PI);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
}

export default drawAlgo;