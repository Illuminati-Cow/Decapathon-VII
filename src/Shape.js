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
    static board = [7][8];
    static pieceSize = 32;
    static displaySize = 32;

    constructor(scene, shape, x, y, fallIncrement=1000, lockBuffer=500) {
        super(scene, x, y, shapes[shape]);
        scene.add.existing(this);
        this.width = Shape.pieceSize;
        this.height = Shape.pieceSize;
        this.orientation = 1;
        this.shape = shape;
        this.X = 4;
        this.Y = 8;
        this.isFalling = false;
        this.fallIncrement = fallIncrement;
        this.isActivePiece = false;
        this.lockBuffer = lockBuffer;
        /** @type {Phaser.Types.Time.TimerEventConfig} */
        this.lockEventConfig = {
            delay: this.fallIncrement,
            paused: false,
            repeat: 0,
            callback: () => {
                this.isFalling = false;
                this.isActivePiece = false;
                this.lockEvent = null;
                this.scene.events.emit('piecelocked');
            }
        };
        this.lockEvent = null;
    }

    beginFall() {
        this.isFalling = true;
        this.#fall();
    }

    flip() {
        if (!this.anims.isPlaying) {
            this.orientation = -this.orientation;
            this.anims.play(this.shape + "-flip-" + (this.orientation == 1 ? "left" : "right"), true);
        }
    }

    // 1 for right and -1 for left
    shift(direction) {
        if (!this.isActivePiece) return;

        if (!this.anims.isPlaying) {
            this.X += direction;
        }
    }

    canFall() {
        if (board[this.X][this.Y - 1] != undefined) {
            return false;
        }
        return true;
    }

    #fall() {
        this.scene.time.delayedCall(this.fallIncrement, () => {
            if (!this.isActivePiece) return;

            if (this.canFall()) {
                this.isFalling = true;
                this.Y -= 1;
                if (this.lockEvent != null) {
                    this.scene.time.removeEvent(this.lockEvent);
                    this.lockEvent = null;
                }
            }
            else {
                this.isFalling = false;
                if (this.lockEvent == null) {
                    this.lockEvent = this.scene.time.addEvent(this.lockEventConfig);
                }
            }
            this.#fall();
        });
    }

    #gridStep(x=0, y=0) {
        this.Y += y;
        this.X += x;
        this.x = this.X * this.width;
        this.y = this.Y * this.width;
    }

    setToGameSize() {
        this.width = Shape.pieceSize;
        this.height = Shape.pieceSize;
    }

    setToDisplaySize() {
        this.width = Shape.displaySize;
        this.height = Shape.displaySize;
    }


}