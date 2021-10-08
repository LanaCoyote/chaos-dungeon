import { Scene, Types, Geom, Math } from "phaser";

import Floor from "./Floor";
import Actor from "../../objects/actors/Actor";
import Hero from "../../objects/actors/Hero";
import Flicker from "../../effects/Flicker";

import { SCREEN_HEIGHT, SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS, TILE_HEIGHT, TILE_WIDTH } from "../../constants";

export default class LevelScene extends Scene {

    private currentFloor: number;
    private floors: Array<Floor>;

    constructor() {
        const sceneConfig: Types.Scenes.SettingsConfig = {};
        super(sceneConfig);

        this.floors = [];
        this.currentFloor = 0;
    }

    public getCurrentFloor() {
        return this.floors[this.currentFloor];
    }

    public preload() {
        this.load.image("tilesets/placeholder_tiles", "tiles");
        this.load.image("actors/hero", "bear");
        this.load.image("actors/item/sword", "static/sword.png");
        this.load.tilemapCSV("tilemaps/F1", "level/f1.csv");
        this.load.json("data/level", "level/data.json");
    }

    public create() {

        // create a floor
        const f1 = new Floor(this, 0, "placeholder_tiles");
        // const startingRoom = f1.addRoom(new Geom.Rectangle(0, 0, SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS));
        // f1.addRoom(new Geom.Rectangle(0, SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS));
        // f1.addRoom(new Geom.Rectangle(SCREEN_WIDTH_ABS, 0, SCREEN_WIDTH_ABS * 2, SCREEN_HEIGHT_ABS * 2));
        // f1.addRoom(new Geom.Rectangle(SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS * 2, SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS * 3));
        // f1.addRoom(new Geom.Rectangle(SCREEN_WIDTH_ABS * 2, SCREEN_HEIGHT_ABS * 2, SCREEN_WIDTH_ABS * 2, SCREEN_HEIGHT_ABS));
        // f1.addRoom(new Geom.Rectangle(SCREEN_WIDTH_ABS * 2, SCREEN_HEIGHT_ABS * 3, SCREEN_WIDTH_ABS * 2, SCREEN_HEIGHT_ABS * 2));
        // f1.setCurrentRoom(startingRoom);

        const levelData: any[] = this.cache.json.get("data/level");
        console.dir(levelData);
        levelData.forEach((room,i) => {
            const newRoom = f1.addRoom(`${room.p.x * SCREEN_WIDTH_ABS} ${room.p.y * SCREEN_HEIGHT_ABS} ${room.p.w * SCREEN_WIDTH_ABS} ${room.p.h * SCREEN_HEIGHT_ABS}`);
            if (i === 0) f1.setCurrentRoom(newRoom);
        });

        this.floors.push(f1);

        this.floors[0].activate();

        const player = new Hero(this, new Math.Vector2(f1.getCurrentRoom().rect.centerX, f1.getCurrentRoom().rect.centerY));
        player.addToDisplayList();
        player.addToUpdateList();
        (window as any).hero = player;

        // setInterval(() => new Flicker(player), 3000);

        this.physics.add.collider(player, f1.tilemap.getLayer(0).tilemapLayer);

    }

    public update(time: number, delta: number) {

        Actor.updateActors(time, delta);

    }

}