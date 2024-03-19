"use strict"

class MainMenu extends Menu {
    constructor() {
        super("MainMenu", false);
    }

    create()
    {
        this.sound.add('bgm').play({loop: true, volume: 0.2});
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

        let comboButton = new Button(
            this,
            -70,
            150,
            150,
            60,
            "COMBOS",
            () => {
                UIManager.Instance.openMenu("ComboMenu");
                comboButton.clearTint();
                this.scene.pause(this.name);
            },
            null,
            'center'
        );

        let creditsButton = new Button(
            this,
            -250,
            150,
            150,
            60,
            "CREDITS",
            () => {
                UIManager.Instance.openMenu("CreditsMenu");
                creditsButton.clearTint();
                this.scene.pause(this.name);
            },
            null,
            'center'
        );
    }
}