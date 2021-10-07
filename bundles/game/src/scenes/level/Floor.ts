import { Scene, Tilemaps } from "phaser";

import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_WIDTH, TILE_HEIGHT } from "../../constants";
import Room from "./Room";

export interface IRoomPlacementStruct {
    top: number;
    left: number;
    width: number;
    height: number;
}

export default class Floor {
    private active: boolean;
    private floorNumber: number;
    private tilesetName: string;
    private scene: Scene;

    private currentRoomIndex: number;
    private roomData: Array<Room>;
    private roomPlacements: Array<IRoomPlacementStruct>;

    public tilemap: Tilemaps.Tilemap;
    private tileset: Tilemaps.Tileset;

    constructor(scene: Scene, floorNumber: number, tilesetName: string) {
        this.active = false;
        this.scene = scene;
        this.floorNumber = floorNumber;
        this.tilesetName = tilesetName;
    }

    public activate() {
        if (!this.tilemap) this.loadTilemap();

        this.active = true;
    }

    public deactivate() {
        if (this.tilemap) this.unloadTilemap();

        this.active = false;
    }

    public addRoom(roomPlacement: IRoomPlacementStruct|string): Room {
        if (typeof roomPlacement === "string") {
            const parts = roomPlacement.split(" ");
            roomPlacement = {
                top: parseInt(parts[0]),
                left: parseInt(parts[1]),
                width: parseInt(parts[2]),
                height: parseInt(parts[3])
            }
        }

        const roomKey = this.toNiceString() + `Room${this.roomData.length}`;
        const room = new Room(this.scene, roomPlacement.width * SCREEN_WIDTH, roomPlacement.height * SCREEN_HEIGHT, roomKey);

        // want to put the room data as far up and left as possible, so loop through the array
        // OPTIMIZE: this runs O(n) complexity each time, could be half as fast with a bin search
        // i'm sure this could be one million times smarter
        let i = 0;
        for (; i < this.roomPlacements.length; ++i) {
            if (roomPlacement.top >= this.roomPlacements[i].top && roomPlacement.left >= this.roomPlacements[i].left) {
                break;
            }
        }
        this.roomPlacements.splice(i, 0, roomPlacement);
        this.roomData.splice(i, 0, room);

        return room;
    }

    public getCurrentRoom() {
        return this.roomData[this.currentRoomIndex];
    }

    public moveToRoomAt(x: number, y: number) {

    }

    public toNiceString(): string {
        if (this.floorNumber < 0) {
            return `B${Math.abs(this.floorNumber)}`;
        } else {
            return `F${this.floorNumber + 1}`;  // american style
        }
    }

    private changeToRoom(index: number) {
        
    }

    private loadTilemap() {
        this.tilemap = Tilemaps.ParseToTilemap(
            this.scene,
            `tilemaps/${this.toNiceString()}`,
            TILE_WIDTH, TILE_HEIGHT,
            undefined,undefined,[
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            ],true
        );

        this.tileset = this.tilemap.addTilesetImage(
            this.tilesetName,
            `tilesets/${this.tilesetName}`,
            TILE_WIDTH, TILE_HEIGHT
        );

        this.tilemap.createLayer(0, this.tileset);
        this.tilemap.setCollision(1, true, true, 0, true);
    }

    private unloadTilemap() {
        this.tilemap.destroy();
        delete this.tilemap;
    }

}