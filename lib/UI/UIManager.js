"use strict"

class UIManager extends Phaser.Scene {
    /**
     * @type {UIManager} - The singleton instance of UIManager.
     */
    static Instance = null;
    #menu = {};
    #hud = {};
    /**
     * @type {Menu} - The current menu open.
     */
    #currentMenu;
    /**
     * @type {Hud} - The current HUD displayed.
     */
    #currentHUD;
    
    /**
     * Represents the UIManager class. If an instance of the manager already exists, this instance will be nullified.
     * @constructor
     * @param {Array.<String>} menus - The array of menu scene names.
     * @param {Array.<String>} huds - The array of HUD scene names.
     * @param {string} [startingMenu] - The starting menu. Defaults to null.
     * @param {string} [startingHUD=null] - The starting HUD. Defaults to null.
     */
    constructor() {
        if (UIManager.Instance != null) {
            return null
        } else {
            super('UI');
            UIManager.Instance = this;
        }

    }

    init ()
    {
        let menus = {
            MainMenu: new MainMenu(),
        };
        let huds = {
            // "MainHud": MainHud
        };
        let startingMenu = "MainMenu";
        let startingHud = huds[0];
        for (let key in menus) {
            let menu = menus[key];
            this.#menu[key] = this.scene.add(key, menu);
            this.scene.launch(this.#menu[key]);
        }
        // for (let hud in huds) {
        //     hud = huds[hud];
        //     this.#hud[hud] = this.scene.add(hud, { visible: false });
        //     this.scene.launch(this.#hud[hud]);
        // }

        // Set starting Menu and Hud
        if (startingMenu)
        {
            this.time.delayedCall(20, () => this.changeMenu(startingMenu));
        }
        else
            this.#currentMenu = null;
        if (startingHud)
            this.#currentHUD = this.#hud[startingHud]
        else
            this.#currentHUD = null;
    }

    /**
     * Changes the current menu to the specified new menu.
     * @param {string} newMenu - The name of the new menu.
     * @returns {boolean} - Returns true if the menu was successfully changed, false otherwise.
     */
    changeMenu(newMenu) {
        if (newMenu in this.#menu) {
            if (this.#currentMenu)
                this.#currentMenu.closeMenu();
            this.#currentMenu = this.#menu[newMenu];
            console.log(this.#currentMenu);
            this.#currentMenu.openMenu();
            if (this.#currentMenu.blurBackground) {
                // Do blur
            }
            return true
        }
        else
            return false
    }

    /**
     * Changes the current HUD (Heads-Up Display) to the specified new HUD.
     * @param {string} newHud - The name of the new HUD.
     * @returns {boolean} - Returns true if the HUD was successfully changed, false otherwise.
     */
    changeHud(newHUD) {
        if (newHUD in this.#hud) {
            if (this.#currentHUD)
                this.#currentHUD.closeHUD()
            this.#currentHUD = newHUD
            this.#currentHUD.openHUD()
            return true
        }
        else
            return false
    }

    get currentMenu() {
        return this.#currentMenu
    }

    get currentHUD() {
        return this.#currentHUD
    }
}