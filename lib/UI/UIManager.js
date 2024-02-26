"use strict"
import { default as Menu } from "./Menu";
import {default as Hud} from "./Hud";

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
    constructor(menus, huds, startingMenu=null, startingHUD=null) {
        if (this.Instance != null) {
            return null
        } else {
            UIManager.Instance = this;
        }
        super('UI');
        // Create blue effect scene so that scenes that have the BlurBackground setting
        // Will have this scene open underneath them and have a gaussian blur effect
        this.#menu._BlurEffect = this.scene.launch(this.scene.add("_BlurEffect", {visible: false}))
        for (let menu in menus) {
            this.#menu.menu = this.scene.launch(this.scene.add(menu, { visible: false }));
        }
        for (let hud in  huds) {
            this.#hud.hud = this.scene.launch(this.scene.add(hud, { visible: false }));
        }

        // Set starting Menu and Hud
        if (startingMenu)
            this.#currentMenu = this.#menu[startingMenu]
        else
            this.#currentMenu = null;
        if (startingHUD)
            this.#currentHUD = this.#hud[startingHUD]
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
            this.#currentMenu = this.#menu[newMenu]
            this.#currentMenu.openMenu();
            if (this.#currentMenu.blurBackground) {
                this.#menu._BlurEffect
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