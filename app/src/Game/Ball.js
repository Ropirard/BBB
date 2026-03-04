import MovingObject from "./MovingObject";
import theGame from "./Game";

export default class Ball extends MovingObject {
	stuckToPaddle = false;

	update() {
		if (this.stuckToPaddle) {
			// Suivre le paddle
			const paddle = theGame.state.paddle;
			this.position.x = paddle.position.x + (paddle.size.width / 2) - (this.size.width / 2);
			this.position.y = paddle.position.y - this.size.height;
		} else {
			super.update();
		}
	}
}