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
        const sourceY = this.animationIndex * 20; // Utiliser la hauteur d'origine de l'image (20) pour la source

        theGame.ctx.drawImage(
            this.image,
            0,
            sourceY,
            100, // Utiliser la largeur d'origine de l'image (100) pour la source
            20,  // Utiliser la hauteur d'origine de l'image (20) pour la source
            this.position.x,
            this.position.y,
            this.size.width, // La nouvelle largeur étirée/rétrécie
            this.size.height // La nouvelle hauteur du paddle
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