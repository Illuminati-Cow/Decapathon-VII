"use strict"

class ComboMenu extends Menu {
    constructor() {
        super("ComboMenu", false);
    }

    create()
    {
        this.add.nineslice(
            Settings.width / 2, 
            1.25 * Settings.height / 2, 
            'box', 
            0, 
            Settings.width / 2, 
            3 * Settings.height / 4, 
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

        let combos = this.add.image(closeButton.x+15,closeButton.y+15,'combos').setOrigin(0);
        combos.setDisplaySize(100);
        combos.setScale(0.5);
    }
}