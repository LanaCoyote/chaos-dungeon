import * as Phaser from "phaser";

import { SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS, SCREEN_ZOOM } from "./constants";
import LevelScene from "./scenes/level/LevelScene";

class GameWindow {

    private gameInstance: Phaser.Game;

    constructor(parent?: HTMLElement|string) {
        const gameConfig: Phaser.Types.Core.GameConfig = {
            width: SCREEN_WIDTH_ABS,
            height: SCREEN_HEIGHT_ABS - 12,
            zoom: SCREEN_ZOOM,

            type: Phaser.AUTO,
            parent,

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

        this.gameInstance = new Phaser.Game(gameConfig)
        console.log("game started");
    }

}

// do this in the www bundle
window.onload = () => {
    console.log("loaded game bundle");
    const game = new GameWindow('game-window');
};