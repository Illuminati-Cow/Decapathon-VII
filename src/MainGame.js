"use strict";

class MainGame extends Phaser.Scene {
    spawnX = Settings.width/2;
    spawnY = 110;

    static config = {
        fallStepMs: 1000,
        tomTimeMs: 350,
        levelDurationMs: 10000,
        pieceDelayMs: 1000,
        maxLevel: 100,
        endFallStepMs: 250,
        endTomTimeMs: 150,
        endPieceDelayMs: 300,
        clearDelay: 100,
    }

    static combos = {
        
    }

    constructor() {
        super('MainGame');
    }

    create()
    {
        this.scene.sendToBack(this);
        const width = Settings.width;
        const height = Settings.height;
        this.cameras.main.setBackgroundColor('#27276d');
        // Create layer for game scene to be rendered on
        // This allows VFX to apply to every object in the scene
        this.layer = this.add.layer();
        this.layer.setDepth(0);
        // Create game objects
        this.gameBox = this.add.nineslice(width/2,height,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 1);
        this.gameBox.width = width/2;
        this.gameBox.height = 4*height/5;
        this.gameBox.y -= height/25;
        this.layer.add(this.gameBox);

        this.levelBox = this.add.nineslice(width/8, height/4,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.levelBox.width = width/5;
        this.levelBox.height = height/6;
        this.layer.add(this.levelBox);

        this.playerBox = this.add.nineslice(7*width/8, height/4,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.playerBox.width = width/5;
        this.playerBox.height = height/6;
        this.layer.add(this.playerBox);

        this.pieceBox = this.add.nineslice(7*width/8, 7*height/10,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.pieceBox.width = width/7;
        this.pieceBox.height = height/4;
        this.layer.add(this.pieceBox);
        
        this.scoreText = this.add.text(width/2 - 50, 40, "00000", {fontSize: '32px', fill: '#fff'}).setOrigin(0.5, 0.5);
        this.layer.add(this.scoreText);
        
        let div = this.add.rectangle(width/2, 60, width, 10, 0x9137cd).setOrigin(0.5, 0.5);
        this.layer.add(div);
        this.startTime = Date.now();
        this.startDelay = 1000;
        this.gameRunning = false;
        
        this.gameOverBox = this.add.nineslice(width/2, height/2, 'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.gameOverBox.width = width/4;
        this.gameOverBox.height = height/4;
        this.gameOverBox.visible = false;
        this.gameOverBox.setDepth(1);
        this.layer.add(this.gameOverBox);
        
        this.gameOverText = this.add.text(width/2, height/2, "Game Over", {fontSize: '32px', fill: '#fff'}).setOrigin(0.5, 0.5);
        this.gameOverText.visible = false;
        this.gameOverText.setDepth(1);
        this.layer.add(this.gameOverText);

        // Gameplay variables
        this.pieceDelayMs = MainGame.config.pieceDelayMs; // Delay after scoring piece to spawn next piece
        this.fallStepMs = MainGame.config.fallStepMs; // Delay between piece falling one step
        this.tomTimeMs = MainGame.config.tomTimeMs; // Time it takes for a piece to lock into position
        this.level = 1; // Current level
        Shape.pieceScale = (1/Settings.spriteSize) * (this.gameBox.width/8);
        Shape.displayScale = (1/Settings.spriteSize) * (3*this.pieceBox.width/4);
        Shape.pieceSize = Settings.spriteSize * Shape.pieceScale;
        Shape.softDropIncrement = MainGame.config.endFallStepMs;

        // Their tweens
        this.fallStepTween = this.tweens.addCounter({
            ease: 'Sine',
            from: MainGame.config.fallStepMs,
            to: MainGame.config.endFallStepMs,
            duration: MainGame.config.levelDurationMs * MainGame.config.maxLevel,
        });
        this.tomTimeTween = this.tweens.addCounter({
            ease: 'Sine',
            from: MainGame.config.tomTimeMs,
            to: MainGame.config.endTomTimeMs,
            duration: MainGame.config.levelDurationMs * MainGame.config.maxLevel,
        });
        this.pieceDelayTween = this.tweens.addCounter({
            ease: 'Linear',
            from: MainGame.config.pieceDelayMs,
            to: MainGame.config.endPieceDelayMs,
            duration: MainGame.config.levelDurationMs * MainGame.config.maxLevel,
        });

        // Game state variables
        this.gameOver = false;
        /** @type {Shape} */
        this.nextPiece = null;
        this.activePiece = null;
        this.score = 0;

        // Start game on key press after set delay
        this.input.keyboard.on('keydown', (event) => {this.events.emit('startgame')});
        this.events.addListener('startgame', () => this.startGame());

        // Add listener for piece locking
        this.events.addListener('piecelocked', () => {
            //this.checkForCombos();
            this.activePiece = null;
            this.spawnShape();
        });

        // Add listener for shift input
        this.input.keyboard.on('keydown', (event) => {
            
            
            if (!this.gameRunning) return;
            // Gameplay input
            if (this.activePiece == null) return;

            if (event.key == "ArrowLeft") {
                this.activePiece.shift(-1);
                console.log("Shifted Left");
            } else if (event.key == "ArrowRight")  {
                this.activePiece.shift(1);
                console.log("Shifted Right");
            }
        });

        // Add listener for rotation input
        this.input.keyboard.on('keydown', (event) => {
            if (!this.gameRunning) return;
            // Gameplay input
            if (this.activePiece == null) return;

            if (event.key == "ArrowUp") {
                this.activePiece.flip();
                console.log("Flipped");
            }
        });

        // Add listener for game over
        this.events.addListener('gameover', () => this.endGame());

        this.keys = this.input.keyboard.addKeys('W,S,A,D,UP,DOWN,LEFT,RIGHT,SPACE,ENTER');
    }

    // MAIN UPDATE LOOP
    update() {
        if (!this.gameRunning) return;
        // Update game variables
        this.easeGameValues();
        this.processInput();
        this.updateScoreText();
    }

    checkForCombos(piece) {
        
    }

    updateScoreText() {
        this.scoreText.setText(this.score.toString().padStart(5, "0"));
    }

    clearBoard(i=0, j=0) {

        if (i >= Shape.board.length) return;

        let clearDelay = MainGame.config.clearDelay;

        if (Shape.board[i][j] != null) {
            Shape.board[i][j].destroy();
            Shape.board[i][j] = null;
            console.log("Cleared piece at " + i + ", " + j);
        }
        else {
            clearDelay = 0;
            console.log("No piece at " + i + ", " + j);
        }

        if (j >= Shape.board[i].length) {
            this.time.delayedCall(clearDelay, () => this.clearBoard(i+1, 0));
        } 
        else {
            this.time.delayedCall(clearDelay, () => this.clearBoard(i, j+1));
        }

        if (i == Shape.board.length-1 && j == Shape.board[i].length-1) {
            console.log("Board cleared");
            this.events.emit('boardcleared');
        }
    }

    // Interpolate game variables from min->max based on level
    easeGameValues() {
        this.fallStepMs = this.fallStepTween.getValue();
        this.tomTimeMs = this.tomTimeTween.getValue();
        this.pieceDelayMs = this.pieceDelayTween.getValue();
    }

    processInput() {
        if (!this.gameRunning) return;
        if (this.activePiece == null) return;

        // Gameplay input
        if (this.input.keyboard.checkDown(this.keys.DOWN, Shape.softDropIncrement)) {
            this.activePiece.softDrop();
        }
    }

    // Move the displayed shape to fall, set it active, and call
    // the next shape to be displayed
    spawnShape() {
        this.activePiece = this.nextPiece;
        if (Shape.board[3][6] != null) {
            this.events.emit('gameover');
            return;
        }
        this.tweens.killTweensOf(this.nextPiece);
        this.activePiece.setPosition(this.spawnX, this.spawnY);
        this.activePiece.beginFall();
        this.activePiece.setToGameSize();
        this.activePiece.isActivePiece = true;
        this.nextDisplayPiece();
    }

    /**
     * Returns a randomly chosen shape from the available shapes.
     * @returns {string} The randomly chosen shape.
     */
    chooseRandomShape() {
        return shapes[Math.floor(Math.random()*shapes.length)];
    }

    // Select the next shape to spawn and display it, creating a new shape
    nextDisplayPiece() {
        // Display the next piece to spawn
        let shape = this.chooseRandomShape();
        let piece = new Shape(this, shape, this.pieceBox.x, this.pieceBox.y, this.fallStepMs, this.tomTimeMs);
        piece.scale = 0.05;
        this.tweens.add({
            targets: piece,
            scaleX: Shape.displayScale,
            scaleY: Shape.displayScale,
            ease: 'Bounce',
            duration: 500,
        });
        this.nextPiece = piece;
        this.layer.add(this.nextPiece);
    }

    startGame() {
        if (Date.now() - this.startTime > this.startDelay && !this.gameRunning) {
            console.log("Game Started");
            this.clearBoard();
            this.score = 0;
            this.updateScoreText();
            this.gameOver = false;
            this.tweens.add({
                targets: this.gameOverBox,
                once: true,
                scaleX: 0.05,
                scaleY: 0.05,
                ease: 'Quintic',
                duration: 500,
                onComplete: () => {this.gameOverBox.visible = false;},
            });
            this.tweens.add({
                targets: this.gameOverText,
                once: true,
                scaleX: 0.05,
                scaleY: 0.05,
                ease: 'Quintic',
                duration: 500,
                onComplete: () => {this.gameOverText.visible = false;},
            });
            this.events.once('boardcleared', () => this.nextDisplayPiece());
            this.events.once('boardcleared', () => this.spawnShape());
            this.gameRunning = true;
        }
    }

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.activePiece.isActivePiece = false;
        this.activePiece = null;
        this.nextPiece.destroy();
        this.nextPiece = null;
        console.log("Game Over");
        this.gameOverBox.visible = true;
        this.gameOverText.visible = true;
        this.tweens.add({
            targets: this.gameOverBox,
            once: true,
            scaleX: 1,
            scaleY: 1,
            ease: 'Bounce',
            duration: 750,
        });
        this.tweens.add({
            targets: this.gameOverText,
            once: true,
            scaleX: 1,
            scaleY: 1,
            ease: 'Bounce',
            duration: 750,
        });
        this.startTime = Date.now();
    }
}