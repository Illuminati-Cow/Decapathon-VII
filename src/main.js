/**
 * @type{Phaser.Core.Config}
 */
const config = {
    type: Phaser.WEBGL,
    width: 832,
    height: 468,
    scene: [Preload, UIManager, Load, MainGame],
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: {x: 0, y: 0},
        },
    },
}

const game = new Phaser.Game(config)

const Settings = {
    width: config.width,
    height: config.height,
}