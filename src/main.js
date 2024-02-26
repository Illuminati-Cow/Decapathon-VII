/**
 * @type{Phaser.Core.Config}
 */
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: ['Preload', 'Load'],
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: {x: 0, y: 0},
        },
    },
}

const game = new Phaser.Game(config)