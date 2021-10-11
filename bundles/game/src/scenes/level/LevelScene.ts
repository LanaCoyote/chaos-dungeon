import { Scene, Types, Geom, Math as Vector, GameObjects } from "phaser";

import Floor from "./Floor";
import Actor from "../../objects/actors/Actor";
import Hero from "../../objects/actors/Hero";
import Enemy from "../../objects/actors/Enemy";
import Jelly from "../../controllers/ai/enemies/Jelly";
import JellyKing from "../../controllers/ai/enemies/JellyKing";
import InventoryController from "../../controllers/inventory/InventoryController";
import Curtain from "../../effects/Curtain";
import { EVENTS as DAMAGE_EVENTS } from "../../controllers/damage/constants";

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
        this.load.image("actors/hero", "static/bear.png");
        this.load.image("actors/item/sword", "static/sword.png");
        this.load.image("actors/item/shield", "static/shield.png");

        this.load.image("actors/enemy/jelly", "static/jelly.png");
        this.load.image("actors/enemy/jelly_king", "static/jelly_king.png");

        this.load.spritesheet('vfx/dustcloud', 'static/dustcloud.png', {frameWidth: 24});

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

        const player = new Hero(this, new Vector.Vector2(f1.getCurrentRoom().rect.centerX, f1.getCurrentRoom().rect.bottom - TILE_HEIGHT));
        player.addToDisplayList();
        player.addToUpdateList();
        
        this.physics.add.collider(player, f1.tilemap.getLayer(0).tilemapLayer);

        const spawnArea = Geom.Rectangle.CopyFrom( f1.getCurrentRoom().rect , new Geom.Rectangle());
        const jellies: Enemy<any>[] = [];
        spawnArea.x += 120;
        spawnArea.y += 96;
        spawnArea.width -= 240;
        spawnArea.height -= 192;
        for (let i = 0; i < 16; ++ i) {
            const point = spawnArea.getRandomPoint();
            const jelly = new Enemy(this, new Vector.Vector2(point.x, point.y), new Jelly());
            jelly.addToDisplayList();
            jellies.push(jelly);
            const sword = InventoryController.EquippedItems[0];
            this.physics.add.overlap(sword, jelly);
            this.physics.add.overlap(jelly, player);
        }

        // const point = spawnArea.getRandomPoint();
        // const jellyKing = new Enemy(this, new Vector.Vector2(point.x, point.y), new JellyKing());
        // jellyKing.addToDisplayList();

        // const jelly = new GameObjects.Sprite(this, f1.getCurrentRoom().rect.centerX + 48, f1.getCurrentRoom().rect.centerY + 24, "actors/jelly");
        // jelly.addToDisplayList();

        // const jelly_king = new GameObjects.Sprite(this, f1.getCurrentRoom().rect.centerX + 96, f1.getCurrentRoom().rect.centerY + 18, "actors/jelly_king");
        // jelly_king.addToDisplayList();

        new Curtain(this, player, undefined, 2500, false).fadeIn();

        // setInterval(() => {
        //     const index = Math.floor(Math.random() * jellies.length);
        //     console.log(index);
        //     if (index >= jellies.length) return;
        //     console.log(jellies[index]);
        //     jellies[index].emit(DAMAGE_EVENTS.TAKE_DAMAGE, 1000, 1, player);
        // }, 1000);

        setTimeout(() => {
            f1.tilemap.putTilesAt([[1,1],[1,1]], 49, 39, true)
        }, 2000)
    }

    public update(time: number, delta: number) {

        Actor.updateActors(time, delta);

    }

}