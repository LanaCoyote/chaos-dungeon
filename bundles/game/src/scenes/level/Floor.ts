import { BlendModes, Geom, Scene, Tilemaps } from "phaser";

import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_WIDTH, TILE_HEIGHT, IMPORTANT_TILES, DEPTH_ALWAYSFRONT, LAYER_WATER, LAYER_LOWER, LAYER_OBSTACLE } from "../../constants";
import Room, {EnemyGroup} from "./Room";
import LowerArea from "./zones/LowerArea";
import Pit from "./zones/Pit";
import Wall from "./zones/Wall";

export default class Floor {
    private active: boolean;
    private floorNumber: number;
    private tilesetName: string;
    private scene: Scene;

    private currentRoom: Room;
    private roomData: Array<Room>;

    public tilemap: Tilemaps.Tilemap;
    private tileset: Tilemaps.Tileset;
    private waterTileset: Tilemaps.Tileset;
    private waterWaving: boolean;

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

        setInterval(() => {
            if (!this.waterTileset) return;

            if (this.waterWaving) {
                for (let i = 10; i < 20; ++i) {
                    this.tilemap.swapByIndex(i, i-10, undefined, undefined, undefined, undefined, LAYER_WATER);
                }
                this.waterWaving = false;
            } else {
                for (let i = 0; i < 10; ++i) {
                    this.tilemap.swapByIndex(i, i+10, undefined, undefined, undefined, undefined, LAYER_WATER);
                }
                this.waterWaving = true;
            }
        }, 800);
    }

    public deactivate() {
        if (this.tilemap) this.unloadTilemap();

        this.active = false;
    }

    public addRoom(roomPlacement: Geom.Rectangle|string, enemyGroups: EnemyGroup[]): Room {
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
        const room = new Room(this.scene, roomPlacement, roomKey, enemyGroups);

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

        this.waterTileset = this.tilemap.addTilesetImage(
            "water",
            "tilesets/placeholder_water",
            TILE_WIDTH, TILE_HEIGHT
        );

        this.tilemap.createLayer(0, this.tileset);
        this.tilemap.setCollision(IMPORTANT_TILES.WALL, true, true, 0, true);

        // create special layers
        // lower layer
        const lowerLayer = this.tilemap.createBlankLayer(LAYER_LOWER, this.tileset);
        lowerLayer.setCollision(IMPORTANT_TILES.LOWER_WALL);

        // water layer
        // TODO: actual data, not test shit

        const waterLayer = this.tilemap.createBlankLayer(LAYER_WATER, this.waterTileset);
        // waterLayer.setAlpha( 0.9 );
        // waterLayer.setBlendMode( BlendModes.ADD );
        waterLayer.setCollisionBetween(0, 10, true);

        new LowerArea(new Geom.Rectangle(1056, 792, 168, 168), this.tilemap, true);
        const otherpit = new LowerArea(new Geom.Rectangle(1296, 624, 600, 336), this.tilemap, false);
        otherpit.addStaircase( lowerLayer.putTileAt( 2, 57, 26 ) );
        otherpit.addStaircase( lowerLayer.putTileAt( 2, 57, 39 ) );
        otherpit.addStaircase( lowerLayer.putTileAt( 2, 74, 39 ) );

        new Wall(new Geom.Rectangle(1464, 960, 144, 120), this.tilemap);
        new Wall(new Geom.Rectangle(1464, 360, 144, 264), this.tilemap);
        new Wall(new Geom.Rectangle(1008, 648, 144, 144), this.tilemap);
        new Wall(new Geom.Rectangle(1896, 648, 120, 144), this.tilemap);

        this.tilemap.putTilesAt([
            [ 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0],
            [ 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
            [ 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0],
            [ 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
            [11, 0, 0, 11, 0, 0, 0, 12, 0, 0, 12],
            [ 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
            [11, 0, 0, 11, 0, 0, 0, 12, 0, 0, 12],
            [ 0, 0, 0,  0, 5, 5, 5,  0, 0, 0, 0],
            [11, 0, 5, 11, 5, 5, 5, 12, 5, 0, 12],
            [ 0, 0, 5,  5, 5, 5, 5,  5, 5, 0, 0]
        ], 47, 48, true, 0 );

        // obstacle layer
        this.tilemap.setLayer(0);
        const obstacleTiles = this.tilemap.filterTiles((tile: Tilemaps.Tile) => IMPORTANT_TILES.OBSTACLE.includes(tile.index));
        const obstacleLayer = this.tilemap.createBlankLayer(LAYER_OBSTACLE, this.tileset);
        obstacleTiles.forEach((tile: Tilemaps.Tile) => obstacleLayer.putTileAt(tile, tile.x, tile.y));
        obstacleLayer.setCollision(IMPORTANT_TILES.OBSTACLE);

        new Pit(new Geom.Rectangle(1464, 648, 72, 288), this.tilemap);

        // overhead layer
        this.tilemap.setLayer(0);
        const overheadTiles = this.tilemap.filterTiles((tile: Tilemaps.Tile) => IMPORTANT_TILES.OVERHEAD.includes(tile.index));
        const overheadLayer = this.tilemap.createBlankLayer('overhead', this.tileset);
        overheadTiles.forEach((tile: Tilemaps.Tile) => overheadLayer.putTileAt(tile, tile.x, tile.y));
        overheadLayer.setDepth(Number.MAX_SAFE_INTEGER);
        this.tilemap.setLayer(0);
    }

    private unloadTilemap() {
        this.tilemap.destroy();
        delete this.tilemap;
    }

}