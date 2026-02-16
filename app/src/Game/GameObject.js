import Bounds from "./DataType/Bounds";
import Size from "./DataType/Size";
import Vector from "./DataType/Vector";
import theGame from "./Game";

export default class GameObject
{
    image;
    position;
    size;
    tag;

    constructor( image, width, height ) {
        this.image = image;
        this.size = new Size( width, height );
    }

    getBounds() {
        return new Bounds(
            this.position.y,
            this.position.x + this.size.width,
            this.position.y + this.size.height,
            this.position.x
        );
    }

    setPosition( x, y ) {
        this.position = new Vector( x, y );
    }

    draw() {
        theGame.ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );
    }
}