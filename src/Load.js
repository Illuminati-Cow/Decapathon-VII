class Load extends Phaser.Scene {
    constructor() {
        super('Load');
        this.progressBar;
        this.progressBox;
    }

    init () {
        // Progress Bar
        this.progressBox = this.add.graphics();
        this.progressBar = this.add.graphics();
        let boxConfig = {
            x: gameSettings.width/2-gameSettings.width/4, 
            y: gameSettings.height/2-gameSettings.height/10, 
            width: gameSettings.width/2, 
            height: gameSettings.height/10
        }
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(boxConfig.x, boxConfig.y, boxConfig.width, boxConfig.height);
    }

    /**
     * Loads all assets needed in the game.
     */
    preload() {
        // Update progress bar based on load status
        this.load.on('progress', (progress) => {
            // this.progressBarInternal.setVisible(true)
            // this.progressBarInternal.scaleX(progress)
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffffff, 1);
            let barConfig = {
                x: gameSettings.width/2-gameSettings.width/4+5, 
                y: gameSettings.height/2-gameSettings.height/10+5, 
                width: gameSettings.width/2-10, 
                height: gameSettings.height/10-10
            }
            this.progressBar.fillRect(barConfig.x, barConfig.y, barConfig.width * progress, barConfig.height);
        });
        // Load assets
        this.load.path = './assets/'
        // Shapes
        this.load.image('triangle', 'decap_Triangle.png');
        this.load.image('Squiggle', 'decap_Squiggle.png');
        this.load.image('Rectangle', 'decap_Rectangle.png');
    }
    /**
     * Creates all global assets needed in the game.
     */
    create() {
        this.add.image(0,0,'loadscreen').setOrigin(0.5)
    }
}