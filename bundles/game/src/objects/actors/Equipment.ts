import { Math as Vector, Scene } from "phaser";

import Actor from "./Actor";
import { ITEMCLASS } from "../../controllers/inventory/constants";
import ItemData from "../../controllers/inventory/items/ItemData";

export default class Equipment extends Actor {

    public class: ITEMCLASS;
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
        // this.setVisible(false);

        this.scene.physics.add.existing(this);
    }

    public onHold() {
        this.item.onHold(this);
    }

    public onRelease() {
        this.item.onRelease(this);
    }

    public onShoot() {
        this.item.onShoot(this);
    }

    public setItem( item: ItemData ) {
        this.texture = this.scene.textures.get( item.texture );
        this.class = item.class;
        this.item = item;
    }

}