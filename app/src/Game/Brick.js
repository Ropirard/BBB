import GameObject from "./GameObject";
import theGame from "./Game";
import unbreakableBrickImg from '../assets/img/unbreakableBrick.png';

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
        let sourceX, sourceY;
        if (this.type < 0) {
            // Pour les briques incassables, chaque type (-1, -2, ...) correspond à une tuile différente
            // type = -1 => tuile 0, type = -2 => tuile 1, etc.
            sourceX = this.size.width * (-(this.type + 1));
            sourceY = 0;
        } else {
            sourceX = (this.size.width * this.type) - this.size.width;
            sourceY = (this.size.height * this.strength) - this.size.height;
        }
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