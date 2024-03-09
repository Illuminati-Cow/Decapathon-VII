"use strict"

class MainMenu extends Menu {
    constructor() {
        super("MainMenu", false);
    }

    create()
    {
        this.add.image(0,0,'menuscreen').setOrigin(0);
        let startButton = new Button(
            this,
            -160,
            50,
            150,
            60,
            "PLAY",
            () => {this.scene.launch("Load"); this.closeMenu();},
            null,
            'center'
        );
    }
}