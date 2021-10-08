import { Geom, Math, Scene } from "phaser";

import { SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS } from "../../constants";

const MINIMUM_EXPECTED_WIDTH = SCREEN_WIDTH_ABS;
const MINIMUM_EXPECTED_HEIGHT = SCREEN_HEIGHT_ABS;

export default class Room {

    public rect: Geom.Rectangle;

    private active: Boolean;
    private scene: Scene;
    private key: string;

    constructor(scene: Scene, rect: Geom.Rectangle, key: string) {
        this.active = false;

        this.scene = scene;
        this.rect = rect;
        this.key = key;

        if (rect.width < MINIMUM_EXPECTED_WIDTH || rect.height < MINIMUM_EXPECTED_HEIGHT) {
            console.error("Creating a room of size (%d x %d) smaller than minimum size (%d x %d)",
                this.rect.width, this.rect.height, MINIMUM_EXPECTED_WIDTH, MINIMUM_EXPECTED_HEIGHT);
        }
    }

    public activate() {
        this.active = true;
    }

    public deactivate() {
        this.active = false;
    }

    public isInsideRoom(bounds: Geom.Rectangle): boolean {
        return Geom.Rectangle.ContainsRect(this.rect, bounds);
    }

    public getExitVector(bounds: Geom.Rectangle): Math.Vector2 {
        // this logic requires that the rectangles are partially overlapping
        // it would be smarter to use a perimeter point
        if (this.rect.contains(bounds.left, bounds.top)) {
            if (this.rect.contains(bounds.left, bounds.bottom)) {
                return Math.Vector2.RIGHT;
            } else {
                return Math.Vector2.DOWN;
            }
        } else {
            if (this.rect.contains(bounds.right, bounds.top)) {
                return Math.Vector2.LEFT;
            } else {
                return Math.Vector2.UP;
            }
        }
    }

    public toString(): string {
        return `[Room ${this.key}]`;
    }

}