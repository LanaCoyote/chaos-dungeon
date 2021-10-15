import { Scene, Types, Geom, Math as Vector, GameObjects, Scale } from "phaser";

import Floor from "./Floor";
import Actor from "../../objects/actors/Actor";
import Hero from "../../objects/actors/Hero";
import Enemy from "../../objects/actors/Enemy";
import Pickup from "../../objects/actors/Pickup";
import Jelly from "../../controllers/ai/enemies/Jelly";
import JellyKing from "../../controllers/ai/enemies/JellyKing";
import InventoryController from "../../controllers/inventory/InventoryController";
import Curtain from "../../effects/Curtain";
import UICamera from "../../objects/ui/UICamera";
import GameUI from "../../objects/ui/GameUI";
import { EVENTS as DAMAGE_EVENTS } from "../../controllers/damage/constants";

import { SCREEN_HEIGHT, SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS, TILE_HEIGHT, TILE_WIDTH } from "../../constants";
import { EnemyGroup } from "./Room";
import Ralsei from "../../controllers/ai/enemies/Ralsei";

export default class LevelScene extends Scene {

    private currentFloor: number;
    private floors: Array<Floor>;
    private gameUI: GameUI;

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
        this.load.image("actors/ralsei", "static/ralsei.png");
        this.load.image("actors/item/pickups", "static/pickups.png");
        this.load.image("actors/item/sword", "static/sword.png");
        this.load.image("actors/item/shield", "static/shield.png");
        this.load.image("actors/item/joint", "static/joint.png")

        this.load.image("actors/enemy/jelly", "static/jelly.png");
        this.load.image("actors/enemy/jelly_king", "static/jelly_king.png");

        this.load.spritesheet('vfx/dustcloud', 'static/dustcloud.png', {frameWidth: 24});
        this.load.spritesheet('ui/icons', 'static/icons.png', {frameWidth: 18});
        this.load.image("ui/itemframe", 'static/itemframe.png');
        this.load.image("ui/selection", "static/item_selection.png");

        this.load.tilemapCSV("tilemaps/F1", "level/f1.csv");
        this.load.json("data/level", "level/data.json");

        // this.scale.scaleMode = Scale.RESIZE;
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

        // const testEnemyData: EnemyGroup[] = [{
        //     EnemyDataClass: Jelly,
        //     count: 8
        // }];

        levelData.forEach((room,i) => {
            const enemyData: EnemyGroup[] = [];
            if (room.e && room.e instanceof Array) {
                room.e.forEach((enemyGroupDef: any) => {
                    enemyData.push({
                        EnemyDataClass: enemyGroupDef.i === 1 ? Ralsei : Jelly,
                        count: enemyGroupDef.c || 1
                    });
                });
            }

            const newRoom = f1.addRoom(`${room.p.x * SCREEN_WIDTH_ABS} ${room.p.y * SCREEN_HEIGHT_ABS} ${room.p.w * SCREEN_WIDTH_ABS} ${room.p.h * SCREEN_HEIGHT_ABS}`, enemyData);
            if (i === 0) f1.setCurrentRoom(newRoom);
        });

        this.floors.push(f1);

        this.floors[0].activate();

        const player = new Hero(this, new Vector.Vector2(f1.getCurrentRoom().rect.centerX, f1.getCurrentRoom().rect.bottom - TILE_HEIGHT * 2));
        player.addToDisplayList();
        player.addToUpdateList();
        
        this.physics.add.collider(player, f1.tilemap.getLayer(0).tilemapLayer);

        const sword = InventoryController.EquippedItems[0];
        const shield = InventoryController.EquippedItems[1];

        // const spawnArea = Geom.Rectangle.CopyFrom( f1.getCurrentRoom().rect , new Geom.Rectangle());
        // const jellies: Enemy<any>[] = [];
        // spawnArea.x += 120;
        // spawnArea.y += 96;
        // spawnArea.width -= 240;
        // spawnArea.height -= 192;
        // for (let i = 0; i < 3; ++ i) {
        //     const point = spawnArea.getRandomPoint();
        //     const jelly = new Enemy(this, new Vector.Vector2(point.x, point.y), new Jelly());
        //     jelly.addToDisplayList();
        //     jellies.push(jelly);
            
        //     this.physics.add.overlap(sword, jelly);
        //     this.physics.add.overlap(shield, jelly);
        //     this.physics.add.overlap(jelly, player);
        // }

        // const point = spawnArea.getRandomPoint();
        // const jellyKing = new Enemy(this, new Vector.Vector2(point.x, point.y), new JellyKing());
        // jellyKing.addToDisplayList();

        // const jelly = new GameObjects.Sprite(this, f1.getCurrentRoom().rect.centerX + 48, f1.getCurrentRoom().rect.centerY + 24, "actors/jelly");
        // jelly.addToDisplayList();

        // const jelly_king = new GameObjects.Sprite(this, f1.getCurrentRoom().rect.centerX + 96, f1.getCurrentRoom().rect.centerY + 18, "actors/jelly_king");
        // jelly_king.addToDisplayList();

        new Curtain(this, player, undefined, 2500, false).fadeIn();

        const uiCamera = new UICamera();
        this.cameras.addExisting( uiCamera );
        uiCamera.ignore(f1.tilemap.layers.map( layer => layer.tilemapLayer ));

        this.gameUI = new GameUI(this, uiCamera);

        setTimeout(() => {
            // f1.tilemap.putTilesAt([[1,1],[1,1]], 49, 39, true)
            f1.getCurrentRoom().activate();
        }, 1000)
    }

    public update(time: number, delta: number) {

        Actor.updateActors(time, delta);

        this.gameUI.update(time, delta);

    }

}