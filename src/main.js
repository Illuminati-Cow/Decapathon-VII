/** Decapathon VII
 * Cole Falxa-Sturken
 * 2024
 * For this project I extensively used tweens, timers, callbacks,
 * bitmap text, layered scenes, custom scene classes and realtime
 * scene management and more. My use of layered scenes allowed me
 * to easily create UI elements like the combo screen that I can
 * pop up in any other scene easily and manager through the use of
 * my UI singleton. The tweens and timers allowed me to create juicy
 * animations and effects such as when the pieces combo they fly off
 * the screen and the score pops up.
 * 
 * Credits:
 * Piece Score SFX: https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=124476
 * Piece Lock SFX: Pixabay https://pixabay.com/sound-effects/button-8-88355/
 * Game Skull Background Art Traced and Painted by Jack Tonoyan
 * Main Menu Background Art Sourced from Bojack Horseman
 */

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
