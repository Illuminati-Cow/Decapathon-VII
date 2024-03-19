"use strict";

class MainGame extends Phaser.Scene {
    spawnX = Settings.width/2;
    spawnY = 110;

    static config = {
        fallStepMs: 700,
        tomTimeMs: 300,
        levelDurationMs: 10000,
        pieceDelayMs: 500,
        maxLevel: 100,
        endFallStepMs: 200,
        endTomTimeMs: 150,
        endPieceDelayMs: 300,
        clearDelay: 100,
        softDropIncrementMs: 50,
    }

    static combos = {
        vertical: [
            {score: 100, sequence: ['squiggle', 'squiggle', 'squiggle']},
        ],
        diagonal: [
            {score: 400, sequence: ['rectangle', 'rectangle', 'rectangle']},
        ],
        antiDiagonal: [
            {score: 400, sequence: ['rectangle', 'rectangle', 'rectangle']},
        ],
        horizontal: [
            {score: 1000, sequence: ['squiggle', 'squiggle', 'squiggle', 'squiggle', 'squiggle', 'squiggle', 'squiggle']},
            {score: 100, sequence: ['triangle', 'triangle', 'triangle']},
        ],
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

        let bg = this.add.image(78,0,'bg').setOrigin(0.15, 0.05);
        bg.scale = 0.55;
        this.layer.add(bg);

        // Create game objects
        this.gameBox = this.add.nineslice(width/2,height,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 1);
        this.gameBox.width = width/2;
        this.gameBox.height = 4*height/5;
        this.gameBox.y -= height/25;
        this.layer.add(this.gameBox);

        this.levelBox = this.add.nineslice(7*width/8, height/4,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.levelBox.width = width/5;
        this.levelBox.height = height/6;
        this.layer.add(this.levelBox);

        let levelText = this.add.bitmapText(7*width/8, height/4-20, "retroFont", "Level", 28).setOrigin(0.5, 0.5);
        this.layer.add(levelText);
        this.levelNumberText = this.add.bitmapText(7*width/8, height/4+15, "retroFont", "01", 28).setOrigin(0.5, 0.5);

        this.playerBox = this.add.nineslice(width/8, height/4,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.playerBox.width = width/5;
        this.playerBox.height = height/6;
        this.layer.add(this.playerBox);

        let playerText = this.add.bitmapText(width/8, height/4 - 20, "retroFont", "Player", 28).setOrigin(0.5, 0.5);
        this.layer.add(playerText);
        let playerNumberText = this.add.bitmapText(width/8, height/4+15, "retroFont", "01", 28).setOrigin(0.5, 0.5);

        this.pieceBox = this.add.nineslice(7*width/8, 7*height/10,'box', 0, 5, 5, 5, 5, 5, 5).setOrigin(0.5, 0.5);
        this.pieceBox.width = width/7;
        this.pieceBox.height = height/4;
        this.layer.add(this.pieceBox);
        
        this.scoreText = this.add.bitmapText(width/2 - 50, 30, "retroFont", "00000", 32).setOrigin(0.5, 0.5);
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
        
        this.gameOverText = this.add.bitmapText(width/2, height/2, "retroFont", "Game Over", 30).setOrigin(0.5, 0.5);
        this.gameOverText.visible = false;
        this.gameOverText.setDepth(1);
        this.layer.add(this.gameOverText);

        this.startText = this.add.bitmapText(width/2, height/5, "retroFont", "Press any key to start", 25).setOrigin(0.5, 0.5);
        this.layer.add(this.startText);

        // Gameplay variables
        this.pieceDelayMs = MainGame.config.pieceDelayMs; // Delay after scoring piece to spawn next piece
        this.fallStepMs = MainGame.config.fallStepMs; // Delay between piece falling one step
        this.tomTimeMs = MainGame.config.tomTimeMs; // Time it takes for a piece to lock into position
        this.level = 1; // Current level
        this.lastLevelUpTime = Date.now(); // Time of last level up
        Shape.pieceScale = (1/Settings.spriteSize) * (this.gameBox.width/8);
        Shape.displayScale = (1/Settings.spriteSize) * (3*this.pieceBox.width/4);
        Shape.pieceSize = Settings.spriteSize * Shape.pieceScale;
        Shape.softDropIncrement = MainGame.config.softDropIncrementMs;

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
            let comboScore = this.checkForCombos(this.activePiece);
            if (comboScore > 0) {
                this.score += comboScore;
                this.updateScoreText();
                this.comboEventPopup(comboScore);
                this.sound.play("smallCombo");
            }
            else
                this.sound.play("lock");
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
            } else if (event.key == "ArrowRight")  {
                this.activePiece.shift(1);
            }
        });

        // Add listener for rotation input
        this.input.keyboard.on('keydown', (event) => {
            if (!this.gameRunning) return;
            // Gameplay input
            if (this.activePiece == null) return;

            if (event.key == "ArrowUp") {
                this.activePiece.flip();
            }
        });

        // Add listener for game over
        this.events.addListener('gameover', () => this.endGame());

        this.keys = this.input.keyboard.addKeys('W,S,A,D,UP,DOWN,LEFT,RIGHT,SPACE,ENTER');

        this.sound.add('lock');
        this.sound.add('smallCombo');
    }

    // MAIN UPDATE LOOP
    update() {
        if (!this.gameRunning) return;
        // Update game variables
        this.easeGameValues();
        this.processInput();
        this.updateScoreText();
        if (this.activePiece != null)
            this.activePiece.update();
    }

    comboEventPopup(score, name=undefined) {
        let comboText = "";
        if (name != undefined) {
            comboText = name + "!  " + score + " pts";
        }
        else {
            comboText = "Combo!  " + score + " pts";
        }
        let comboPopup = this.add.bitmapText(Settings.width/2, this.scoreText.y + 100, 
            "retroFont", comboText, 28).setOrigin(0.5, 0.5);
        comboPopup.setDepth(1);
        comboPopup.scale = 0.1;
        comboPopup.alpha = 0;
        this.tweens.add({
            targets: comboPopup,
            alpha: 1,
            scale: 1,
            duration: 750,
            ease: 'Sine',
            yoyo: true,
            onComplete: () => {comboPopup.destroy()},
        });

    }

    /**
     * Checks for combos in the game board based on the given piece.
     * @param {Shape} piece - The piece to check for combos.
     * @returns {number} The total score of the combos found.
     */
    checkForCombos(piece) {
        let comboScore = 0;
        comboScore += this.#checkForVerticalCombo(piece);
        comboScore += this.#checkForDiagonalCombo(piece);
        comboScore += this.#checkForAntiDiagonalCombo(piece);
        comboScore += this.#checkForHorizontalCombo(piece);
        return comboScore;
    }

    /**
     * Checks for combos in the game board based on the given piece
     * in the vertical directions.
     * @param {Shape} piece - The piece to check for combos.
     * @returns {number} The total score of the combos found.
     */
    #checkForVerticalCombo(piece) {
        let combos = MainGame.combos.vertical;
        let boardCol = piece.getBoardCol();
        let vert = this.processBoardSlice(piece.getBoardCol());
        for (let combo of combos) {
            let comboSequence = combo.sequence;
            let comboScore = combo.score;
            let sequence = [];
            for (let i = 0; i < vert.length; i++) {
                // If there is an empty space in the column, reset the sequence
                if (vert[i] == null || (boardCol[i] && boardCol[i].orientation != 1)) {
                    sequence = [];
                    continue;
                }
                
                // Add the type of the piece to the sequence
                sequence.push(vert[i]);

                // Check to see if the sequence matches the combo sequence
                if (this.isArrayInArray(sequence, comboSequence)) {
                    for (let j = i; j > i - comboSequence.length; j--) {
                        if (Shape.board[piece.X][j] != null) {
                            Shape.board[piece.X][j].destroy();
                            Shape.board[piece.X][j] = null;
                        }
                    }
                        return comboScore
                }
            }
        }

        return 0;
    }
    
    /**
     * Checks for combos in the game board based on the given piece
     * in the diagonal directions.
     * @param {Shape} piece - The piece to check for combos.
     * @returns {number} The total score of the combos found.
    */
   #checkForDiagonalCombo(piece) {
        let combos = MainGame.combos.diagonal;
        let boardDiag = piece.getDiagonal();
        let diag = this.processBoardSlice(piece.getDiagonal());
        for (let combo of combos) {
            let comboSequence = combo.sequence;
            let comboScore = combo.score;
            let sequence = [];
            for (let i = 0; i < diag.length; i++) {
                // If there is an empty space in the column, reset the sequence
                if (diag[i] == null  || (boardDiag[i] && boardDiag[i].orientation != 1)) {
                    if (diag[i] != undefined && diag[i].orientation != 1)
                        console.log(diag[i].orientation);
                    sequence = [];
                    continue;
                }
                
                // Add the type of the piece to the sequence
                sequence.push(diag[i]);

                // Check to see if the sequence matches the combo sequence
                if (this.isArrayInArray(sequence, comboSequence)) {
                    for (let j = i; j > i - comboSequence.length; j--) {
                        boardDiag[j].destroy();
                        Shape.board[boardDiag[j].X][boardDiag[j].Y] = null;
                    }
                    return comboScore;
                }
            }
        }
        return 0;
    }

    /**
     * Checks for combos in the game board based on the given piece
     * in the anti-diagonal directions.
     * @param {Shape} piece - The piece to check for combos.
     * @returns {number} The total score of the combos found.
     */
    #checkForAntiDiagonalCombo(piece) {
        let combos = MainGame.combos.antiDiagonal;
        let boardDiag = piece.getAntiDiagonal();
        let diag = this.processBoardSlice(piece.getAntiDiagonal());
        for (let combo of combos) {
            let comboSequence = combo.sequence;
            let comboScore = combo.score;
            let sequence = [];
            for (let i = 0; i < diag.length; i++) {
                // If there is an empty space in the column, reset the sequence
                if (diag[i] == null  || (boardDiag[i] && boardDiag[i].orientation != -1)) {
                    sequence = [];
                    continue;
                }
                
                // Add the type of the piece to the sequence
                sequence.push(diag[i]);

                // Check to see if the sequence matches the combo sequence
                if (this.isArrayInArray(sequence, comboSequence)) {
                    for (let j = i; j > i - comboSequence.length; j--) {
                        boardDiag[j].destroy();
                        Shape.board[boardDiag[j].X][boardDiag[j].Y] = null;
                    }
                    return comboScore;
                }
            }
        }
        return 0;
    }

    /**
     * Checks for combos in the game board based on the given piece
     * in the horizontal directions.
     * @param {Shape} piece - The piece to check for combos.
     * @returns {number} The total score of the combos found.
     */
    #checkForHorizontalCombo(piece) {
        let combos = MainGame.combos.horizontal;
        let boardRow = piece.getBoardRow();
        let row = this.processBoardSlice(piece.getBoardRow());
        for (let combo of combos) {
            let comboSequence = combo.sequence;
            let comboScore = combo.score;
            let sequence = [];
            for (let i = 0; i < row.length; i++) {
                // If there is an empty space in the row, reset the sequence
                if (row[i] == null || (boardRow[i] && boardRow[i].orientation != -1)) {
                    sequence = [];
                    continue;
                }

                // Add the type of the piece to the sequence
                sequence.push(row[i]);

                // Check to see if the sequence matches the combo sequence
                if (this.isArrayInArray(sequence, comboSequence)) {
                    for (let j = i; j > i - comboSequence.length; j--) {
                        boardRow[j].destroy();
                        Shape.board[boardRow[j].X][boardRow[j].Y] = null;
                    }
                    return comboScore;
                }
            }
        }
        return 0;
    }

    // Code from Co-Pilot
    isArrayInArray(larger, smaller) {
        if (!Array.isArray(larger) || !Array.isArray(smaller)) return false;
        if (larger.length < smaller.length) return false;
        let i, j;
        for (i = 0; i < larger.length; i++) {
            if (larger[i] === smaller[0]) {
                for (j = 0; j < smaller.length; j++) {
                    if (larger[i + j] !== smaller[j]) {
                        break;
                    }
                }
                if (j === smaller.length) {
                    return true;
                }
            }
        }
        return false;
    }

    processBoardSlice(boardSlice) {
        let slice = [];
        for (let sprite of boardSlice) {
            if (sprite != null) {
                slice.push(sprite.shape);
            }
            else
                slice.push(null);
        }
        return slice;
    }

    updateScoreText() {
        this.scoreText.setText(this.score.toString().padStart(5, "0"));
    }

    clearBoard(i=0, j=0) {

        if (i >= Shape.board.length) return;

        let clearDelay = MainGame.config.clearDelay;

        if (Shape.board[i][j] != null) {
            this.tweens.add({
                targets: Shape.board[i][j],
                scaleX: 0,
                scaleY: 0,
                ease: 'Linear',
                duration: clearDelay,
                y: Shape.board[i][j].y + 100,
                onComplete: () => {
                    Shape.board[i][j].destroy(true);
                    Shape.board[i][j] = null;
                }
            });
        }
        else {
            clearDelay = 0;
        }

        if (j >= Shape.board[i].length) {
            this.time.delayedCall(clearDelay, () => this.clearBoard(i+1, 0));
        } 
        else {
            this.time.delayedCall(clearDelay, () => this.clearBoard(i, j+1));
        }

        if (i == Shape.board.length-1 && j == Shape.board[i].length-1) {
            console.log("Board cleared");
            this.time.delayedCall(clearDelay, () => this.events.emit('boardcleared'));
        }
    }

    // Interpolate game variables from min->max based on level
    easeGameValues() {
        if (Date.now() - this.lastLevelUpTime > MainGame.config.levelDurationMs) {
            this.level += 1;
            this.lastLevelUpTime = Date.now();
            this.levelNumberText.setText(this.level.toString().padStart(2, "0"));
            this.tweens.add({
                targets: this.levelNumberText,
                scaleX: 1.5,
                scaleY: 1.5,
                ease: 'Sine',
                duration: 300,
                yoyo: true,
            });
        }
        this.fallStepMs = this.fallStepTween.getValue();
        this.tomTimeMs = this.tomTimeTween.getValue();
        this.pieceDelayMs = this.pieceDelayTween.getValue();
    }

    /**
     * Process user input for the game.
     */
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
        this.activePiece.fallIncrement = this.fallStepMs;
        this.activePiece.lockBuffer = this.tomTimeMs;
        this.activePiece.setToGameSize();
        this.activePiece.activate(3, 6);
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

    // Start the game and reset all game variables
    // Play start animations
    startGame() {
        if (Date.now() - this.startTime > this.startDelay && !this.gameRunning) {
            console.log("Game Started");
            this.tweens.add({
                targets: this.startText,
                scaleX: 0.05,
                scaleY: 0.05,
                ease: 'Quintic',
                duration: 300,
                onComplete: () => {this.startText.visible = false;},
            });
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
            this.lastLevelUpTime = Date.now();
            this.gameRunning = true;
        }
    }

    // End the game and display the game over screen and restart text
    endGame() {
        // Reset game variables
        this.gameRunning = false;
        this.gameOver = true;
        this.activePiece.isActivePiece = false;
        this.activePiece = null;
        this.nextPiece.destroy(true);
        this.nextPiece = null;
        this.startTime = Date.now();
        this.lastLevelUpTime = Date.now();
        this.levelNumberText.setText("01");
        this.level = 1;
        console.log("Game Over");

        // Show game over screen
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

        // Display restart text
        this.startText.setText("Press any key to restart");
        this.startText.visible = true;
        this.startText.setDepth(1);
        this.startText.alpha = 0.2;
        this.tweens.add({
            targets: this.startText,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            ease: 'Quintic',
            duration: 500,
        });
    }
}