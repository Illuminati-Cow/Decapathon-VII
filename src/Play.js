
class MainGame extends Phaser.Scene {
    constructor() {
        super('MainGame');
    }

    create()
    {
        // Create layer for game scene to be rendered on
        // This allows VFX to apply to every object in the scene
        this.layer = this.add.layer();
    }
}