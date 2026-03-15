import type { Vec2D } from "./Vec2D"

export abstract class DrawableElement {
    size: Vec2D
    position: Vec2D
    top_left: Vec2D
    top_right: Vec2D
    bot_right: Vec2D
    bot_left: Vec2D
    abstract draw: () => void
    setPosition: (vec: Vec2D) => void = (vec) => {
        this.position = vec;
        this.top_left = this.position
        this.top_right = this.top_left.translateX(this.size.X())
        this.bot_right = this.top_right.translateY(-this.size.Y())
        this.bot_left = this.bot_right.translateX(-this.size.X())
    }

    constructor(position: Vec2D, size: Vec2D) {
        this.size = size
        this.position = position
        this.top_left = this.position
        this.top_right = this.top_left.translateX(this.size.X())
        this.bot_right = this.top_right.translateY(-this.size.Y())
        this.bot_left = this.bot_right.translateX(-this.size.X())
    }
}