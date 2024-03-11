/**
 * @type{Phaser.Core.Config}
*/
const config = {
    type: Phaser.WEBGL,
    width: 832,
    height: 468,
    scene: [Preload, UIManager, Load, MainGame],
    pixelArt: false,
    roundPixels: true,
    antialiasGL: true,
}

var Settings = {
    width: config.width,
    height: config.height,
    spriteSize: 160
}
    
const game = new Phaser.Game(config)
