"use strict"

class MainMenu extends Menu {
    constructor() {
        super("MainMenu", false);
    }

    create()
    {
        let startButton = new Button(
            this,
            0,
            50,
            25,
            25,
            "PLAY",
            () => {this.scene.launch("Load"); this.closeMenu();},
            null,
            'center'
        );
    }
}