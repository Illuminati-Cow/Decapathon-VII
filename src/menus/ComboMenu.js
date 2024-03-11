"use strict"

class ComboMenu extends Menu {
    constructor() {
        super("ComboMenu", false);
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
                this.events.emit('combomenuclosed');
                if (this.scene.get('MainMenu').scene.isPaused())
                    this.scene.resume('MainMenu');
            },
            null,
            'topleft'
        );
    }
}