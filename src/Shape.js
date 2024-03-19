/**
 * @typedef {shapes}
 */
const shapes = [
    'rectangle',
    'squiggle',
    'triangle'
]

const OFFSCREEN_X = -500
const OFFSCREEN_Y = -500

class Shape extends Phaser.GameObjects.Sprite {
    static board = Array(7).fill().map(() => Array(7).fill(null));
    static pieceScale;
    static displayScale;
    static pieceSize;
    static softDropIncrement;

    constructor(scene, shape, x, y, fallIncrement=1000, lockBuffer=500) {
        super(scene, x, y, shape);
        scene.add.existing(this);
        let scoreSound = scene.sound.add('score');
        this.orientation = 1;
        this.shape = shape;
        this.isFalling = false;
        this.fallIncrement = fallIncrement;
        this.isActivePiece = false;
        this.lockBuffer = lockBuffer;
        this.X;
        this.Y;
        this.softDropping = false;
        /** @type {Phaser.Types.Time.TimerEventConfig} */
        this.lockEventConfig = {
            delay: this.fallIncrement,
            paused: false,
            repeat: 0,
            callback: () => {
                // If this piece can still fall do not lock
                if (this.canFall()) return;

                this.isFalling = false;
                this.isActivePiece = false;
                this.lockEvent = null;
                this.scene.tweens.add({
                    targets: this,
                    scaleX: Shape.pieceScale * 0.8,
                    scaleY: Shape.pieceScale * 0.8,
                    duration: 200,
                    yoyo: true,
                });
                console.log("Locked");
                this.scene.events.emit('piecelocked');
            }
        };
        this.lockEvent = null;
        
        /** @type {Phaser.Types.Tweens.TweenBuilderConfig} */
        this.destroyedTween = {
            targets: this,
            scaleX: 0,
            scaleY: 0,
            x: this.x + 50,
            y: this.y + 50,
            alpha: 0.2,
            delay: Phaser.Math.Between(0, 300),
            onUpdate: () => {
                this.angle += 2;
            },
            duration: 300,
            onComplete: () => {
                scoreSound.play();
                super.destroy();
            }
        }
    }

    #fallTime = 0;
    update() {
        if (Date.now() > this.#fallTime + this.fallIncrement) {
            this.#fallTime = Date.now();
            this.#fall();
            console.log(this.X, this.Y);
        }
        this.#checkCollision();
    }

    activate (X, Y) {
        this.isActivePiece = true;
        Shape.board[X][Y] = this;
        this.X = X;
        this.Y = Y;
        this.isFalling = true;
        this.#fallTime = Date.now();
    }

    flip() {
        if (!this.scene.tweens.isTweening(this) && this.isActivePiece) {
            this.orientation = -this.orientation;
            let rot = this.rotation + Math.PI / 2;
            this.scene.tweens.add({
                targets: this,
                rotation: rot,
                duration: 200,
                ease: 'Bounce'
            });
        }
    }

    /** 1 for right and -1 for left
     * @returns {boolean} Whether the piece can shift in the given direction
     *  */ 
    canShift(direction) {
        if (direction == 1) {
            if (this.X + 1 > 6) {
                return false;
            }
            if (Shape.board[this.X + 1][this.Y] != undefined) {
                return false;
            }
        }
        else if (direction == -1) {
            if (this.X - 1 < 0) {
                return false;
            }
            if (Shape.board[this.X - 1][this.Y] != undefined) {
                return false;
            }
        }
        return true;
    }

    /**
     * Shift piece left or right.
     * 1 for right and -1 for left
    */ 
    shift(direction) {
        if (!this.isActivePiece) return;

        if (!this.anims.isPlaying && this.canShift(direction)) {
            this.#gridStep(direction, 0);
        }
    }


    /**
     * Moves the shape down by one grid cell.
     * @returns {void}
     */
    softDrop() {
        if (!this.isActivePiece) return;
        if (this.softDropping) return;
        if (!this.canFall()) return;
        this.#gridStep(0, -1);
        this.softDropping = true;
        this.#fallTime = Date.now();
        this.scene.time.delayedCall(Shape.softDropIncrement, () => {
            this.softDropping = false;
        });
    }

    canFall() {
        if (this.Y - 1 < 0) {
            return false;
        }
        if (Shape.board[this.X][this.Y - 1] != undefined) {
            return false;
        }
        return true;
    }

    #fall() {
        if (!this.isActivePiece) return;
        console.log("Falling");
        if (this.canFall()) {
            this.isFalling = true;
            this.#gridStep(0, -1);
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
    }

    #checkCollision() {
        if (!this.isActivePiece) return;

        if (this.Y - 1 < 0) {
            if (this.lockEvent == null) {
                this.lockEvent = this.scene.time.addEvent(this.lockEventConfig);
            }
        }
        else if (Shape.board[this.X][this.Y - 1] != undefined) {
            if (this.lockEvent == null) {
                this.lockEvent = this.scene.time.addEvent(this.lockEventConfig);
            }
        }
        else {
            this.scene.time.removeEvent(this.lockEvent);
            this.lockEvent = null;
        }
    }

    /**
     * Moves the shape on the grid by the specified amount.
     * 
     * @private
     * @param {number} [x=0] - The amount to move the shape horizontally.
     * @param {number} [y=0] - The amount to move the shape vertically.
     */
    #gridStep(x=0, y=0) {
        Shape.board[this.X][this.Y] = undefined;
        this.Y += y;
        this.X += x;
        this.x += x * Shape.pieceSize;
        this.y -= y * Shape.pieceSize;
        Shape.board[this.X][this.Y] = this;
    }

    setToGameSize() {
        this.setScale(Shape.pieceScale, Shape.pieceScale);
    }

    setToDisplaySize() {
        this.setScale(Shape.displayScale, Shape.displayScale);
    }

    /**
     * Returns the grid position of the shape.
     * @returns {Object} The grid position of the shape, with properties `x` and `y`.
     */
    getGridPosition() {
        return {x: this.X, y: this.Y};
    }

    /**
     * Get the shape of the object.
     * @returns {string} The shape of the object.
     */
    getShape() {
        return this.shape;
    }

    /**
     * Get the orientation of the shape.
     * @returns {number} The orientation value.
     */
    getOrientation() {
        return this.orientation;
    }

    /**
     * Returns the entire row the shape is in.
     * @returns {Array.<Shape>} The board row.
     */
    getBoardRow() {
        return Shape.getBoardRow(this.Y);
    }

    /**
     * Returns the entire column the shape is in.
     * @returns {Array.<Shape>} The board column.
     */
    getBoardCol() {
        return Shape.board[this.X];
    }

    /**
     * Returns the entire diagonal the shape is in.
     * The diagonal is ordered from bottom-left to top-right.
     * @returns {Array.<Shape>} The board diagonal.
     */
    getDiagonal() {
        return Shape.getBoardDiagonal(this.X, this.Y);
    }

    /**
     * Returns the entire anti-diagonal the shape is in.
     * The anti-diagonal is ordered from top-left to bottom-right.
     * @returns {Array.<Shape>} The board anti-diagonal.
     */
    getAntiDiagonal() {
        return Shape.getBoardAntiDiagonal(this.X, this.Y);
    }

    /**
     * Get the board of the shape.
     * @returns {Array.<Shape>} The board of the shape.
     */
    static getBoard() {
        return Shape.board;
    }


    /**
     * Retrieves a specific row from the board.
     *
     * @param {number} row - The index of the row to retrieve.
     * @returns {Array.<Shape>} - An array containing the elements of the specified row.
     * @throws {Error} - If the row index is out of bounds.
     */
    static getBoardRow(row) {
        if (row < 0 || row > 6) throw new Error("Row out of bounds");
        let out = [];
        for (let i = 0; i < Shape.board.length; i++) {
            out.push(Shape.board[i][row]);
        }
        return out;
    }

    /**
     * Retrieves the board column at the specified index.
     * @param {number} col - The index of the column to retrieve.
     * @returns {Array.<Shape>} - The board column at the specified index.
     * @throws {Error} - If the column index is out of bounds.
     */
    static getBoardCol(col) {
        if (col < 0 || col > 6) throw new Error("Column out of bounds");
        return Shape.board[col];
    }

    /**
     * Retrieves the diagonal elements from the board starting from the given coordinates.
     * @param {number} x - The starting x-coordinate.
     * @param {number} y - The starting y-coordinate.
     * @returns {Array.<Shape>} - An array containing the diagonal elements from the board.
     * @error {Error} - If the row or column index is out of bounds.
     */
    static getBoardDiagonal(x, y) {
        if (x < 0 || x > 6 || y < 0 || y > 6) throw new Error("Coordinates out of bounds");
        let out = [];
        const oX = x;
        const oY = y;
        while (x < 7 && y < 7) {
            out.push(Shape.board[x][y]);
            x++;
            y++;
        }
        x = oX;
        y = oY;
        while (x >= 0 && y >= 0) {
            out.push(Shape.board[x][y]);
            x--;
            y--;
        }
        return out;
    }

    /**
     * Retrieves the anti-diagonal elements from the board starting from the given coordinates.
     * @param {number} x - The x-coordinate of the starting position.
     * @param {number} y - The y-coordinate of the starting position.
     * @returns {Array.<Shape>} - An array containing the anti-diagonal elements.
     * @throws {Error} - If the row or column index is out of bounds.
     */
    static getBoardAntiDiagonal(x, y) {
        if (x < 0 || x > 6 || y < 0 || y > 6) throw new Error("Coordinates out of bounds");
        let out = [];
        const oX = x;
        const oY = y;
        while (x < 7 && y >= 0) {
            out.push(Shape.board[x][y]);
            x++;
            y--;
        }
        x = oX;
        y = oY;
        while (x >= 0 && y < 7) {
            out.push(Shape.board[x][y]);
            x--;
            y++;
        }
        return out;
    }

    destroy(cleared=false) {
        if (this.lockEvent != null) {
            this.scene.time.removeEvent(this.lockEvent);
        }
        if (!cleared) {
            this.scene.tweens.killTweensOf(this);
            this.scene.tweens.add(this.destroyedTween);
        }
        else {
            super.destroy();
        }
    }

}