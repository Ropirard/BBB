import GameObject from "./GameObject";

export default class PowerUp extends GameObject {
    constructor(image, width, height, type) {
        super(image, width, height);
        this.type = type; // 'perforingBullet', 'stickyBall', 'laser'
        this.fallingSpeed = 2;
        this.active = true;
    }

    update() {
        this.position.y += this.fallingSpeed;
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );
    }
}
