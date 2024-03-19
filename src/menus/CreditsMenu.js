"use strict"

class CreditsMenu extends Menu {
    constructor() {
        super("CreditsMenu", false);
    }

    create()
    {
        this.add.nineslice(
            Settings.width / 2, 
            Settings.height / 2, 
            'box', 
            0, 
            Settings.width / 2, 
            Settings.height / 2, 
            5, 5, 5, 5
        ).setOrigin(0.5);

        let closeButton = new Button(
            this,
            145,
            90,
            25,
            25,
            "X",
            () => {
                this.closeMenu(); 
                this.events.emit('creditsmenuclosed');
                if (this.scene.get('MainMenu').scene.isPaused())
                    this.scene.resume('MainMenu');
            },
            null,
            'topleft'
        );

        let credits = this.add.bitmapText(closeButton.x, closeButton.y+20, 'retroFont', 
            'Credits\n Background Art Traced &\nPainted by Jack Tonoyan\n SFX from Pixabay'
            + '\nSprites by Cole Falxa-Sturken\nProgramming by Cole Falxa-Sturken', 
            15
        );

    }
}