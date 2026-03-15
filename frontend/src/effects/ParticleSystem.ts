import { Vec2D } from "../drawing/Vec2D";

export interface Particle {
	position: Vec2D;
	velocity: Vec2D;
	acceleration: Vec2D;
	life: number;
	maxLife: number;
	size: number;
	color: string;
	alpha: number;
	rotation: number;
	rotationSpeed: number;
	type: "circle" | "star" | "spark" | "confetti" | "heart" | "lightning";
}

export class ParticleSystem {
	private particles: Particle[] = [];
	private gravity = new Vec2D(0, 300);

	update(deltaTime: number) {
		this.particles = this.particles.filter((p) => {
			p.life += deltaTime;
			if (p.life >= p.maxLife) return false;

			p.velocity = p.velocity.add(p.acceleration.scale(deltaTime));
			p.position = p.position.add(p.velocity.scale(deltaTime));
			p.rotation += p.rotationSpeed * deltaTime;
			p.alpha = 1 - p.life / p.maxLife;

			return true;
		});
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.particles.forEach((p) => {
			ctx.save();
			ctx.globalAlpha = p.alpha;
			ctx.translate(p.position.X(), p.position.Y());
			ctx.rotate(p.rotation);

			switch (p.type) {
				case "circle":
					ctx.fillStyle = p.color;
					ctx.beginPath();
					ctx.arc(0, 0, p.size, 0, Math.PI * 2);
					ctx.fill();
					break;

				case "star":
					this.drawStar(ctx, 0, 0, 5, p.size, p.size / 2, p.color);
					break;

				case "spark":
					ctx.strokeStyle = p.color;
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(-p.size, 0);
					ctx.lineTo(p.size, 0);
					ctx.moveTo(0, -p.size);
					ctx.lineTo(0, p.size);
					ctx.stroke();
					break;

				case "confetti":
					ctx.fillStyle = p.color;
					ctx.fillRect(-p.size / 2, -p.size, p.size / 2, p.size * 2);
					break;

				case "heart":
					this.drawHeart(ctx, 0, 0, p.size, p.color);
					break;

				case "lightning":
					ctx.strokeStyle = p.color;
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(0, -p.size);
					ctx.lineTo(p.size / 3, 0);
					ctx.lineTo(0, 0);
					ctx.lineTo(p.size / 3, p.size);
					ctx.stroke();
					break;
			}

			ctx.restore();
		});
	}

	private drawStar(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		spikes: number,
		outerRadius: number,
		innerRadius: number,
		color: string,
	) {
		let rot = (Math.PI / 2) * 3;
		let x = cx;
		let y = cy;
		const step = Math.PI / spikes;

		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);

		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x, y);
			rot += step;

			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x, y);
			rot += step;
		}

		ctx.lineTo(cx, cy - outerRadius);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	}

	private drawHeart(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		size: number,
		color: string,
	) {
		ctx.fillStyle = color;
		ctx.beginPath();
		const topCurveHeight = size * 0.3;
		ctx.moveTo(x, y + topCurveHeight);
		ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
		ctx.bezierCurveTo(
			x - size / 2,
			y + (size + topCurveHeight) / 2,
			x,
			y + (size + topCurveHeight) / 2,
			x,
			y + size,
		);
		ctx.bezierCurveTo(
			x,
			y + (size + topCurveHeight) / 2,
			x + size / 2,
			y + (size + topCurveHeight) / 2,
			x + size / 2,
			y + topCurveHeight,
		);
		ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
		ctx.closePath();
		ctx.fill();
	}

	emit(config: {
		position: Vec2D;
		count: number;
		type?: Particle["type"];
		colors?: string[];
		minSpeed?: number;
		maxSpeed?: number;
		minSize?: number;
		maxSize?: number;
		minLife?: number;
		maxLife?: number;
		angle?: number;
		spread?: number;
		gravity?: boolean;
	}) {
		const {
			position,
			count,
			type = "circle",
			colors = ["#FFD700", "#FFA500", "#FF6347", "#FF1493", "#00CED1"],
			minSpeed = 50,
			maxSpeed = 200,
			minSize = 3,
			maxSize = 8,
			minLife = 0.5,
			maxLife = 2,
			angle = 0,
			spread = Math.PI * 2,
			gravity = true,
		} = config;

		for (let i = 0; i < count; i++) {
			const randomAngle = angle - spread / 2 + Math.random() * spread;
			const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
			const velocity = new Vec2D(
				Math.cos(randomAngle) * speed,
				Math.sin(randomAngle) * speed,
			);

			this.particles.push({
				position: position.clone(),
				velocity,
				acceleration: gravity ? this.gravity : new Vec2D(0, 0),
				life: 0,
				maxLife: minLife + Math.random() * (maxLife - minLife),
				size: minSize + Math.random() * (maxSize - minSize),
				color: colors[Math.floor(Math.random() * colors.length)],
				alpha: 1,
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 4,
				type,
			});
		}
	}

	burst(position: Vec2D, type: "success" | "swap" | "error" | "combo") {
		switch (type) {
			case "success":
				this.emit({
					position,
					count: 50,
					type: "star",
					colors: ["#FFD700", "#FFA500", "#FFFF00"],
					minSpeed: 100,
					maxSpeed: 300,
					minSize: 5,
					maxSize: 12,
				});
				this.emit({
					position,
					count: 30,
					type: "confetti",
					colors: [
						"#FF69B4",
						"#FF1493",
						"#00CED1",
						"#FF6347",
						"#FFD700",
						"#7B68EE",
					],
					minSpeed: 150,
					maxSpeed: 400,
					minSize: 4,
					maxSize: 10,
				});
				break;

			case "swap":
				this.emit({
					position,
					count: 15,
					type: "spark",
					colors: ["#00CED1", "#4169E1", "#87CEEB"],
					minSpeed: 50,
					maxSpeed: 150,
					minSize: 4,
					maxSize: 8,
					minLife: 0.3,
					maxLife: 0.8,
				});
				break;

			case "error":
				this.emit({
					position,
					count: 20,
					type: "circle",
					colors: ["#FF0000", "#DC143C", "#8B0000"],
					minSpeed: 80,
					maxSpeed: 200,
					minSize: 3,
					maxSize: 7,
				});
				break;

			case "combo":
				this.emit({
					position,
					count: 25,
					type: "heart",
					colors: ["#FF1493", "#FF69B4", "#FFB6C1"],
					minSpeed: 100,
					maxSpeed: 250,
					minSize: 5,
					maxSize: 10,
				});
				this.emit({
					position,
					count: 15,
					type: "lightning",
					colors: ["#FFD700", "#FFFF00", "#FFA500"],
					minSpeed: 150,
					maxSpeed: 300,
					minSize: 6,
					maxSize: 12,
					minLife: 0.4,
					maxLife: 1.0,
				});
				break;
		}
	}

	clear() {
		this.particles = [];
	}

	getParticleCount() {
		return this.particles.length;
	}
}
