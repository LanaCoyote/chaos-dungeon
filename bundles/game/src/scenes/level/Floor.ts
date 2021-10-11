import { Geom, Scene, Tilemaps } from "phaser";

import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_WIDTH, TILE_HEIGHT } from "../../constants";
import Room from "./Room";

export default class Floor {
    private active: boolean;
    private floorNumber: number;
    private tilesetName: string;
    private scene: Scene;

    private currentRoom: Room;
    private roomData: Array<Room>;

    public tilemap: Tilemaps.Tilemap;
    private tileset: Tilemaps.Tileset;

    constructor(scene: Scene, floorNumber: number, tilesetName: string) {
        this.active = false;
        this.scene = scene;
        this.floorNumber = floorNumber;
        this.tilesetName = tilesetName;

        this.roomData = [];
    }

    public activate() {
        if (!this.tilemap) this.loadTilemap();

        this.active = true;
    }

    public deactivate() {
        if (this.tilemap) this.unloadTilemap();

        this.active = false;
    }

    public addRoom(roomPlacement: Geom.Rectangle|string): Room {
        if (typeof roomPlacement === "string") {
            const parts = roomPlacement.split(" ");
            roomPlacement = new Geom.Rectangle(
                parseInt(parts[0]),
                parseInt(parts[1]),
                parseInt(parts[2]),
                parseInt(parts[3])
            );
        }

        const roomKey = this.toNiceString() + `Room${this.roomData.length}`;
        const room = new Room(this.scene, roomPlacement, roomKey);

        // want to put the room data as far up and left as possible, so loop through the array
        // OPTIMIZE: this runs O(n) complexity each time, could be half as fast with a bin search
        // i'm sure this could be one million times smarter
        let i = 0;
        for (; i < this.roomData.length; ++i) {
            if (roomPlacement.top < this.roomData[i].rect.top || roomPlacement.left < this.roomData[i].rect.left) {
                break;
            }
        }
        this.roomData.splice(i, 0, room);

        return room;
    }

    public getCurrentRoom() {
        return this.currentRoom;
    }

    public getRoomAt(x: number, y: number): Room|null {
        // this could be faster as a binary search
        for (let room of this.roomData) {
            if (room.rect.contains(x, y)) return room;
        }

        return null;
    }

    public setCurrentRoom(room: Room) {
        this.currentRoom = room;
    }

    public toNiceString(): string {
        if (this.floorNumber < 0) {
            return `B${Math.abs(this.floorNumber)}`;
        } else {
            return `F${this.floorNumber + 1}`;  // american style
        }
    }

    private loadTilemap() {
        this.tilemap = Tilemaps.ParseToTilemap(
            this.scene,
            `tilemaps/${this.toNiceString()}`,
            TILE_WIDTH, TILE_HEIGHT
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