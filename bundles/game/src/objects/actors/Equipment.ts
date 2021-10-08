import { Math as Vector, Physics, Scene } from "phaser";

import Actor from "./Actor";
import { ITEMCLASS } from "../../controllers/inventory/constants";
import ItemData from "../../controllers/inventory/items/ItemData";
import LevelScene from "../../scenes/level/LevelScene";

export default class Equipment extends Actor {

    public body: Physics.Arcade.Body;
    public scene: LevelScene;

    public class: ITEMCLASS;
    public holding: boolean;
    public item: ItemData;
    public user: Actor;

    constructor( scene: Scene, user: Actor, item?: ItemData ) {
        if (item) {
            super( scene, new Vector.Vector2( user.x, user.y ), item.texture );

            this.class = item.class;
            this.item = item;
        } else {
            super( scene, new Vector.Vector2( user.x, user.y ), "" );

            this.class = ITEMCLASS.NULL;
            this.item = null;
        }

        this.user = user;
        this.holding = false;
        this.setVisible(false);
        this.addToDisplayList();
        this.addToUpdateList();

        this.scene.physics.add.existing(this);
        this.body.setCircle(12);
        this.body.setImmovable(true);

        // this.scene.physics.add.overlap(this, this.scene.getCurrentFloor().tilemap.getLayer(0).tilemapLayer, () => this.onTouch());
        // this.body.onOverlap = true;
        // this.scene.physics.world.on("overlap", () => console.log("donk"));

        if (this.item) {
            this.item.onEquip( this );
        }
    }

    public onHold(delta: number) {
        if (!this.item) return;
        this.item.onHold(this, delta);
    }

    public onRelease() {
        if (!this.item) return;
        this.holding = false;
        this.item.onRelease(this);
    }

    public onShoot() {
        if (!this.item) return;
        this.holding = true;
        this.item.onShoot(this);
    }

    public onTouch() {
        if (!this.item) return;
        this.item.onTouch(this);
    }

    public setItem( item: ItemData ) {
        this.setTexture( item.texture );
        this.class = item.class;
        this.item = item;

        this.item.onEquip( this );
    }

    public update( time: number, delta: number ) { 
        if (this.item) {
            this.item.onUpdate(this, delta);

            // const tilemapCollider = this.scene.getCurrentFloor().tilemap.getLayer(0).tilemapLayer;
            // this.scene.physics.collide(this, tilemapCollider, () => this.onTouch());
        }
        
        if (this.holding) this.onHold(delta);
    }

}