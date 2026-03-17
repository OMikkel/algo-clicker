export class Vec2D {
    private x;
    public X = () => this.x;
    private y;
    public Y = () => this.y;

    translate = (v: Vec2D) => new Vec2D(this.x + v.X(), this.y + v.Y())
    translateX = (v_x: number) => new Vec2D(this.x + v_x, this.y)
    translateY = (v_y: number) => new Vec2D(this.x, this.y + v_y)
    add = (b: Vec2D) => new Vec2D(this.x + b.X(), this.y + b.Y())
    subtract = (b: Vec2D) => new Vec2D(this.x + (-b.X()), this.y + (-b.Y()))
    scale = (scalar: number) => new Vec2D(this.X() * scalar, this.Y() * scalar)
    norm = () => Math.sqrt(this.x ** 2 + this.y ** 2);
    unit = () => {
        const norm = this.norm()
        return new Vec2D(this.x / norm, this.y / norm)
    }
    slerp = (destination: Vec2D, progress: number) => {
        let a_to_b = destination.subtract(this);
        return this.translate(a_to_b.scale(progress));
    }

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}