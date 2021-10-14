import { Math as Vector, Physics, Scene } from "phaser";

import Actor from "./Actor";
import { ITEMCLASS } from "../../controllers/inventory/constants";
import ItemData, { WeaponData } from "../../controllers/inventory/items/ItemData";
import TouchDamageWeaponController from "../../controllers/damage/TouchDamageWeaponController";
import LevelScene from "../../scenes/level/LevelScene";

export default class Equipment extends Actor {

    public static living: Equipment[] = [];

    public body: Physics.Arcade.Body;
    public scene: LevelScene;

    public class: ITEMCLASS;
    public damage: TouchDamageWeaponController;
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
        this.body.onOverlap = true;

        this.damage = new TouchDamageWeaponController(this, item as unknown as WeaponData); // bad
        this.damage.activate();

        Equipment.living.push( this );
        console.log(Equipment.living);

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
        this.setTexture( `actors/${item.texture}` );
        this.class = item.class;
        this.item = item;
        this.damage.data = (item as unknown as WeaponData);

        this.item.onEquip( this );

        this.setAngle(0);
        this.body.reset(this.x, this.y);
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