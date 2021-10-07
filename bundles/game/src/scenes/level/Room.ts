import { Scene } from "phaser";

import { TILE_WIDTH, TILE_HEIGHT } from "../../constants";

export default class Room {

    private active: Boolean;
    private scene: Scene;
    private key: string;

    private width: number;
    private height: number;

    constructor(scene: Scene, width: number, height: number, key: string) {
        this.active = false;

        this.scene = scene;
        this.width = width;
        this.height = height;
        this.key = key;
    }

    public activate() {
        this.active = true;
    }

    public deactivate() {
        this.active = false;
    }

    public toString(): string {
        return `[Room ${this.key}]`;
    }

}