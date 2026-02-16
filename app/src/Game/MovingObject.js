import CustomMath from "./CustomMath";
import Vector from "./DataType/Vector";
import GameObject from "./GameObject";
import CollisionType from "./DataType/CollisionType";
import Bounds from "./DataType/Bounds";

export default class MovingObject extends GameObject
{
    speed = 1;
    orientation = 45;
    velocity;
    isCircular = false;

    constructor( image, width, height, orientation, speed ) {
        super( image, width, height );
        this.orientation = orientation;
        this.speed = speed;

        this.velocity = new Vector();
    }

    reverseOrientationX(alteration = 0) {
        this.orientation += alteration;
        this.orientation = 180 - this.orientation;

        this.orientation = CustomMath.normalizeAngle( this.orientation );
    }

    reverseOrientationY(alteration = 0) {
        this.orientation += alteration;
        this.orientation *= -1;

        this.orientation = CustomMath.normalizeAngle( this.orientation );
    }

    update() {
        let radOrientation = CustomMath.degToRad( this.orientation );
        this.velocity.x = this.speed * Math.cos( radOrientation );
        this.velocity.y = this.speed * Math.sin( radOrientation ) * -1;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    getCollisionType( foreignGameObject ) {
        const bounds = this.getBounds();
        const foreignBounds = foreignGameObject.getBounds();
        const radius = this.isCircular ? this.size.width / 2 : 0;
        const boundsBias = new Bounds(
            radius,
            -1 * radius,
            -1 * radius,
            radius
        );

        // Collision Horizontale (bords droite et gauche)
        if(
            (
                bounds.right >= foreignBounds.left - 1
                && bounds.right <= foreignBounds.right
                ||
                bounds.left <= foreignBounds.right + 1
                && bounds.left >= foreignBounds.left
            )
            && bounds.top + boundsBias.top >= foreignBounds.top
            && bounds.bottom + boundsBias.bottom <= foreignBounds.bottom
        ) {
            return CollisionType.HORIZONTAL;
        }

        // Collision Verticale (bords haut et bas)
        else if(
            (
                bounds.top <= foreignBounds.bottom + 1
                && bounds.top >= foreignBounds.top
                ||
                bounds.bottom >= foreignBounds.top - 1
                && bounds.bottom <= foreignBounds.bottom
            )
            && bounds.left + boundsBias.left >= foreignBounds.left
            && bounds.right + boundsBias.right <= foreignBounds.right
        ) {
            return CollisionType.VERTICAL;
        }

        // Aucune Collision
        return CollisionType.NONE;
    }
}