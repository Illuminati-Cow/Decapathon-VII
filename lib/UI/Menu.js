"use strict"
class Menu extends Phaser.Scene {
    constructor(sceneName, blurBgOnOpen=false) {
        super({key: sceneName, visible: false});
        this.name = sceneName;
        this.blurBackground = blurBgOnOpen;
    }
    
    // Put the scene to sleep after being created
    init() {
        this.scene.sleep(this.name);
    }

    /**
     * Do not override without still calling this function
     */
    /**
     * Opens the menu.
     * @param {boolean} [openOnTop=true] - Indicates whether to open the menu on
     * top of other menus or not.
     */
    openMenu(openOnTop=true) {
        this.scene.wake(this.name);
        if (openOnTop)
            this.scene.bringToTop(this.name);
        this.scene.setVisible(true, this.name);
    }

    /**
     * Do not override without still calling this function
     */
    closeMenu() {
        this.scene.setVisible(false, this.name);
        this.scene.sleep(this.name);
    }
}

export default Menu;