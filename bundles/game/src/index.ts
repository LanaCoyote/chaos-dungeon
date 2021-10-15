import * as Phaser from "phaser";

import { SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS, SCREEN_ZOOM } from "./constants";
import LevelScene from "./scenes/level/LevelScene";

const gameConfig: Phaser.Types.Core.GameConfig = {
    scale: {
        width: SCREEN_WIDTH_ABS,
        height: SCREEN_HEIGHT_ABS,
        // width: "100%",
        // height: "95%",
        mode: Phaser.Scale.ScaleModes.FIT,
        expandParent: false,
        zoom: Phaser.Scale.Zoom.ZOOM_2X,
        // zoom: SCREEN_ZOOM,
        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
    },
    
    type: Phaser.AUTO,

    render: {
        pixelArt: true
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    scene: LevelScene
};

class GameWindow {

    private gameInstance: Phaser.Game;
    private config: Phaser.Types.Core.GameConfig;

    constructor(parent?: HTMLElement|string) {
        this.config = Object.assign({parent}, gameConfig);
        console.log(this.config);
        this.reload();
    }

    reload() {
        if (this.gameInstance) this.gameInstance.destroy(true);
        setTimeout( () => {
            this.gameInstance = new Phaser.Game(this.config);
            (window as any).isRunningCanvas = this.gameInstance.renderer.type === Phaser.CANVAS;
        });
    }

}

// do this in the www bundle
window.addEventListener("load", () => {
    console.log("loaded game bundle");
    (window as any).game = new GameWindow('game-window');
});

document.addEventListener('contextmenu', (ev) => {
    if ((ev.target as HTMLElement).tagName.toUpperCase() === "CANVAS") {
        ev.preventDefault();
    }
});