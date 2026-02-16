import MovingObject from "./MovingObject";
import theGame from "./Game";

export default class Paddle extends MovingObject
{
    equipment;

    // Propriétés pour l'animation
    animationIndex = 0;
    previousKeyframeStamp;
    frameRate = 20;

    draw() {
        const sourceY = this.animationIndex * this.size.height;

        theGame.ctx.drawImage(
            this.image,
            0,
            sourceY,
            this.size.width,
            this.size.height,
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );
    }

    updateKeyframe() {
        // Toute première keyframe
        if( ! this.previousKeyframeStamp ) {
            this.previousKeyframeStamp = theGame.currentLoopStamp;
            return;
        }

        const delta = theGame.currentLoopStamp - this.previousKeyframeStamp;
        
        // Si la frame d'animation de la boucle ne correspond au frameRate voulu, on sort
        if( delta < 1000 / this.frameRate ) return;

        // Sinon on met à jour l'index d'animation
        this.animationIndex ++;

        if( this.animationIndex > 3)
            this.animationIndex = 0;

        this.previousKeyframeStamp = theGame.currentLoopStamp;
    }
}