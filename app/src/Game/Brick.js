import GameObject from "./GameObject";
import theGame from "./Game";

export default class Brick extends GameObject
{
    type;
    strength;

    constructor( image, width, height, strength = 1 ) {
        super( image, width, height );
        this.strength = strength;
        this.type = strength;
    }

    draw() {
        const sourceX = (this.size.width * this.type) - this.size.width;
        const sourceY = (this.size.height * this.strength) - this.size.height;

        theGame.ctx.drawImage(
            this.image,
            sourceX,
            sourceY,
            this.size.width,
            this.size.height,
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );
    }
}