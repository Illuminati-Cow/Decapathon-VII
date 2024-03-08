/**
 * @typedef {shapes}
 */
const shapes = {
    rectangle : 'Rectangle',
    squiggle  : 'Squiggle',
    triangle  : 'Triangle'
}

const OFFSCREEN_X = -500
const OFFSCREEN_Y = -500

class Shape extends Phaser.GameObjects.Sprite {
    constructor(shape, scene, x=OFFSCREEN_X, y = OFFSCREEN_Y) {
        super(scene, x, y, shape);
        this.orientation = 1;
        this.shape = shape;
    }

    flip() {
        if (!this.anims.isPlaying) {
            this.orientation = -this.orientation;
            this.anims.play(this.shape + "-flip-" + (this.orientation == 1 ? "left" : "right"), true);
        }
    }
}