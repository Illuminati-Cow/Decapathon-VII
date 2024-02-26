"use strict"
class Hud extends Phaser.Scene {
    constructor(sceneName) {
        super({key: sceneName, visible: false});
        this.name = sceneName;
    }

    init() {

    }

    /**
     * Do not override without still calling this function
     */
    openHud() {
        this.scene.wake(this.name);
        this.scene.setVisible(true, this.name);
        //Menu.sceneManagerPlugin.bringToTop(this.name);
        //console.log(this.name);
    }

    /**
     * Do not override without still calling this function
     */
    closeHud() {
        this.scene.setVisible(false, this.name);
        //Menu.sceneManagerPlugin.setActive(false, this);
        this.scene.sleep(this.name);
    }
}