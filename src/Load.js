class Load extends Phaser.Scene {
    constructor() {
        super('Load');
    }

    /**
     * Loads all assets needed in the game.
     */
    preload() {
        // Load assets
        this.load.path = './assets/'
        // Shapes
        this.load.image('triangle', 'decap_Triangle.png');
        this.load.image('squiggle', 'decap_Squiggle.png');
        this.load.image('rectangle', 'decap_Rectangle.png');
        this.load.image('box', 'decap_Box.png');
        this.load.image('bg', 'decap_BG.png');
        this.load.audio('smallCombo', 'sfx/decap_SmallCombo.wav')
        this.load.audio('lock', 'sfx/decap_PieceLock.mp3')
        this.load.audio('score', 'sfx/decap_Score.mp3')
    }
    /**
     * Creates all global assets needed in the game.
     */
    create() {
        let loadscreen = this.add.image(0,0,'loadscreen').setOrigin(0);
        // Fake progress bar taking one second to load
        let progressBar = this.add.image(77,255,'progressBar').setOrigin(0).setScale(0,1);
        let left = this.add.image(0,0,'loadscreenLeft').setOrigin(0).setVisible(false);
        let right = this.add.image(0,0,'loadscreenRight').setOrigin(0).setVisible(false); 
        this.tweens.add({
            targets: progressBar,
            scaleX: 1,
            duration: 1000,
            ease: 'Sine',
            onComplete: () => {
                left.setVisible(true);
                right.setVisible(true);
                progressBar.setVisible(false);
                loadscreen.setVisible(false);
                this.events.emit('tweencomplete');
                this.scene.launch("MainGame");
            }
        });
        this.events.addListener('tweencomplete', () => {
            this.tweens.add({
                targets: left,
                x: -Settings.width/2 - 25,
                duration: 1000,
                ease: 'Cubic'
            });
            this.tweens.add({
                targets: right,
                x: Settings.width/2,
                duration: 1000,
                ease: 'Cubic',
                onComplete: () => {
                    this.scene.stop("Load");
                }
            });
        });
    }
}