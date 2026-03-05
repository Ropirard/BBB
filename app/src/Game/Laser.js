import MovingObject from "./MovingObject";

export default class Laser extends MovingObject {
    constructor(image, width, height, orientation, speed) {
        super(image, width, height, orientation, speed);
    }
}